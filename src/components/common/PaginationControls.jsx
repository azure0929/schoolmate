import React from "react";
import styled, { css } from "styled-components";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

// Styled Components for Pagination
const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 30px;
`;

const PageNumber = styled.span`
  display: inline-block;
  padding: 8px 12px;
  margin: 0 4px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;

  ${(props) =>
    props.$active &&
    css`
      background-color: #303030;
      color: #fff;
      border-color: #303030;
    `}

  /* 화살표 버튼에 border: none 적용 */
  ${(props) =>
    props.$isArrow &&
    css`
      border: none;
      padding: 8px 0;
      margin: 0 8px;
      color: #303030;
      background-color: transparent;

      &:hover {
        color: #1a73e8;
      }
    `}
`;

/**
 * @param {number} currentPage 현재 페이지 번호
 * @param {number} totalPages 전체 페이지 수
 * @param {function} onPageChange 페이지 변경 핸들러 함수
 */
const PaginationControls = ({ currentPage, totalPages, onPageChange }) => {
  // 임시로 5페이지를 기준으로 페이지 번호를 생성합니다.
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <PaginationContainer>
      {/* 왼쪽 화살표: currentPage가 1보다 클 때만 렌더링 */}
      {currentPage > 1 && (
        <PageNumber $isArrow onClick={() => onPageChange(currentPage - 1)}>
          <FiChevronLeft size={16} />
        </PageNumber>
      )}

      {/* 페이지 번호 목록 */}
      {pageNumbers.map((page) => (
        <PageNumber
          key={page}
          $active={page === currentPage}
          onClick={() => onPageChange(page)}
        >
          {page}
        </PageNumber>
      ))}

      {/* 오른쪽 화살표: currentPage가 totalPages보다 작을 때만 렌더링 */}
      {currentPage < totalPages && (
        <PageNumber $isArrow onClick={() => onPageChange(currentPage + 1)}>
          <FiChevronRight size={16} />
        </PageNumber>
      )}
    </PaginationContainer>
  );
};

export default PaginationControls;
