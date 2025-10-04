// AttendanceCalendar.jsx
import React, { useState, useEffect, useCallback } from "react";
import styled from "styled-components";
import axios from "axios";
import AttemdImg from "@/assets/images/attend.png";
import {
  FaChevronLeft,
  FaChevronRight,
  FaStar,
  FaUser,
  FaListAlt,
  FaCalendarAlt,
} from "react-icons/fa";

const BASE_API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:9000/api";

const api = axios.create({
  baseURL: BASE_API_URL,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

const ATTENDANCE_COUNT_API = "/attend/student/me/count";
const ATTENDANCE_DATES_API = "/attend/student/me/dates";

const NOW = new Date();
const CURRENT_DATE = NOW.getDate();
const CURRENT_YEAR = NOW.getFullYear();
const CURRENT_MONTH = NOW.getMonth() + 1;
const CURRENT_DAY_OF_WEEK = NOW.toLocaleDateString("ko-KR", {
  weekday: "long",
});
const CURRENT_DATE_STRING = `${CURRENT_YEAR}년 ${CURRENT_MONTH}월 ${CURRENT_DATE}일 ${CURRENT_DAY_OF_WEEK}`;

const getCalendarInfo = (year, month) => {
  // month는 1(1월) ~ 12(12월) 기준
  const firstDay = new Date(year, month - 1, 1).getDay(); // 0:일, 1:월, ..., 6:토
  const totalDays = new Date(year, month, 0).getDate();
  return { firstDay, totalDays };
};

const AttendanceCalendar = () => {
  // viewDate 상태: 사용자가 현재 보고 있는 달력의 년/월을 관리
  const [viewDate, setViewDate] = useState({
    year: CURRENT_YEAR,
    month: CURRENT_MONTH,
  });

  const [attendanceCount, setAttendanceCount] = useState(0);
  const [attendanceDates, setAttendanceDates] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { year, month } = viewDate;
  const { firstDay, totalDays } = getCalendarInfo(year, month);

  // 달력 배열 생성
  const calendarArray = Array(firstDay).fill(null);
  for (let i = 1; i <= totalDays; i++) {
    calendarArray.push(i);
  }

  // 1. 출석 데이터 로드 (일수 카운트 + 날짜 리스트)
  const fetchAttendanceData = useCallback(async (currentYear, currentMonth) => {
    setLoading(true);
    setError(null);
    if (!localStorage.getItem("authToken")) {
      setError("로그인이 필요합니다.");
      setLoading(false);
      return;
    }

    try {
      // 1. 출석 일수 조회 (총 일수는 월 이동과 관계없이 전체 이력을 표시한다고 가정)
      const countRes = await api.get(ATTENDANCE_COUNT_API);
      setAttendanceCount(countRes.data || 0);

      // 2. 출석 날짜 리스트 조회 (선택된 년도/월을 쿼리 파라미터로 전달)
      const datesRes = await api.get(ATTENDANCE_DATES_API, {
        params: {
          year: currentYear,
          month: currentMonth,
        },
      });

      const dateSet = new Set(
        datesRes.data.map((dateStr) => new Date(dateStr).getDate().toString()),
      );
      setAttendanceDates(dateSet);
    } catch (err) {
      console.error("출석 데이터 로드 실패:", err);
      const errorMessage =
        err.response?.data?.message ||
        "데이터 로드 중 오류 발생. 서버/CORS 확인 필요.";
      setError(errorMessage);
      setAttendanceDates(new Set());
    } finally {
      setLoading(false);
    }
  }, []);

  // viewDate 상태가 변경될 때마다 데이터를 새로 로드
  useEffect(() => {
    fetchAttendanceData(year, month);
  }, [fetchAttendanceData, year, month]);

  // 월 이동 핸들러: 이전/다음 달로 이동
  const handleMonthChange = (direction) => {
    // 현재 보고 있는 날짜를 기반으로 새로운 Date 객체를 생성
    const newDate = new Date(viewDate.year, viewDate.month - 1 + direction, 1);

    // 상태 업데이트를 통해 useEffect를 트리거하고 데이터를 다시 로드
    setViewDate({
      year: newDate.getFullYear(),
      month: newDate.getMonth() + 1,
    });
  };

  if (loading && error === null)
    return <LoadingText>출석 데이터 로드 중...</LoadingText>;

  return (
    <CalendarContainer>
      <CalendarSection>
        <SubHeader>
          <AttendanceInfo>
            출석 일 수: <Count>{attendanceCount}</Count>일
          </AttendanceInfo>
        </SubHeader>

        {/* API 오류 메시지 표시 */}
        {error && <ErrorBox>{error}</ErrorBox>}

        <CalendarWrapper>
          {/* 월 이동 UI (MonthSelector) */}
          <MonthSelector>
            <MonthChangeButton onClick={() => handleMonthChange(-1)}>
              <FaChevronLeft size={18} />
            </MonthChangeButton>

            <MonthTitle>
              {year}년 {month}월
            </MonthTitle>

            <MonthChangeButton onClick={() => handleMonthChange(1)}>
              <FaChevronRight size={18} />
            </MonthChangeButton>
          </MonthSelector>

          <DaysOfWeek>
            <DayHeader>일</DayHeader>
            <DayHeader>월</DayHeader>
            <DayHeader>화</DayHeader>
            <DayHeader>수</DayHeader>
            <DayHeader>목</DayHeader>
            <DayHeader>금</DayHeader>
            <DayHeader>토</DayHeader>
          </DaysOfWeek>

          <CalendarGrid>
            {/* 달력 날짜 렌더링 */}
            {calendarArray.map((date, index) => {
              const dateString = date !== null ? date.toString() : "";

              // 현재 달력(viewDate)이 현재 날짜(NOW)와 같을 때만 '오늘' 표시
              const isToday =
                date === CURRENT_DATE &&
                year === CURRENT_YEAR &&
                month === CURRENT_MONTH;
              const isAttended = dateString && attendanceDates.has(dateString);

              return (
                <CalendarCell
                  key={index}
                  $isEmpty={date === null}
                  $isToday={isToday}
                >
                  <DateNumber>{date}</DateNumber>
                  {isAttended && (
                    <AttendanceStamp src={AttemdImg} alt="출석체크 도장" />
                  )}
                </CalendarCell>
              );
            })}
          </CalendarGrid>
        </CalendarWrapper>
      </CalendarSection>
    </CalendarContainer>
  );
};

export default AttendanceCalendar;

const CalendarContainer = styled.div`
  max-width: 1200px;
  margin: 186px auto 0;
  font-family: "Malgun Gothic", "Apple SD Gothic Neo", sans-serif;
`;

const CalendarSection = styled.div`
  background: #fff;
  padding: 30px;
  border-radius: 12px;
`;

const SubHeader = styled.div`
  display: flex;
  justify-content: end;
  align-items: center;
  margin-bottom: 25px;
  padding: 0 5px;
`;

const AttendanceInfo = styled.p`
  font-size: 16px;
  color: #555;
  font-weight: 500;
`;

const Count = styled.span`
  font-weight: 800;
  color: #e91e63;
  font-size: 22px;
  margin-left: 5px;
`;

const ErrorBox = styled.div`
  padding: 10px;
  margin-bottom: 20px;
  background-color: #ffebee;
  color: #c62828;
  border: 1px solid #ef9a9a;
  border-radius: 6px;
  text-align: center;
`;

const CalendarWrapper = styled.div`
  border: 1px solid #eee;
  border-radius: 10px;
  overflow: hidden;
`;

const MonthSelector = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background: #f8f8f8;
  border-bottom: 1px solid #eee;
`;

const MonthTitle = styled.h3`
  font-size: 22px;
  font-weight: 700;
  color: #333;
`;

const MonthChangeButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: #e91e63;
  font-size: 18px;
  padding: 5px 10px;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.8;
  }
`;

const DaysOfWeek = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  background: #f0f0f0;
  border-bottom: 1px solid #ccc;
`;

const DayHeader = styled.div`
  text-align: center;
  padding: 12px 0;
  font-weight: bold;
  font-size: 14px;
  color: #555;

  &:first-child {
    color: #f44336;
  } /* 일요일 빨간색 */
  &:last-child {
    color: #2196f3;
  } /* 토요일 파란색 */
`;

const CalendarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  border-left: 1px solid #eee;
`;

const CalendarCell = styled.div`
  height: 200px;
  padding: 8px;
  border-right: 1px solid #eee;
  border-bottom: 1px solid #eee;
  position: relative;
  text-align: right;

  /* 배경색 기본 설정 */
  background-color: ${(props) => (props.isEmpty ? "#fcfcfc" : "white")};

  /* 오늘 날짜는 연한 주황색 배경으로 오버라이드 */
  background-color: ${(props) =>
    props.isToday ? "#ffe0b2" : props.isEmpty ? "#fcfcfc" : "white"};

  &:nth-child(7n + 1) {
    color: #f44336;
  }
  &:nth-child(7n) {
    color: #2196f3;
  }
`;

const DateNumber = styled.span`
  font-size: 15px;
  font-weight: 600;
  display: block;
  margin-right: 2px;
`;

const AttendanceStamp = styled.img`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 55px;
  height: 55px;
  opacity: 0.9;
`;

const LoadingText = styled.div`
  text-align: center;
  padding: 50px;
  font-size: 18px;
  color: #555;
`;
