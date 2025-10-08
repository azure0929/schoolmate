import React, { useState, useEffect } from "react";
import styled from "styled-components";
import api from "@/api";

const PasswordChangeModal = ({ onClose, onSuccess }) => {
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // ## 변경점 1: 유효성 검사 상태를 세분화하여 관리
  const [validation, setValidation] = useState({
    format: { isValid: false, message: "" },       // 새 비밀번호 형식
    match: { isValid: false, message: "" },        // 새 비밀번호 일치 여부
    different: { isValid: false, message: "" },    // 현재 비밀번호와 다른지 여부
  });
  const [apiError, setApiError] = useState("");

  // 유효성 검사 함수 (기존과 동일)
  const validateNewPasswordFormat = (password) => {
    if (!password) return { isValid: false, message: "" };
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[^a-zA-Z0-9]/.test(password);
    const isValidLength = password.length >= 8;

    if (!isValidLength) return { isValid: false, message: "비밀번호는 8자 이상이어야 합니다." };
    if (!hasLetter || !hasNumber || !hasSpecial) return { isValid: false, message: "영문, 숫자, 특수문자를 모두 포함해야 합니다." };
    return { isValid: true, message: "사용 가능한 비밀번호입니다." };
  };

  // 1. 새 비밀번호 '형식' 검사
  useEffect(() => {
    const result = validateNewPasswordFormat(passwords.newPassword);
    setValidation(prev => ({ ...prev, format: result }));
  }, [passwords.newPassword]);

  // 2. 새 비밀번호 '일치' 여부 검사
  useEffect(() => {
    if (!passwords.confirmPassword) {
      setValidation(prev => ({ ...prev, match: { isValid: false, message: "" }}));
      return;
    }
    const isMatch = passwords.newPassword !== "" && passwords.newPassword === passwords.confirmPassword;
    setValidation(prev => ({
      ...prev,
      match: { isValid: isMatch, message: isMatch ? "비밀번호가 일치합니다." : "비밀번호가 일치하지 않습니다." }
    }));
  }, [passwords.newPassword, passwords.confirmPassword]);

  // ## 변경점 2: '새 비밀번호'가 '현재 비밀번호'와 다른지 검사하는 로직 추가
  useEffect(() => {
    if (passwords.newPassword && passwords.currentPassword) {
      const isDifferent = passwords.newPassword !== passwords.currentPassword;
      setValidation(prev => ({
        ...prev,
        different: {
          isValid: isDifferent,
          message: isDifferent ? "" : "현재 비밀번호와 다른 비밀번호를 사용해주세요."
        }
      }));
    } else {
      setValidation(prev => ({ ...prev, different: { isValid: false, message: "" }}));
    }
  }, [passwords.newPassword, passwords.currentPassword]);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setPasswords(prev => ({ ...prev, [name]: value }));
    if (apiError) setApiError(""); // 입력 시 서버 에러 메시지는 초기화
  };

  const handleSubmit = async () => {
    try {
      // axios 응답을 변수로 받아야 함
      const response = await api.put("/students/password", {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      onSuccess();
    } catch (error) {
      console.error("❌ [실패] 에러 객체 전체:", error);

      if (error.response) {
        console.error("❌ [실패] 서버가 보낸 응답:", error.response);
        console.error("❌ [실패] 서버가 보낸 데이터:", error.response.data);
        console.error("❌ [실패] 상태 코드:", error.response.status);
      } else {
        console.error("❌ [실패] 서버 응답 객체가 없음 (네트워크 문제 또는 CORS)");
      }

      console.error("❌ [실패] 에러 메시지:", error.message);

      if (error.response?.data?.message) {
        setApiError(error.response.data.message);
      } else {
        setApiError("오류로 변경에 실패했습니다.");
      }
    }
  };

  // ## 변경점 4: 버튼 비활성화 조건을 모든 유효성 검사를 포함하도록 강화
  const isSubmitDisabled =
    !passwords.currentPassword ||
    !validation.format.isValid ||
    !validation.match.isValid ||
    !validation.different.isValid;

  return (
    <Overlay onClick={onClose}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <Title>비밀번호 변경</Title>

        <Input type="password" name="currentPassword" placeholder="현재 비밀번호" onChange={handleChange} />
        
        <Input type="password" name="newPassword" placeholder="새 비밀번호" onChange={handleChange} />
        {/* 새 비밀번호에 대한 모든 유효성 메시지를 순차적으로 표시 */}
        {passwords.newPassword && !validation.format.isValid && (
          <ValidationMessage $isValid={false}>{validation.format.message}</ValidationMessage>
        )}
        {passwords.newPassword && validation.format.isValid && !validation.different.isValid && (
           <ValidationMessage $isValid={false}>{validation.different.message}</ValidationMessage>
        )}
         {passwords.newPassword && validation.format.isValid && validation.different.isValid && (
           <ValidationMessage $isValid={true}>{validation.format.message}</ValidationMessage>
        )}

        <Input type="password" name="confirmPassword" placeholder="새 비밀번호 확인" onChange={handleChange} />
        {passwords.confirmPassword && (
          <ValidationMessage $isValid={validation.match.isValid}>
            {validation.match.message}
          </ValidationMessage>
        )}
        
        {/* 서버로부터 받은 에러 메시지 표시 */}
        {apiError && <ValidationMessage $isValid={false}>{apiError}</ValidationMessage>}
        
        <ButtonWrapper>
          <CancelButton onClick={onClose}>취소하기</CancelButton>
          <ConfirmButton onClick={handleSubmit} disabled={isSubmitDisabled}>
            변경하기
          </ConfirmButton>
        </ButtonWrapper>
        
      </ModalContainer>
    </Overlay>
  );
};

export default PasswordChangeModal;

// --- Styled Components ---
const Overlay = styled.div`
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background-color: rgba(0, 0, 0, 0.6); display: flex; align-items: center; justify-content: center; z-index: 1000;
`;
const ModalContainer = styled.div`
  background: white; padding: 32px; border-radius: 12px; width: 90%; max-width: 400px;
  display: flex; flex-direction: column; gap: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);
`;
const Title = styled.h3`
  font-size: 1.5rem; margin: 0 0 16px 0; text-align: center; font-weight: 600;
`;
const Input = styled.input`
  padding: 12px; border: 1px solid #ddd; border-radius: 8px; font-size: 1rem;
  &:focus { border-color: var(--primary-color); outline: none; box-shadow: 0 0 0 2px rgba(var(--primary-rgb), 0.2); }
`;
const ValidationMessage = styled.p`
  font-size: 0.85rem; margin: -8px 0 8px 4px;
  color: ${({ $isValid }) => ($isValid ? "green" : "red")};
`;
const ButtonWrapper = styled.div`
  display: flex;
  justify-content: center;
  gap: 8px; margin-top: 16px;
`;
const Button = styled.button`
  padding: 10px 20px; border: none; border-radius: 8px; font-size: 1rem;
  font-weight: 600; cursor: pointer;
  &:disabled { background-color: #ccc; cursor: not-allowed; }
`;
const ConfirmButton = styled(Button)`
  background-color: var(--primary-color); color: white;
`;
const CancelButton = styled(Button)`
  background-color: #f1f3f5; color: #333;
`;