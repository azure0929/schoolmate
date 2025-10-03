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
 * 사용자 보유 포인트 조회 API (수정: /api/point-history/student/me/balance 호출)
 * authToken을 기반으로 서버에서 직접 잔액을 조회.
 * @returns {Promise<number>} 보유 포인트
 */
const studentPoints = async () => {
  // /api/point-history/student/me/balance 엔드포인트 직접 호출
  const response = await api.get("/point-history/student/me/balance");
  return response.data;
};

/**
 * 사용자 이메일 조회 API (제거 또는 변경)
 * 교환 API가 이메일을 경로 변수로 요구하므로, 이 함수는 유지되어야 함.
 * 다만, 잔액 조회에서는 더 이상 사용되지 않는다.
 * @returns {Promise<string>} 사용자 이메일
 */
const fetchUserEmail = async () => {
  // 교환 API (POST /point-history/student/{email})를 위해 유지
  const response = await api.get("/students/me");
  return response.data.email;
};

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
      // studentPoints 호출
      const points = await studentPoints();
      setUserPoints(points);
    } catch (error) {
      console.error("보유 포인트 조회 실패:", error);
      // 백엔드 에러가 404이면 "사용자 정보를 찾을 수 없습니다" 등으로 구체화 가능
      setExchangeError(
        "보유 포인트 조회에 실패했습니다. (서버 연결 또는 사용자 정보 오류)",
      );
      setUserPoints(0);
    }
  };

  const needPoints = selectedProduct ? selectedProduct.productPoints : 0;
  const isExchangePossible = userPoints !== null && userPoints >= needPoints;
  const pointDifference = userPoints !== null ? userPoints - needPoints : 0;

  // 교환 요청 처리 (POST /api/point-history/student/{email} 호출)
  const handleExchange = async () => {
    if (!selectedProduct || !isExchangePossible) return;

    setCurrentStep(STEPS.EXCHANGING);
    setExchangeError(null);

    try {
      // 1. 사용자 이메일 조회
      const userEmail = await fetchUserEmail();

      // 2. 상품 교환 API 호출
      const exchangeData = {
        tsType: "EXCHANGE",
        amount: -needPoints, // 차감 포인트는 음수
        refType: "상품교환",
        refId: selectedProduct.productId,
      };

      await api.post(`/point-history/student/${userEmail}`, exchangeData);

      // 교환 성공
      setExchangeSuccess(true);
      setExchangeError(null);
      setCurrentStep(STEPS.RESULT);
      onExchangeSuccess && onExchangeSuccess();
    } catch (error) {
      console.error("상품 교환 요청 실패:", error);
      let errorMessage = "상품 교환 중 알 수 없는 오류가 발생했습니다.";

      if (error.response) {
        // 400 Bad Request (잔액 부족, 역할 오류 등 IllegalArgumentException) 처리
        if (error.response.status === 400) {
          // 서버에서 보낸 에러 메시지 대신 일반적인 메시지 사용 (Controller가 에러 메시지를 반환하지 않는 구조이므로)
          errorMessage =
            error.response.data.message ||
            "포인트가 부족하거나 유효하지 않은 요청입니다.";
        } else if (error.response.status === 404) {
          errorMessage = "사용자 정보를 찾을 수 없습니다.";
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
