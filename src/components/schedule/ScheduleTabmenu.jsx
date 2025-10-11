import React, { useRef, useEffect } from "react";
import styled, { css } from "styled-components";
import { gsap } from "gsap";

// 이미지 분석 기반 탭 이름
const TABS = [
  { id: "meal", label: "식단" },
  { id: "schedule", label: "학사 일정" },
  { id: "timetable", label: "수업 시간표" },
];

const TabMenu = ({ activeTab, onTabSelect, onViewAttendance }) => {
  const containerRef = useRef(null);
  const tabListRef = useRef(null);
  const attendanceRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. 초기 상태 설정 (GSAP가 제어할 요소들)
      gsap.set(containerRef.current, { opacity: 0, y: 30 });
      gsap.set(tabListRef.current.children, { opacity: 0, y: 10 });
      gsap.set(attendanceRef.current.children, { opacity: 0, x: 20 });

      const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

      // 2. 전체 컨테이너 진입
      tl.to(containerRef.current, { opacity: 1, y: 0, duration: 0.8 }, 0);

      // 3. 탭 버튼 Staggered 진입
      tl.to(
        tabListRef.current.children,
        {
          opacity: 1,
          y: 0,
          duration: 0.4,
          stagger: 0.1,
        },
        0.3,
      ); // 0.3초 딜레이 후 시작

      // 4. 출석 섹션 진입
      tl.to(
        attendanceRef.current.children,
        {
          opacity: 1,
          x: 0,
          duration: 0.5,
          stagger: 0.1,
        },
        0.5,
      ); // 0.5초 딜레이 후 시작
    }, containerRef); // Scope the animation

    return () => ctx.revert(); // Cleanup
  }, []);

  return (
    <TabMenuContainer ref={containerRef}>
      <TabList ref={tabListRef}>
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

      <AttendanceSection ref={attendanceRef}>
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
  padding: 0 24px; /* 데스크톱에서도 좌우 여백 확보 */
  box-sizing: border-box;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    margin: 40px 0 30px 0;
    padding: 0 20px; /* 모바일 좌우 패딩 조정 */
  }
`;

const TabList = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;

  @media (max-width: 768px) {
    width: 100%;
    overflow-x: auto;
    white-space: nowrap; /* 탭이 줄바꿈되지 않도록 */
    padding-bottom: 10px; /* 스크롤바 공간 확보 */
    gap: 8px; /* 간격 줄이기 */

    /* 스크롤바 숨기기 (선택 사항) */
    &::-webkit-scrollbar {
      display: none;
    }
    -ms-overflow-style: none; /* IE and Edge */
    scrollbar-width: none; /* Firefox */
  }
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
  flex-shrink: 0; /* ⭐️ 탭이 모바일에서 줄어들지 않도록 */
  cursor: pointer;
  transition: all 0.2s;

  ${(props) =>
    props.$active &&
    css`
      background-color: ${SECONDARY_COLOR};
      color: #333;
      border: none;
    `}

  @media (max-width: 768px) {
    width: auto; /* 내용에 맞게 너비 조절 */
    min-width: 100px;
    height: 36px;
    font-size: 0.9rem;
    padding: 0 15px;
  }
`;

const AttendanceSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 10px;

  @media (max-width: 768px) {
    flex-direction: row; /* ⭐️ 모바일: 텍스트와 버튼을 가로로 배치 */
    align-items: center;
    justify-content: space-between;
    width: 100%;
    margin-top: 20px;
    gap: 15px;
  }
`;

const AttendanceText = styled.p`
  font-size: 1rem;
  font-weight: 500;
  color: #333;
  margin: 0;
  padding-top: 5px;

  @media (max-width: 768px) {
    font-size: 0.95rem;
    padding-top: 0;
  }
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

  @media (max-width: 768px) {
    width: 90px;
    padding: 8px 15px;
    font-size: 0.9rem;
    flex-shrink: 0;
  }
`;
