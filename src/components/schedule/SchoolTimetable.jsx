import React, { useState, useEffect, useCallback, useMemo } from "react";
import styled from "styled-components";
import api from "@/api";
import dayjs from "dayjs";
import 'dayjs/locale/ko'; 
import { MdChevronLeft, MdChevronRight } from "react-icons/md";

dayjs.locale('ko'); // dayjs 한국어 설정 적용

const SchoolTimetable = () => {
  // 2. 상태(State) 관리: 현재 날짜와 주간 시간표 데이터
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [weeklyData, setWeeklyData] = useState(Array.from({ length: 7 }, () => Array(5).fill(null)));
  const [isLoading, setIsLoading] = useState(true); // 로딩 상태 추가

  // API 호출 및 데이터 가공 로직 (useCallback으로 최적화)
  const fetchAndProcessTimetable = useCallback(async (date) => {
    setIsLoading(true); // 로딩 시작
    try {
      const response = await api.get("/api/school/timetable", {
        params: { date: dayjs(date).format('YYYY-MM-DD') }
      });
      
      const apiData = response.data;
      
      // 화면에 그리기 쉽도록 7교시 x 5일(월~금) 2차원 배열로 데이터 가공
      const processedData = Array.from({ length: 7 }, () => Array(5).fill(null));
      apiData.forEach(item => {
        const dayIndex = dayjs(item.timetableDate).day() - 1; // 월요일=0, 화요일=1...
        const periodIndex = parseInt(item.period, 10) - 1;   // 1교시=0, 2교시=1...

        // 월~금, 1~7교시 범위의 데이터만 처리
        if (dayIndex >= 0 && dayIndex < 5 && periodIndex >= 0 && periodIndex < 7) {
          processedData[periodIndex][dayIndex] = item.subjectName;
        }
      });
      setWeeklyData(processedData);

    } catch (err) {
      console.error("시간표 조회 실패:", err);

      setWeeklyData(Array.from({ length: 7 }, () => Array(5).fill(null)));
    } finally {
      setIsLoading(false); // 로딩 종료
    }
  }, []); 

  // currentDate가 바뀔 때마다 API 호출 실행
  useEffect(() => {
    fetchAndProcessTimetable(currentDate);
  }, [currentDate, fetchAndProcessTimetable]);

  // UI에 표시될 날짜 범위 텍스트
  const weekRangeText = useMemo(() => {
    const startOfWeek = currentDate.startOf('week').add(1, 'day'); // 월요일
    const endOfWeek = currentDate.endOf('week').subtract(1, 'day');   // 금요일
    return `${startOfWeek.format('YYYY.MM.DD')} ~ ${endOfWeek.format('YYYY.MM.DD')}`;
  }, [currentDate]);

  // 다음 달로 넘어가는 것을 방지하는 로직 ---
  const canGoToNextWeek = useMemo(() => {
    const nextWeek = currentDate.add(1, 'week');
    // 다음 주가 현재 시점의 '월(month)'보다 뒤쪽이라면 false를 반환 (버튼 비활성화)
    return !nextWeek.isAfter(dayjs(), 'month');
  }, [currentDate]);

  // 네비게이션 버튼 핸들러
  const handlePrevWeek = () => {
    setCurrentDate(currentDate.subtract(1, 'week'));
  };

  const handleNextWeek = () => {
    setCurrentDate(currentDate.add(1, 'week'));
  };

  return (
    <Container>
      <Title>학교 시간표</Title>
      <Header>
        <NavButton onClick={handlePrevWeek}><MdChevronLeft /></NavButton>
        <DateDisplay>{weekRangeText}</DateDisplay>
        <NavButton onClick={handleNextWeek} disabled={!canGoToNextWeek}><MdChevronRight /></NavButton>
      </Header>
      
      <TimetableGrid>
        <DayHeader>요일</DayHeader>
        {['월', '화', '수', '목', '금'].map(day => <DayHeader key={day}>{day}</DayHeader>)}

        {Array.from({ length: 7 }).map((_, periodIndex) => (
          <React.Fragment key={periodIndex}>
            <PeriodCell>{periodIndex + 1}교시</PeriodCell>
            {Array.from({ length: 5 }).map((_, dayIndex) => (
              <SubjectCell key={dayIndex}>
                {isLoading ? '...' : (weeklyData[periodIndex]?.[dayIndex] || '')}
              </SubjectCell>
            ))}
          </React.Fragment>
        ))}
      </TimetableGrid>
    </Container>
  );
};

export default SchoolTimetable;

const Container = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: 40px auto;
  padding: 24px;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08); 
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const Title = styled.h2`
  font-size: 1.8rem;
  font-weight: 600;
  margin: 0; 
  color: #333; 
  text-align: center;
`;

const DateDisplay = styled.p`
  font-size: 1rem;
  color: #666;
  margin: 4px 0 0 0;
  text-align: center;
`;

const NavButtons = styled.div`
  display: flex;
  gap: 8px;
`;

const NavButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: 1px solid #ddd;
  border-radius: 50%;
  background-color: #fff;
  cursor: pointer;
  font-size: 1.5rem;
  color: #555;
  transition: background-color 0.2s;

  &:hover {
    background-color: #f0f0f0;
  }
`;

const TimetableGrid = styled.div`
  display: grid;
  grid-template-columns: 0.8fr repeat(5, 1fr);
  border-top: 2px solid #333;
  border-left: 1px solid #eee;
  text-align: center;
`;

const Cell = styled.div`
  padding: 16px 8px;
  border-bottom: 1px solid #eee;
  border-right: 1px solid #eee;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.95rem;
`;

const DayHeader = styled(Cell)`
  background-color: #f9f9f9;
  font-weight: 600;
`;

const PeriodCell = styled(Cell)`
  background-color: #f9f9f9;
  font-weight: 600;
`;

const SubjectCell = styled(Cell)`
  min-height: 80px;
`;