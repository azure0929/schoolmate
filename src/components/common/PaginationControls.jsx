import React from "react";
import styled, { css } from "styled-components";
import {
  MdOutlineKeyboardArrowLeft,
  MdOutlineKeyboardArrowRight,
} from "react-icons/md";

const PRIMARY_COLOR = "#f86166";

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 50px;
  gap: 5px;
  margin-bottom: 50px;

  @media (max-width: 768px) {
    margin-top: 30px;
    margin-bottom: 30px;
  }
`;

const PageNumber = styled.span.attrs((props) => ({
  // 비활성화 상태를 위한 prop 설정
  "data-disabled": props.disabled ? "true" : "false",
}))`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  font-size: 1rem;
  cursor: pointer;
  border-radius: 4px;
  font-weight: 500;
  transition: all 0.2s;
  padding: 0;

  color: ${(props) => (props.$active ? "white" : "#999")};
  background-color: ${(props) =>
    props.$active ? PRIMARY_COLOR : "transparent"};

  // 활성 페이지 스타일
  ${(props) =>
    props.$active &&
    css`
      font-weight: 700;
    `}

  // 화살표 아이콘 스타일 (숫자 버튼과 스타일 분리)
  ${(props) =>
    props.$isIcon &&
    css`
      color: #333;
      background-color: transparent;

      // 아이콘 전용 호버 효과를 여기에 포함하여 $isIcon prop을 참조.
      &:not([data-disabled="true"]):hover {
        color: ${PRIMARY_COLOR};
        background-color: transparent;
      }
    `}

  // 비활성화 상태
  &[data-disabled="true"] {
    cursor: not-allowed;
    opacity: 0.5;
    background-color: transparent !important;
    color: #999 !important;
  }

  // 숫자 버튼 호버 효과 (아이콘 버튼 및 비활성화 상태 제외)
  ${(props) =>
    !props.$isIcon &&
    css`
      &:not([data-disabled="true"]):hover {
        background-color: ${props.$active ? PRIMARY_COLOR : "#f0f0f0"};
        color: ${props.$active ? "white" : "#191919"};
      }
    `}
`;

/**
 * @param {number} currentPage 현재 페이지 번호
 * @param {number} totalPages 전체 페이지 수
 * @param {function} onPageChange 페이지 변경 핸들러 함수
 */
const PaginationControls = ({ currentPage, totalPages, onPageChange }) => {
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
    }
  };

  if (totalPages <= 1) return null;

  return (
    <PaginationContainer>
      {/* 왼쪽 화살표 */}
      <PageNumber
        onClick={() => goToPage(currentPage - 1)}
        disabled={currentPage === 1}
        $isIcon
      >
        <MdOutlineKeyboardArrowLeft size={24} />
      </PageNumber>

      {/* 페이지 번호 목록 */}
      {pageNumbers.map((page) => (
        <PageNumber
          key={page}
          $active={page === currentPage}
          onClick={() => goToPage(page)}
        >
          {page}
        </PageNumber>
      ))}

      {/* 오른쪽 화살표 */}
      <PageNumber
        onClick={() => goToPage(currentPage + 1)}
        disabled={currentPage === totalPages}
        $isIcon
      >
        <MdOutlineKeyboardArrowRight size={24} />
      </PageNumber>
    </PaginationContainer>
  );
};

export default PaginationControls;
