import React from "react";
import styled from "styled-components";

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
  border-radius: 10px;
  width: 300px;
  text-align: center;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
`;

const ModalTitle = styled.h3`
  color: #333;
  margin-bottom: 20px;
  font-size: 18px;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: space-around;
  margin-top: 20px;
`;

const ModalButton = styled.button`
  padding: 10px 20px;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-weight: 700;
  font-size: 14px;
  transition: background-color 0.2s;

  &.confirm {
    background-color: #e91e63;
    color: white;
    &:hover {
      background-color: #d81b60;
    }
  }

  &.cancel {
    background-color: #ccc;
    color: #333;
    &:hover {
      background-color: #bbb;
    }
  }
`;

/**
 * 출석체크 확인 모달
 * @param {function} onConfirm - '예' 클릭 시 실행될 함수 (API 호출 로직 포함)
 * @param {function} onCancel - '아니오' 클릭 시 실행될 함수 (모달 닫기)
 */
function AttendanceConfirmModal({ onConfirm, onCancel }) {
  return (
    <ModalOverlay onClick={onCancel}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalTitle>출석체크 하시겠습니까?</ModalTitle>
        <p>출석 시 **500포인트**가 지급됩니다.</p>
        <ButtonGroup>
          <ModalButton className="confirm" onClick={onConfirm}>
            예
          </ModalButton>
          <ModalButton className="cancel" onClick={onCancel}>
            아니오
          </ModalButton>
        </ButtonGroup>
      </ModalContent>
    </ModalOverlay>
  );
}

export default AttendanceConfirmModal;
