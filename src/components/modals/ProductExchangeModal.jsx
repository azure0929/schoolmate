import React, { useState, useEffect } from "react";
import styled from "styled-components";
import axios from "axios";

const PRIMARY_COLOR = "#f86166";

// 모달 단계 정의
const STEPS = {
  CONFIRMATION: "confirmation", // 교환 확인 및 포인트 체크
  EXCHANGING: "exchanging", // 교환 처리 중 (로딩)
  RESULT: "result", // 교환 결과 (성공/실패)
};

const BASE_API_URL =
  import.meta.env.REACT_APP_API_URL || "http://localhost:9000/api";

const api = axios.create({
  baseURL: BASE_API_URL,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

/**
 * 사용자 보유 포인트 조회 API
 * @returns {Promise<number>} 보유 포인트
 */
const studentPoints = async () => {
  // /api/point-history/student/me/balance 엔드포인트 호출
  const response = await api.get("/point-history/student/me/balance");
  return response.data;
};

// 🚨 fetchUserEmail 함수는 더 이상 교환 요청에 필요하지 않으므로 제거합니다.
// (Student ID는 서버의 Spring Security를 통해 자동으로 획득됨)

const ProductExchangeModal = ({
  isOpen,
  onClose,
  selectedProduct,
  onExchangeSuccess,
}) => {
  const [currentStep, setCurrentStep] = useState(STEPS.CONFIRMATION);
  const [userPoints, setUserPoints] = useState(null);
  const [exchangeError, setExchangeError] = useState(null);
  const [exchangeSuccess, setExchangeSuccess] = useState(false);

  useEffect(() => {
    if (isOpen && selectedProduct) {
      setCurrentStep(STEPS.CONFIRMATION);
      setExchangeError(null);
      setExchangeSuccess(false);
      loadUserPoints();
    }
  }, [isOpen, selectedProduct]);

  // 사용자 보유 포인트 조회 함수
  const loadUserPoints = async () => {
    if (!localStorage.getItem("authToken")) {
      alert("로그인 정보가 유효하지 않습니다. 다시 로그인해주세요.");
      onClose();
      return;
    }

    try {
      const points = await studentPoints();
      setUserPoints(points);
    } catch (error) {
      console.error("보유 포인트 조회 실패:", error);
      setExchangeError(
        "보유 포인트 조회에 실패했습니다. (서버 연결 또는 사용자 정보 오류)",
      );
      setUserPoints(0);
    }
  };

  const needPoints = selectedProduct ? selectedProduct.productPoints : 0;
  const isExchangePossible = userPoints !== null && userPoints >= needPoints;
  const pointDifference = userPoints !== null ? userPoints - needPoints : 0;

  // 교환 요청 처리 함수 수정: /api/exchanges/{productId} 호출
  const handleExchange = async () => {
    if (!selectedProduct || !isExchangePossible) return;

    // productId는 Integer 타입이므로 형 변환이 필요하지 않도록 백엔드 컨트롤러에 맞춥니다.
    const productId = selectedProduct.productId;

    setCurrentStep(STEPS.EXCHANGING);
    setExchangeError(null);

    try {
      // 1. 상품 교환 API 호출: POST /api/exchanges/{productId}
      // 이 API는 JWT 토큰을 통해 학생 ID를 가져오므로 별도의 데이터(body)가 필요 없다.
      await api.post(`/exchanges/${productId}`);

      // 교환 성공
      setExchangeSuccess(true);
      setExchangeError(null);
      setCurrentStep(STEPS.RESULT);
      onExchangeSuccess && onExchangeSuccess();
    } catch (error) {
      console.error("상품 교환 요청 실패:", error);
      let errorMessage = "상품 교환 중 알 수 없는 오류가 발생했습니다.";

      if (error.response) {
        // 백엔드에서 400 Bad Request 또는 404 Not Found 시 에러 메시지를 body로 보냄
        if (error.response.data && typeof error.response.data === "string") {
          // 서버에서 보낸 에러 메시지(예: "사용 가능한 포인트가 부족합니다.") 사용
          errorMessage = error.response.data;
        } else if (error.response.status === 400) {
          errorMessage = "유효하지 않은 요청입니다. (포인트 부족 등)";
        } else if (error.response.status === 404) {
          errorMessage = "해당 상품을 찾을 수 없습니다.";
        } else {
          errorMessage = `서버 오류 (${error.response.status})가 발생했습니다.`;
        }
      } else if (error.request) {
        errorMessage = "네트워크 연결 오류가 발생했습니다.";
      }

      setExchangeError(errorMessage);
      setExchangeSuccess(false);
      setCurrentStep(STEPS.RESULT);
    }
  };

  const renderButton = () => {
    switch (currentStep) {
      case STEPS.CONFIRMATION:
        if (userPoints === null) {
          return (
            <SubmitButton type="button" disabled>
              포인트 확인 중...
            </SubmitButton>
          );
        } else if (isExchangePossible) {
          return (
            <SubmitButton type="button" onClick={handleExchange}>
              교환하기
            </SubmitButton>
          );
        } else {
          return (
            <SubmitButton type="button" disabled>
              포인트 부족
            </SubmitButton>
          );
        }
      case STEPS.EXCHANGING:
        return (
          <SubmitButton type="button" disabled>
            교환 처리 중...
          </SubmitButton>
        );
      case STEPS.RESULT:
        return (
          <SubmitButton type="button" onClick={onClose}>
            확인
          </SubmitButton>
        );
      default:
        return null;
    }
  };

  if (!isOpen || !selectedProduct) return null;

  return (
    <div>
      <ModalOverlay onClick={onClose} />
      <ModalContent>
        <ModalTitle>상품 교환 확인</ModalTitle>
        <ProductInfoWrap>
          <ModalImage
            src={selectedProduct.imageUrl}
            alt={selectedProduct.productName}
          />
          <ProductName>{selectedProduct.productName}</ProductName>
        </ProductInfoWrap>

        <PointSummary>
          <PointRow>
            <PointLabel>보유 포인트:</PointLabel>
            <PointValue $color="black">
              {userPoints === null
                ? "확인 중..."
                : new Intl.NumberFormat().format(userPoints) + "P"}
            </PointValue>
          </PointRow>
          <PointRow>
            <PointLabel>차감 포인트:</PointLabel>
            <PointValue $color={PRIMARY_COLOR}>
              - {new Intl.NumberFormat().format(needPoints) + "P"}
            </PointValue>
          </PointRow>
          <Divider />
          <PointRow>
            <PointLabel $isTotal>교환 후 잔액:</PointLabel>
            <PointValue
              $color={pointDifference < 0 ? PRIMARY_COLOR : "black"}
              $isTotal
            >
              {userPoints === null
                ? "계산 불가"
                : new Intl.NumberFormat().format(Math.max(0, pointDifference)) +
                  "P"}
            </PointValue>
          </PointRow>
        </PointSummary>

        {/* 결과 메시지 (빨간 글자 처리) */}
        {currentStep === STEPS.RESULT && (
          <ResultText $isSuccess={exchangeSuccess}>
            {exchangeSuccess
              ? "상품 교환이 성공적으로 완료되었습니다!"
              : `교환 실패: ${exchangeError || "알 수 없는 오류"}`}
          </ResultText>
        )}

        {/* 교환 불가 메시지 (CONFIRMATION 단계에서 포인트 부족 시) */}
        {currentStep === STEPS.CONFIRMATION &&
          userPoints !== null &&
          !isExchangePossible && (
            <ResultText $isSuccess={false}>포인트가 부족합니다.</ResultText>
          )}

        {renderButton()}

        <CloseButton
          onClick={onClose}
          disabled={currentStep === STEPS.EXCHANGING}
        >
          &times;
        </CloseButton>
      </ModalContent>
    </div>
  );
};

export default ProductExchangeModal;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 900;
`;

const ModalContent = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 30px;
  padding-top: 50px;
  border-radius: 36px;
  width: 554px;
  background-color: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  z-index: 901;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
`;

const ModalTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: #191919;
  margin-bottom: 20px;
`;

const ProductInfoWrap = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 30px;
  width: 364px;
`;

const ModalImage = styled.img`
  width: 150px;
  height: 150px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid #ccc;
  margin-bottom: 10px;
`;

const ProductName = styled.p`
  font-size: 1.125rem;
  font-weight: 600;
  color: #333;
  text-align: center;
  margin: 5px 0 0 0;
`;

const PointSummary = styled.div`
  width: 80%;
  max-width: 350px;
  padding: 15px 20px;
  border: 1px solid #eee;
  border-radius: 8px;
  background-color: #f9f9f9;
`;

const PointRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 10px 0;
`;

const PointLabel = styled.span`
  font-size: ${(props) => (props.$isTotal ? "1.1rem" : "1rem")};
  font-weight: ${(props) => (props.$isTotal ? "700" : "500")};
  color: #555;
`;

const PointValue = styled.span`
  font-size: ${(props) => (props.$isTotal ? "1.1rem" : "1rem")};
  font-weight: ${(props) => (props.$isTotal ? "700" : "600")};
  color: ${(props) => props.$color || "#191919"};
`;

const Divider = styled.div`
  height: 1px;
  background-color: #e0e0e0;
  margin: 10px 0;
`;

const ResultText = styled.p`
  margin-top: 20px;
  font-size: 1.1rem;
  font-weight: 600;
  /* 교환 불가/실패 시 PRIMARY_COLOR (빨강) 적용 */
  color: ${(props) => (props.$isSuccess ? "#4CAF50" : PRIMARY_COLOR)};
  text-align: center;
`;

const SubmitButton = styled.button`
  display: block;
  margin-top: 40px;
  width: 364px;
  height: 56px;
  border-radius: 12px;
  font-size: 1.175rem;
  color: #f1f1f1;
  background-color: ${(props) => (props.disabled ? "#aaa" : "#191919")};
  border: none;
  cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};
  transition: background-color 0.2s;
  &:hover {
    background-color: ${(props) => (props.disabled ? "#aaa" : "#333")};
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 15px;
  right: 25px;
  background: none;
  border: none;
  font-size: 2rem;
  color: #333;
  cursor: pointer;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`;
