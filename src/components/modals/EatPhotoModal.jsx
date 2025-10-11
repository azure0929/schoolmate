import React, { useState, useEffect } from "react";
import styled, { css } from "styled-components";
// axios는 이 컴포넌트에서 직접 사용되지 않고, onUpload prop을 통해 호출되므로 제거 가능

// 모달의 상태를 나타내는 상수
const STEPS = {
  UPLOAD: "upload",
  LOADING: "loading",
  CONFIRMATION: "confirmation",
};

// EatPhotoModal 컴포넌트 시그니처 변경: onUpload 함수와 toastRef를 prop으로 받음
const EatPhotoModal = ({
  isOpen,
  onClose,
  onUpload,
  toastRef,
  studentSchoolName,
}) => {
  // 1. 상태 관리
  const [currentStep, setCurrentStep] = useState(STEPS.UPLOAD);
  const [selectedFile, setSelectedFile] = useState(null); // 실제 파일 객체
  const [selectedImageURL, setSelectedImageURL] = useState(null); // 미리보기 URL
  const [analysisResult, setAnalysisResult] = useState(null); // AI 분석 결과 ("급식 사진이 맞습니다" 등)
  const [isSchoolLunchConfirmed, setIsSchoolLunchConfirmed] = useState(false); // 급식 사진 판별 여부

  // showToast 유틸리티 함수 정의
  const showToast = (message, type = "success") => {
    if (toastRef && toastRef.current) {
      toastRef.current.showToast(message, type);
    }
  };

  // 모달이 열릴 때마다 상태 초기화
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(STEPS.UPLOAD);
      setSelectedFile(null);
      setSelectedImageURL(null);
      setAnalysisResult(null);
      setIsSchoolLunchConfirmed(false);
    }
  }, [isOpen]);

  // 2. 파일 입력 변경 처리
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file); // 실제 파일 객체 저장
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImageURL(reader.result); // 미리보기 URL 저장
      };
      reader.readAsDataURL(file);
    } else {
      setSelectedFile(null);
      setSelectedImageURL(null);
    }
  };

  // 3. AI 분석 요청 및 단계 변경 (제출 버튼 클릭 시)
  const handleAIBaseUpload = async () => {
    if (!selectedFile) {
      // 네이티브 alert() 대신 showToast 사용
      showToast("먼저 사진을 선택해주세요.", "warning");
      return;
    }

    // AI 분석 중 로딩 상태로 변경
    setCurrentStep(STEPS.LOADING);

    // FormData는 onUpload prop에서 처리할 수 있으므로 여기서는 제거하거나,
    // onUpload 함수의 시그니처에 맞게 selectedFile만 전달

    const authToken = localStorage.getItem("authToken");
    if (!authToken) {
      // 네이티브 alert() 대신 showToast 사용
      showToast(
        "로그인 정보가 유효하지 않습니다. 다시 로그인해주세요.",
        "error",
      );
      onClose();
      return;
    }

    try {
      // onUpload 함수를 호출하여 AI 분석 (MealPhotoSection의 handlePhotoUpload 호출)
      // onUpload 함수가 FormData 생성을 담당한다고 가정
      const response = await onUpload(selectedFile);

      // 백엔드에서 받은 결과 문자열 그대로 저장
      const resultText = response.data;
      setAnalysisResult(resultText);

      // 결과 텍스트를 파싱하여 급식 사진 여부 판단
      const isConfirmed = resultText.includes("급식 사진이 확인");
      setIsSchoolLunchConfirmed(isConfirmed);

      // 분석이 완료되면 확인 단계로 전환
      setCurrentStep(STEPS.CONFIRMATION);
    } catch (error) {
      console.error("AI 분석 요청 실패:", error);
      // 네이티브 alert() 대신 showToast 사용
      showToast(
        `AI 분석 중 오류가 발생했습니다: ${error.response?.data?.message || "서버 통신 오류"}`,
        "error",
      );
      setCurrentStep(STEPS.UPLOAD); // 오류 발생 시 초기 상태로 복귀
    }
  };

  // 4. 최종 확인 및 모달 닫기 (확인 버튼 클릭 시)
  const handleFinalConfirmation = () => {
    // 이미 DB 저장 및 포인트 지급은 onUpload (handleAIBaseUpload) 과정에서 완료됨
    // 네이티브 alert() 대신 showToast 사용
    showToast("급식 사진이 등록되었으며, 포인트가 지급되었습니다.", "success");
    onClose();
  };

  // 5. 버튼 렌더링 로직 (상태에 따라 버튼 텍스트와 액션 변경)
  const renderButton = () => {
    switch (currentStep) {
      case STEPS.UPLOAD:
        return (
          <SubmitButton type="button" onClick={handleAIBaseUpload}>
            제출
          </SubmitButton>
        );
      case STEPS.LOADING:
        return (
          <SubmitButton type="button" disabled>
            AI 분석 중...
          </SubmitButton>
        );
      case STEPS.CONFIRMATION:
        // 급식 사진이 맞을 경우에만 '확인' (최종 등록 완료) 버튼 활성화
        if (isSchoolLunchConfirmed) {
          return (
            <SubmitButton type="button" onClick={handleFinalConfirmation}>
              확인
            </SubmitButton>
          );
        } else {
          // 급식 사진이 아닐 경우 재업로드 유도
          return (
            <SubmitButton
              type="button"
              onClick={() => {
                setCurrentStep(STEPS.UPLOAD);
                setSelectedImageURL(null); // 사진 미리보기 초기화
                setSelectedFile(null); // 파일 객체 초기화
                setAnalysisResult(null); // 결과 메시지 초기화
                // 파일 input 초기화를 위한 추가 로직 (필요 시 useRef 사용)
              }}
            >
              다시 선택
            </SubmitButton>
          );
        }
      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div>
      <ModalOverlay onClick={onClose} />
      <ModalContent>
        {/* 파일 선택 input (숨김) */}
        <input
          type="file"
          name="eatphoto"
          id="eatphoto"
          style={{ display: "none" }}
          onChange={handleFileChange}
          accept="image/*"
          disabled={currentStep !== STEPS.UPLOAD}
        />

        <div className="eatphoto-upload">
          <FileSelectLabel
            htmlFor="eatphoto"
            style={{
              display: selectedFile === null ? "inline-block" : "none",
            }}
          >
            파일 선택
          </FileSelectLabel>
        </div>

        {/* 이미지 및 로딩 텍스트 렌더링 영역 */}
        <EatPhotoWrap>
          {/* 이미지 렌더링 조건 수정: LOADING 단계가 아닐 때만 이미지 표시 */}
          {selectedImageURL && currentStep !== STEPS.LOADING && (
            <img src={selectedImageURL} alt="사진 미리보기" />
          )}

          {currentStep === STEPS.LOADING && (
            <LoadingText>AI 분석 중...</LoadingText>
          )}

          {/* 파일이 없고, 로딩 중이 아닐 때 가이드 텍스트 */}
          {!selectedImageURL && currentStep !== STEPS.LOADING && (
            <GuideText>
              사진을 선택해주세요.
              <br />
              (급식 사진만 인정됩니다.)
            </GuideText>
          )}
        </EatPhotoWrap>

        {/* AI 분석 결과 메시지 (CONFIRMATION 단계에서만 표시) */}
        {analysisResult && currentStep === STEPS.CONFIRMATION && (
          <AnalysisResultText isConfirmed={isSchoolLunchConfirmed}>
            {analysisResult}
          </AnalysisResultText>
        )}

        {/* 조건부 버튼 렌더링 */}
        {renderButton()}

        <CloseButton onClick={onClose}>&times;</CloseButton>
      </ModalContent>
    </div>
  );
};

export default EatPhotoModal;

// ===============================================
// Styled Components (이하 스타일 컴포넌트는 변경 없음)
// ===============================================

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 9;
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
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);

  .eatphoto-upload {
    display: flex;
    justify-content: flex-end;
    width: 100%;
    padding-right: 20px;
    margin-bottom: 20px;
  }
`;

const SchoolInfoBar = styled.div`
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 90%;
  padding: 10px 20px;
  background-color: #191919;
  color: #fff;
  font-size: 1rem;
  font-weight: 500;
  text-align: center;
  border-radius: 36px 36px 0 0;
`;

const FileSelectLabel = styled.label`
  display: inline-block;
  text-align: center;
  line-height: 32px;
  width: 104px;
  height: 32px;
  border-radius: 8px;
  background-color: #d5d5d5;
  cursor: pointer;
  user-select: none;
  transition: background-color 0.2s;
  &:hover {
    background-color: #c0c0c0;
  }
`;

const EatPhotoWrap = styled.div`
  position: relative;
  margin: 20px auto 0;
  width: 364px;
  height: 278px;
  border: 1px solid #ccc;
  background-color: #eeeeee;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
`;

const LoadingText = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 1.5rem;
  color: var(--primary-color, #191919); /* 기본 색상 설정 */
  font-weight: bold;
  text-align: center;
  z-index: 1;
`;

const GuideText = styled.div`
  font-size: 1.1rem;
  color: #a0a0a0;
  text-align: center;
  line-height: 1.5;
`;

const AnalysisResultText = styled.p.withConfig({
  shouldForwardProp: (prop) => prop !== "isConfirmed", // prop 경고 제거
})`
  margin-top: 20px;
  font-size: 1.1rem;
  font-weight: 600;
  color: ${(props) => (props.isConfirmed ? "#4CAF50" : "#F44336")};
  text-align: center;
`;

const SubmitButton = styled.button`
  display: block;
  margin-top: 40px;
  width: 364px;
  height: 56px;
  border-radius: 12px;
  font-size: 1.375rem;
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
`;
