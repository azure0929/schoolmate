import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";
import styled from "styled-components";
import dayjs from "dayjs";

const CalendarWrapper = styled.div`
  margin-top: 40px;

  /* 전체 달력 컨테이너 */
  .react-calendar {
    width: 100%;
    border: 1px solid var(--border-color);
    border-radius: 12px;
    padding: 20px;
    font-family: "Pretendard", sans-serif;
    background: white;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }

  /* 헤더 (2025년 10월) */
  .react-calendar__navigation__label {
    font-size: 1.2rem;
    font-weight: 600;
    color: var(--text-primary);
    pointer-events: none; /* 년/월 클릭 비활성화 */
  }
  
  /* 헤더 버튼 (< >) */
  .react-calendar__navigation button {
    min-width: 44px;
    background: none;
    border: none;
    font-size: 1.5rem;
    color: var(--text-primary);
    cursor: pointer;
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
    
    &:hover {
      background-color: #f8f8f8;
    }
  }

  /* 오늘 날짜에 항상 포커스가 가도록 value와 activeStartDate를 동기화 */
  /* 오늘 날짜 */
  .react-calendar__tile--now {
    font-weight: bold;
    /* 오늘 날짜 자체에는 특별한 배경색을 주지 않음 */
  }
  
  /* 선택된 날짜(포커스) 스타일을 배경 채우기에서 테두리로 변경 */
  .react-calendar__tile--active {
    background: #fff5f7; /* primary 색상의 아주 연한 버전 */
    color: var(--text-primary);
    font-weight: bold;
    border: 2px solid var(--primary-color);
    
    &:hover {
      background: #fff5f7;
    }
  }

  .react-calendar__tile:enabled:focus {
    outline: none;
  }
  .react-calendar__tile--active:enabled:focus {
    background: #fff5f7;
    border: 2px solid var(--primary-color);
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
    background: var(--secondary-color);
    color: var(--text-primary);
    width: 100%;
    text-align: left;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

const BASE_API_URL = "http://localhost:9000/api/school";

const SchoolSchedule = () => {
  const [date, setDate] = useState(new Date()); 
  const [schedules, setSchedules] = useState([]);

  const fetchSchedule = async (year, month) => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.get(`${BASE_API_URL}/schedule`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { year, month } 
      });
      setSchedules(response.data);
    } catch (err) {
      console.error("학사일정 조회 실패:", err);
    }
  };

  useEffect(() => {
    const year = dayjs(date).year();
    const month = dayjs(date).month() + 1;
    fetchSchedule(year, month);
  }, [date]);

  const tileContent = ({ date, view }) => {
    if (view === "month") {
      const yyyymmdd = dayjs(date).format("YYYYMMDD");
      const daySchedules = schedules.filter(s => s.AA_YMD === yyyymmdd);
      return (
        <>
          {daySchedules.map((s, i) => (
            <div key={i} className="schedule-item">{s.EVENT_NM}</div>
          ))}
        </>
      );
    }
  };

  return (
    <CalendarWrapper>
      <h2>학사 일정</h2>
      <Calendar
        value={date}
        onActiveStartDateChange={({ activeStartDate }) => setDate(activeStartDate)} 
        onChange={setDate}
        tileContent={tileContent}
        calendarType="gregory"
        formatDay={(locale, date) => dayjs(date).format('D')}
        next2Label={null}
        prev2Label={null}
      />
    </CalendarWrapper>
  );
};

export default SchoolSchedule