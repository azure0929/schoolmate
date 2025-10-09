import React, { useRef, useEffect } from "react";
import styled, { css } from "styled-components";
import { gsap } from "gsap";

const ActionConfirmModal = ({ type, onClose, onConfirm }) => {
  const modalRef = useRef(null);
  const wrapperRef = useRef(null);

  // 모달이 나타나고 사라질 때 GSAP 애니메이션 효과
  useEffect(() => {
    gsap.to(wrapperRef.current, { opacity: 1, duration: 0.3 });
    gsap.fromTo(
      modalRef.current,
      { scale: 0.9, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.3, ease: "power2.out" },
    );
    const handleWrapperClick = (e) => {
      if (e.target === wrapperRef.current) handleClose();
    };
    wrapperRef.current.addEventListener("click", handleWrapperClick);
    return () => {
      if (wrapperRef.current) {
        wrapperRef.current.removeEventListener("click", handleWrapperClick);
      }
    };
  }, []);

  const handleClose = () => {
    gsap.to(wrapperRef.current, { opacity: 0, duration: 0.2 });
    gsap.to(modalRef.current, {
      scale: 0.9,
      opacity: 0,
      duration: 0.2,
      ease: "power2.in",
      onComplete: onClose,
    });
  };

  // "예" 버튼 클릭 시, 부모로부터 받은 onConfirm 함수를 실행
  const handleConfirm = () => {
    onConfirm(); // 실제 기능 실행
    handleClose();
  };

  const isWithdrawal = type === "withdrawal";
  const title = isWithdrawal
    ? "정말 탈퇴 하시겠습니까?"
    : "로그아웃 하시겠습니까?";
  const confirmText = "예";
  const cancelText = "아니오";

  return (
    <ModalWrapper ref={wrapperRef} style={{ opacity: 0 }}>
      <ModalContent ref={modalRef}>
        <ModalText>{title}</ModalText>
        <ModalActions>
          <ConfirmButton $type={type} onClick={handleConfirm}>
            {confirmText}
          </ConfirmButton>
          <CancelButton onClick={handleClose}>{cancelText}</CancelButton>
        </ModalActions>
      </ModalContent>
    </ModalWrapper>
  );
};

export default ActionConfirmModal;

// --- Styled Components (기존 MyPage.jsx에서 가져옴) ---
const ModalWrapper = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;
const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 380px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;
const ModalText = styled.p`
  padding: 40px 20px;
  text-align: center;
  font-size: 1.1rem;
  font-weight: 500;
  margin: 0;
`;
const ModalActions = styled.div`
  display: flex;
`;
const ModalButtonBase = css`
  flex: 1;
  padding: 15px;
  font-size: 1rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s;
`;
const ConfirmButton = styled.button`
  ${ModalButtonBase}
  background-color: ${(props) =>
    props.$type === "withdrawal" ? "#d9534f" : "#333"};
  color: white;
  &:hover {
    background-color: ${(props) =>
      props.$type === "withdrawal" ? "#c9302c" : "#555"};
  }
`;
const CancelButton = styled.button`
  ${ModalButtonBase}
  background-color: #f0f0f0;
  color: #333;
  &:hover {
    background-color: #e0e0e0;
  }
`;
