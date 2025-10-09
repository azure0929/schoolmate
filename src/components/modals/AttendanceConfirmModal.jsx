import React, { useRef, useEffect } from "react";
import styled from "styled-components";
import { gsap } from "gsap";

/**
 * 출석체크 확인 모달 (이미지 스타일 및 GSAP 애니메이션 적용)
 * @param {function} onConfirm - '예' 클릭 시 실행될 함수
 * @param {function} onCancel - '아니오' 클릭 시 실행될 함수 (모달 닫기)
 */
function AttendanceConfirmModal({ onConfirm, onCancel }) {
  const overlayRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    // 1. 오버레이(배경)가 부드럽게 나타나도록 애니메이션 적용
    gsap.fromTo(
      overlayRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.3 },
    );

    // 2. 모달 내용이 아래에서 위로 튀어나오도록 애니메이션 적용
    gsap.from(contentRef.current, {
      y: 50, // 50px 아래에서 시작
      opacity: 0, // 투명하게 시작
      scale: 0.95, // 약간 축소된 상태에서 시작
      ease: "power3.out", // 부드러운 이징 적용
      duration: 0.4,
      delay: 0.1, // 오버레이 후 약간 딜레이
    });
  }, []);

  const handleClose = (callback) => {
    gsap.to(contentRef.current, {
      y: -30, // 살짝 위로 이동
      opacity: 0,
      scale: 0.9,
      duration: 0.3,
      ease: "power2.in",
    });

    // 오버레이 애니메이션 실행 후 최종적으로 모달 닫기
    gsap.to(overlayRef.current, {
      opacity: 0,
      duration: 0.3,
      delay: 0.1, // 내용이 사라진 후 오버레이 사라지도록 딜레이
      onComplete: callback, // 애니메이션 완료 후 전달받은 콜백(onCancel 또는 onConfirm) 실행
    });
  };

  return (
    <ModalOverlay ref={overlayRef} onClick={() => handleClose(onCancel)}>
      <ModalContent ref={contentRef} onClick={(e) => e.stopPropagation()}>
        <ModalTitle>출석체크 하시겠습니까?</ModalTitle>
        <ModalBodyText>출석 시 500포인트가 즉시 지급됩니다.</ModalBodyText>
        <ButtonGroup>
          <ModalButton
            className="confirm"
            onClick={() => handleClose(onConfirm)}
          >
            출석하기
          </ModalButton>
          <ModalButton className="cancel" onClick={() => handleClose(onCancel)}>
            취소
          </ModalButton>
        </ButtonGroup>
      </ModalContent>
    </ModalOverlay>
  );
}

export default AttendanceConfirmModal;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  padding: 30px;
  border-radius: 8px;
  width: 350px;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
`;

const ModalTitle = styled.h3`
  color: #333;
  margin-bottom: 8px;
  font-size: 18px;
  font-weight: 500;
`;

const ModalBodyText = styled.p`
  color: #666;
  font-size: 14px;
  margin-bottom: 25px;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 20px;
`;

const ModalButton = styled.button`
  padding: 10px 25px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  font-size: 15px;
  transition: background-color 0.2s;
  min-width: 100px;

  &.confirm {
    background-color: var(--primary-color);
    color: white;
    &:hover {
      background-color: #c31e1e;
    }
  }

  &.cancel {
    background-color: #e0e0e0;
    color: #333;
    &:hover {
      background-color: #ccc;
    }
  }
`;
