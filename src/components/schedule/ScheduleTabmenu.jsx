import React from "react";
import styled, { css } from "styled-components";

// 이미지 분석 기반 탭 이름
const TABS = [
  { id: "meal", label: "식단" },
  { id: "schedule", label: "학사 일정" },
  { id: "timetable", label: "수업 시간표" },
];

const TabMenu = ({ activeTab, onTabSelect, onViewAttendance }) => {
  return (
    <TabMenuContainer>
      <TabList>
        {TABS.map((tab) => (
          <Tab
            key={tab.id}
            $active={activeTab === tab.id}
            onClick={() => onTabSelect(tab.id)}
          >
            {tab.label}
          </Tab>
        ))}
      </TabList>

      <AttendanceSection>
        <AttendanceText>출석 현황이 궁금하다면?</AttendanceText>
        <AttendanceButton onClick={onViewAttendance}>보러가기</AttendanceButton>
      </AttendanceSection>
    </TabMenuContainer>
  );
};

export default TabMenu;

const SECONDARY_COLOR = "#fccb48";

const TabMenuContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 80px 0 60px 0;
  width: 100%;
  max-width: 1200px;
  box-sizing: border-box;
`;

const TabList = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const Tab = styled.button`
  background-color: #fff;
  color: #555;
  border: 1px solid #e0e0e0;
  border-radius: 30px;
  font-size: 1rem;
  font-weight: 500;
  width: 146px;
  height: 40px;
  cursor: pointer;
  transition: all 0.2s;

  ${(props) =>
    props.$active &&
    css`
      background-color: ${SECONDARY_COLOR};
      color: #333;
      border: none;
    `}
`;

const AttendanceSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 10px;
`;

const AttendanceText = styled.p`
  font-size: 1rem;
  font-size: 1rem;
  font-weight: 500;
  color: #333;
  margin: 0;
  padding-top: 5px;
`;

const AttendanceButton = styled.button`
  background-color: #d9d9d9;
  color: #333;
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  font-size: 1rem;
  font-weight: 500;
  width: 106px;
  transition: background-color 0.2s;
  cursor: pointer;
`;
