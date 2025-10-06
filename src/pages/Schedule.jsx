import React, { useRef, useState, useCallback } from "react";
import styled from "styled-components";
import MealSection from "@/components/mainpage/MealSection";
import SchoolSchedule from "@/components/schedule/SchoolSchedule";
import SchoolTimetable from "@/components/schedule/SchoolTimetable";
import TopMenu from "@/components/mainpage/TopMenu";
import ScheduleTabmenu from "../components/schedule/ScheduleTabmenu";
import AttendanceCalendar from "../components/calendar/AttendanceCalendar";

const Schedule = () => {
  // 스크롤 대상 설정
  const mealRef = useRef(null);
  const schoolScheduleRef = useRef(null);
  const schoolTimetableRef = useRef(null);

  // 탭 상태 및 출석 뷰 상태 관리
  const [activeTab, setActiveTab] = useState("meal");
  const [showAttendance, setShowAttendance] = useState(false);

  // 스크롤 핸들러
  const handleTabSelect = useCallback((tabId) => {
    setActiveTab(tabId);
    let targetRef;

    switch (tabId) {
      case "meal":
        targetRef = mealRef;
        break;
      case "schedule":
        targetRef = schoolScheduleRef;
        break;
      case "timetable":
        targetRef = schoolTimetableRef;
        break;
      default:
        return;
    }
    if (targetRef.current) {
      // 해당 영역으로 부드럽게 스크롤
      targetRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  // 4. 출석 뷰 전환 핸들러
  const handleViewAttendance = useCallback(() => {
    setShowAttendance(true);
  }, []);

  const handleGoBack = useCallback(() => {
    setShowAttendance(false);
  }, []);

  return (
    <AppContainer>
      <ContentWrapper>
        <TopMenu />

        {/* 출석 캘린더가 활성화된 경우 */}
        {showAttendance ? (
          <AttendanceCalendar onGoBack={handleGoBack} />
        ) : (
          // 기본 스케줄 뷰
          <>
            {/* ScheduleTabmenu 추가 및 핸들러 연결 */}
            <ScheduleTabmenu
              activeTab={activeTab}
              onTabSelect={handleTabSelect}
              onViewAttendance={handleViewAttendance}
            />
            <Separator />

            {/* 각 영역에 ref 연결 */}
            <div ref={mealRef}>
              <MealSection />
            </div>

            <Separator />
            <div ref={schoolScheduleRef}>
              <SchoolSchedule />
            </div>

            <Separator />
            <div ref={schoolTimetableRef}>
              <SchoolTimetable />
            </div>
          </>
        )}
      </ContentWrapper>
    </AppContainer>
  );
};
export default Schedule;

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
`;

const ContentWrapper = styled.div`
  width: 100%;
  max-width: 1200px;
  padding: 20px 0;
`;

const Separator = styled.div`
  height: 40px;
`;
