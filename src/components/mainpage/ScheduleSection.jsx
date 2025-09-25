import React from "react";
import styled, { createGlobalStyle } from "styled-components";
import { Swiper, SwiperSlide } from "swiper/react";
// 🚨 Swiper core 및 Pagination 모듈 Import
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

function ScheduleSection() {
  const days = [
    {
      date: "2025.09.10",
      active: false,
      schedule: ["수학", "영어", "음악실기", "체육", "국어", "정보"],
    },
    {
      date: "2025.09.11",
      active: false,
      schedule: ["미술", "국어", "정보", "영어", "수학", "음악"],
    },
    {
      date: "2025.09.12",
      active: true,
      schedule: ["컴퓨터그래픽", "정보", "국어", "미술", "영어", "과학"],
    },
    {
      date: "2025.09.13",
      active: false,
      schedule: ["음악이론", "미술실기", "영어", "체육", "국어", "정보"],
    },
    {
      date: "2025.09.14",
      active: false,
      schedule: ["미술", "국어", "정보", "영어", "수학", "음악"],
    },
    {
      date: "2025.09.15",
      active: false,
      schedule: ["컴퓨터그래픽", "정보", "국어", "미술", "영어", "과학"],
    },
    {
      date: "2025.09.16",
      active: false,
      schedule: ["음악이론", "미술실기", "영어", "체육", "국어", "정보"],
    },
  ];

  const gap = 12;
  const slidesPerView = 4.3;

  return (
    <SectionWrapper>
      <SectionTitle>시간표</SectionTitle>

      {/* DayGridContainer를 사용하여 Swiper와 Pagination을 래핑 */}
      <DayGridContainer>
        <Swiper
          slidesPerView={slidesPerView}
          spaceBetween={gap}
          // 🚨 Pagination 모듈 사용 등록
          modules={[Pagination]}
          pagination={{
            clickable: true, // 🚨 원형 점 클릭 활성화
          }}
          // Swiper의 클래스를 사용하여 커스텀 스타일링을 적용할 수 있도록 합니다.
          className="schedule-swiper"
        >
          {days.map((day, index) => (
            <SwiperSlide key={index}>
              <DayColumn active={day.active}>
                <DayDate active={day.active}>{day.date}</DayDate>
                {day.schedule.map((item, i) => (
                  <ScheduleItem key={i}>{item}</ScheduleItem>
                ))}
              </DayColumn>
            </SwiperSlide>
          ))}

          {/* '...' placeholder를 별도의 SwiperSlide로 유지 (이미지 레이아웃 유지) */}
          <SwiperSlide style={{ width: "30px", flex: "0 0 auto" }}>
            <DotsPlaceholder>
              <span />
              <span />
              <span />
            </DotsPlaceholder>
          </SwiperSlide>
        </Swiper>
      </DayGridContainer>
    </SectionWrapper>
  );
}

export default ScheduleSection;

/* ==============================================
Styled Components (수정 및 추가)
==============================================
*/

// 🚨 Swiper Pagination의 색상 및 스타일을 전역으로 커스터마이징합니다.
const SwiperPaginationStyles = createGlobalStyle`
  /* Swiper의 기본 클래스에 접근하여 스타일 변경 */
  .schedule-swiper .swiper-pagination-bullet {
    background: #ccc; /* 비활성화된 점 색상 */
    opacity: 1;
    width: 8px; /* 점 크기 */
    height: 8px;
    margin: 0 4px;
    transition: background 0.3s;
  }
  
  /* 🚨 활성화된 점 색상 변경: var(--primary-color) 대신 #e91e63 사용 */
  .schedule-swiper .swiper-pagination-bullet-active {
    background: #e91e63 !important; 
  }

  /* 페이지네이션이 위치할 영역의 스타일 */
  .schedule-swiper .swiper-pagination {
    bottom: -30px !important; /* 아래쪽으로 이동하여 콘텐츠와 분리 */
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative; /* relative로 변경하여 컨텐츠 아래에 위치하도록 조정 */
    margin-top: 15px;
    height: 10px; /* 높이 확보 */
  }
`;

const SectionWrapper = styled.section`
  padding: 20px 0;
  position: relative; /* DayGridContainer가 relative를 가질 경우 */
`;

const SectionTitle = styled.h2`
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 20px;
  color: #333;
`;

// Swiper와 Pagination을 래핑하여 스타일을 조정하기 위한 컨테이너
const DayGridContainer = styled.div`
  /* DayGridContainer 내부에서 커스텀 스타일 적용 */
  ${SwiperPaginationStyles}
  padding-bottom: 30px; /* Pagination이 들어갈 공간 */
`;

const DayColumn = styled.div`
  width: 100%;
  height: 362px;
  display: flex;
  text-align: center;
  flex-direction: column;
  padding: 20px;
  border: 1px solid ${(props) => (props.active ? "#e91e63" : "#e0e0e0")};
  border-radius: 12px;
  background-color: ${(props) => (props.active ? "#fff5f7" : "white")};
  box-shadow: ${(props) =>
    props.active
      ? "0 4px 15px rgba(233, 30, 99, 0.15)"
      : "0 2px 8px rgba(0,0,0,0.05)"};
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-3px);
    box-shadow: ${(props) =>
      props.active
        ? "0 6px 20px rgba(233, 30, 99, 0.2)"
        : "0 4px 12px rgba(0,0,0,0.08)"};
  }
`;

const DayDate = styled.div`
  font-size: 15px;
  font-weight: 700;
  color: ${(props) => (props.active ? "#e91e63" : "#333")};
  margin-bottom: 12px;
  border-bottom: 1px solid ${(props) => (props.active ? "#ffdde5" : "#f0f0f0")};
  padding-bottom: 8px;
`;

const ScheduleItem = styled.div`
  font-size: 14px;
  color: #555;
  line-height: 1.8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const DotsPlaceholder = styled.div`
  height: 362px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  opacity: 0.6;
  background-color: transparent;

  & > span {
    width: 5px;
    height: 5px;
    background-color: #999;
    border-radius: 50%;
    margin-bottom: 6px;
  }
`;
