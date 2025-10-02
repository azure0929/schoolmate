import React, { useState, useEffect } from "react";
import styled from "styled-components";
import axios from "axios";

// 모달의 상태를 나타내는 상수
const STEPS = {
  UPLOAD: "upload",
  LOADING: "loading",
  CONFIRMATION: "confirmation",
};

// EatPhotoModal 컴포넌트 시그니처 변경: onUpload 함수를 prop으로 받음
const EatPhotoModal = ({ isOpen, onClose, onUpload, studentSchoolName }) => {
  // 1. 상태 관리
  const [currentStep, setCurrentStep] = useState(STEPS.UPLOAD);
  const [selectedFile, setSelectedFile] = useState(null); // 실제 파일 객체
  const [selectedImageURL, setSelectedImageURL] = useState(null); // 미리보기 URL
  const [analysisResult, setAnalysisResult] = useState(null); // AI 분석 결과 ("급식 사진이 맞습니다" 등)
  const [isSchoolLunchConfirmed, setIsSchoolLunchConfirmed] = useState(false); // 급식 사진 판별 여부

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
      alert("먼저 사진을 선택해주세요.");
      return;
    }

    // AI 분석 중 로딩 상태로 변경
    setCurrentStep(STEPS.LOADING);

    const formData = new FormData();
    formData.append("file", selectedFile);

    const authToken = localStorage.getItem("authToken");
    if (!authToken) {
      alert("로그인 정보가 유효하지 않습니다. 다시 로그인해주세요.");
      onClose();
      return;
    }

    try {
      // onUpload 함수를 호출하여 AI 분석 (백엔드 /api/v1/photos/upload 호출)
      const response = await onUpload(selectedFile); // MealPhotoSection의 handlePhotoUpload 호출

      const resultText = response.data;
      setAnalysisResult(resultText);

      // 결과 텍스트를 파싱하여 급식 사진 여부 판단
      const isConfirmed = resultText.includes("급식 사진이 확인");
      setIsSchoolLunchConfirmed(isConfirmed);

      // 분석이 완료되면 확인 단계로 전환
      setCurrentStep(STEPS.CONFIRMATION);
    } catch (error) {
      console.error("AI 분석 요청 실패:", error);
      alert(
        `AI 분석 중 오류가 발생했습니다: ${error.response?.data || "서버 통신 오류"}`,
      );
      setCurrentStep(STEPS.UPLOAD); // 오류 발생 시 초기 상태로 복귀
    }
  };

  // 4. 최종 확인 및 모달 닫기 (확인 버튼 클릭 시)
  const handleFinalConfirmation = () => {
    // 이미 DB 저장 및 포인트 지급은 onUpload (handleAIBaseUpload) 과정에서 완료됨
    alert("급식 사진이 등록되었으며, 포인트가 지급되었습니다.");
    onClose();
  };

  // 5. 버튼 렌더링 로직 (상태에 따라 버튼 텍스트와 액션 변경)
  const renderButton = () => {
    switch (currentStep) {
      case STEPS.UPLOAD:
        return (
          <SubmitButton type="button" onClick={handleAIBaseUpload}>
            AI 분석 요청 (제출)
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
              확인 (모달 닫기)
            </SubmitButton>
          );
        } else {
          // 급식 사진이 아닐 경우 재업로드 유도
          return (
            <SubmitButton
              type="button"
              onClick={() => setCurrentStep(STEPS.UPLOAD)}
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
        {/* 학교 정보 표시 영역 */}
        <SchoolInfoBar>{studentSchoolName || "학교 정보 없음"}</SchoolInfoBar>

        {/* 파일 선택/업로드 영역 */}
        <input
          type="file"
          name="eatphoto"
          id="eatphoto"
          style={{ display: "none" }}
          onChange={handleFileChange}
          accept="image/*"
          // AI 분석 후에는 파일 선택 불가능하게
          disabled={currentStep !== STEPS.UPLOAD}
        />

        <div className="eatphoto-upload">
          <FileSelectLabel
            htmlFor="eatphoto"
            // AI 분석 후에는 파일 선택 버튼 숨김/비활성화
            style={{
              display: currentStep === STEPS.UPLOAD ? "inline-block" : "none",
            }}
          >
            파일 선택
          </FileSelectLabel>
        </div>

        <EatPhotoWrap>
          {selectedImageURL && (
            <img src={selectedImageURL} alt="Uploaded meal" />
          )}
          {currentStep === STEPS.LOADING && (
            <LoadingText>분석 중...</LoadingText>
          )}
        </EatPhotoWrap>

        {/* AI 분석 결과 메시지 */}
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
  padding-top: 50px; /* SchoolInfoBar 공간 확보 */
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
  color: #000;
  cursor: pointer;
  user-select: none;
  transition: background-color 0.2s;
  &:hover {
    background-color: #c0c0c0;
  }
`;

const EatPhotoWrap = styled.div`
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
  position: relative;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
`;

const LoadingText = styled.div`
  font-size: 1.5rem;
  color: #e91e63;
  font-weight: bold;
`;

const AnalysisResultText = styled.p.withConfig({
  shouldForwardProp: (prop) => prop !== "isConfirmed", // 경고 제거
})`
  margin-top: 20px;
  font-size: 1.1rem;
  font-weight: 600;
  color: ${(props) =>
    props.isConfirmed ? "#4CAF50" : "#F44336"}; /* 초록색/빨간색 */
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
