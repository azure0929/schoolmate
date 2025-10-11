import React, { useState, useEffect, useRef } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import styled from "styled-components";
import dayjs from "dayjs";
import { gsap } from "gsap";
import api from "@/api/index";

const SchoolSchedule = () => {
  const [date, setDate] = useState(new Date());
  const [schedules, setSchedules] = useState([]);
  const calendarRef = useRef(null);

  useEffect(() => {
    if (calendarRef.current) {
      // 컴포넌트 마운트 시 한 번만 실행되는 진입 애니메이션
      gsap.to(calendarRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power3.out",
      });
    }
  }, []);

  const fetchSchedule = async (year, month) => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await api.get("/api/school/schedule", {
        headers: { Authorization: `Bearer ${token}` },
        params: { year, month },
      });
      setSchedules(response.data);
    } catch (err) {
      console.error("학사일정 조회 실패:", err);
      // 에러 발생 시 일정을 비웁니다.
      setSchedules([]);
    }
  };

  useEffect(() => {
    // date 상태가 변경될 때마다 (월이 변경될 때마다) API 호출
    const year = dayjs(date).year();
    const month = dayjs(date).month() + 1;
    fetchSchedule(year, month);
  }, [date]);

  const tileContent = ({ date, view }) => {
    if (view === "month") {
      const yyyymmdd = dayjs(date).format("YYYYMMDD");
      // 해당 날짜의 스케줄 중 상위 2개만 표시 (모바일 대응 및 공간 확보)
      const daySchedules = schedules
        .filter((s) => s.AA_YMD === yyyymmdd)
        .slice(0, 2);
      return (
        <>
          {daySchedules.map((s, i) => (
            <div key={i} className="schedule-item">
              {s.EVENT_NM}
            </div>
          ))}
        </>
      );
    }
  };

  return (
    <CalendarWrapper ref={calendarRef}>
      {" "}
      <h2>학사 일정</h2>
      <Calendar
        value={new Date()} // 오늘 날짜를 항상 포커스
        activeStartDate={date} // 현재 보고 있는 달을 제어
        onActiveStartDateChange={({ activeStartDate }) =>
          setDate(activeStartDate)
        }
        onChange={setDate}
        tileContent={tileContent}
        calendarType="gregory"
        formatDay={(locale, date) => dayjs(date).format("D")}
        next2Label={null}
        prev2Label={null}
      />
    </CalendarWrapper>
  );
};

export default SchoolSchedule;

const PRIMARY_COLOR = "#f86166"; // 스타일 변수 정의 (필요에 따라 var() 대신 사용)

const CalendarWrapper = styled.div`
  margin-top: 40px;
  width: 100%;
  max-width: 1200px;
  box-sizing: border-box;

  opacity: 0;
  transform: translateY(20px);

  @media (max-width: 768px) {
    margin-top: 20px;
    padding: 0 10px;
  }

  /* 전체 달력 컨테이너 */
  .react-calendar {
    margin-top: 30px;
    width: 100%;
    border: 1px solid var(--border-color, #e0e0e0);
    border-radius: 12px;
    padding: 20px;
    font-family: "Pretendard", sans-serif;
    background: white;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);

    @media (max-width: 768px) {
      padding: 10px;
    }
  }

  /* 헤더 (2025년 10월) */
  .react-calendar__navigation__label {
    font-size: 1.2rem;
    font-weight: 600;
    color: var(--text-primary, #191919);
    pointer-events: none; /* 년/월 클릭 비활성화 */

    @media (max-width: 768px) {
      font-size: 1rem;
    }
  }

  /* 헤더 버튼 (< >) */
  .react-calendar__navigation button {
    min-width: 44px;
    background: none;
    border: none;
    font-size: 1.5rem;
    color: var(--text-primary, #191919);
    cursor: pointer;

    @media (max-width: 768px) {
      min-width: 30px;
      font-size: 1.2rem;
    }

    &:hover {
      background-color: #f8f8f8;
      border-radius: 6px;
    }
  }

  /* 요일 (일, 월, 화...) */
  .react-calendar__month-view__weekdays__weekday {
    padding: 0.5em;
    font-weight: 600;
    color: #666;
    text-decoration: none; /* 밑줄 제거 */

    @media (max-width: 768px) {
      font-size: 0.8rem;
    }
  }

  /* 날짜 타일(칸) */
  .react-calendar__tile {
    height: 100px;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding: 6px;
    background: none;
    border: 2px solid transparent; /* 테두리 영역을 미리 확보 */
    border-radius: 8px; /* 테두리 굵기만큼 반지름 증가 */
    transition: background-color 0.2s;

    @media (max-width: 768px) {
      height: 70px;
      padding: 4px;
    }

    &:hover {
      background-color: #f8f8f8;
    }
  }

  /* 오늘 날짜 */
  .react-calendar__tile--now {
    font-weight: bold;
    /* 오늘 날짜 자체에는 특별한 배경색을 주지 않음 */
  }

  /* 선택된 날짜(포커스) 스타일을 배경 채우기에서 테두리로 변경 */
  .react-calendar__tile--active {
    background: #fff5f7; /* primary 색상의 아주 연한 버전 */
    color: var(--text-primary, #191919);
    font-weight: bold;
    border: 2px solid ${PRIMARY_COLOR}; /* ${PRIMARY_COLOR} 사용 */

    &:hover {
      background: #fff5f7;
    }
  }

  .react-calendar__tile:enabled:focus {
    outline: none;
  }
  .react-calendar__tile--active:enabled:focus {
    background: #fff5f7;
    border: 2px solid ${PRIMARY_COLOR};
  }

  /* 다른 달의 날짜들 */
  .react-calendar__month-view__days__day--neighboringMonth {
    color: #ccc;
  }

  /* 학사일정 아이템 */
  .schedule-item {
    font-size: 0.75rem;
    margin-top: 4px;
    padding: 3px 6px;
    border-radius: 4px;
    background: var(--secondary-color, #f0f0f0);
    color: var(--text-primary, #191919);
    width: 100%;
    text-align: left;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    @media (max-width: 768px) {
      font-size: 0.65rem;
      padding: 2px 4px;
      margin-top: 2px;
    }
  }
`;
