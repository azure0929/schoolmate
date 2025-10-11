import React, { useRef, useEffect } from "react";
import styled from "styled-components";
import { gsap } from "gsap";

/**
 * 출석체크 확인 모달 (Alert 함수를 Prop으로 받도록 수정)
 * @param {function} onConfirm - '예' 클릭 시 실행될 함수
 * @param {function} onCancel - '아니오' 클릭 시 실행될 함수 (모달 닫기)
 * @param {function} showAlert - Alert 메시지를 띄우는 함수 (ProductManagement의 useAlert에서 가져옴)
 */
function AttendanceConfirmModal({ onConfirm, onCancel, showAlert }) {
  const overlayRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    // 모달 등장 애니메이션 (변경 없음)
    gsap.fromTo(
      overlayRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.3 },
    );

    gsap.from(contentRef.current, {
      y: 50,
      opacity: 0,
      scale: 0.95,
      ease: "power3.out",
      duration: 0.4,
      delay: 0.1,
    });
  }, []);

  const handleClose = (callback, shouldShowAlert = false) => {
    // 1. 모달 내용 사라지는 애니메이션
    gsap.to(contentRef.current, {
      y: -30,
      opacity: 0,
      scale: 0.9,
      duration: 0.3,
      ease: "power2.in",
    });

    // 2. 오버레이 애니메이션 실행 후 최종적으로 모달 닫기
    gsap.to(overlayRef.current, {
      opacity: 0,
      duration: 0.3,
      delay: 0.1,
      onComplete: () => {
        // 토스트 대신 showAlert 함수 호출
        if (shouldShowAlert && typeof showAlert === "function") {
          showAlert("출석체크가 완료되었습니다! +500P", "success");
        }

        callback(); // 최종적으로 모달 닫기/확인 함수 실행
      },
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
            // '예' 클릭 시 Alert 실행 플래그(true)를 전달
            onClick={() => handleClose(onConfirm, true)}
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
    background-color: var(--primary-color,);
    color: #333;
    &:hover {
      color: #ffffff;
      background-color: #a91010;
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
