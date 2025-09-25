import React from "react";
import styled from "styled-components";

function DatePointSection() {
  return (
    <DatePointWrapper>
      <PointInfo>
        <span>포인트:</span>
        <PointText>13,000P</PointText>
      </PointInfo>
      <LogoutButton>로그아웃</LogoutButton>
    </DatePointWrapper>
  );
}

export default DatePointSection;

const DatePointWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 10px 0 20px 0;
`;

const PointInfo = styled.div`
  display: flex;
  align-items: center;
  font-size: 14px;
  margin-right: 15px;
`;

const PointText = styled.span`
  font-weight: 700;
  color: #e91e63;
  margin-left: 5px;
`;

const LogoutButton = styled.button`
  background-color: #e91e63;
  color: white;
  border: none;
  padding: 8px 18px;
  border-radius: 20px;
  cursor: pointer;
  font-weight: 500;
  font-size: 14px;
  transition: background-color 0.2s;
  box-shadow: 0 2px 5px rgba(233, 30, 99, 0.2);

  &:hover {
    background-color: #d81b60;
  }
`;
