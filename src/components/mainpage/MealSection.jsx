import React from "react";
import styled, { createGlobalStyle } from "styled-components";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

function MealSection() {
  const baseMeals = [
    {
      meal: [
        "칼슘찹쌀흑미밥",
        "오징어무국",
        "안동찜닭",
        "무말랭이진미채초무침",
        "김말이튀김",
        "떡볶이",
        "배추김치",
      ],
    },
  ];

  const gap = 20;
  const slidesPerView = 4.3;

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}.${month}.${day}`;
  };

  const generateMonthlyMeal = (mealData) => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();

    const lastDayOfMonth = new Date(year, month + 1, 0).getDate();

    const monthlyMeals = [];

    for (let day = 1; day <= lastDayOfMonth; day++) {
      const date = new Date(year, month, day);

      monthlyMeals.push({
        date: formatDate(date),
        meal: mealData[(day - 1) % mealData.length].meal,
      });
    }
    return monthlyMeals;
  };

  const days = generateMonthlyMeal(baseMeals);
  const todayDate = formatDate(new Date());

  const activeDayIndex = days.findIndex((day) => day.date === todayDate);

  const initialSlideIndex = activeDayIndex !== -1 ? activeDayIndex : 0;

  return (
    <SectionWrapper>
      <SectionTitle>식단</SectionTitle>

      <SwiperPaginationStyles />

      <DayGridContainer>
        <Swiper
          slidesPerView={slidesPerView}
          spaceBetween={gap}
          modules={[Pagination]}
          pagination={{
            clickable: true,
          }}
          initialSlide={initialSlideIndex}
          className="schedule-swiper"
        >
          {days.map((day, index) => {
            const isActive = day.date === todayDate;

            return (
              <SwiperSlide key={index}>
                <DayColumn $active={isActive}>
                  <DayDate $active={isActive}>{day.date}</DayDate>
                  <div className="meal-list">
                    {day.meal.map((item, i) => (
                      <MealItem key={i}>{item}</MealItem>
                    ))}
                  </div>
                </DayColumn>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </DayGridContainer>
    </SectionWrapper>
  );
}

export default MealSection;

const SwiperPaginationStyles = createGlobalStyle`
  :root {
    --swiper-pagination-color: #e91e63;
  }

  .schedule-swiper .swiper-pagination-bullet {
    background: #ccc; 
    opacity: 1;
    width: 8px;
    height: 8px;
    margin: 0 4px;
    transition: background 0.3s;
  }
  
  .schedule-swiper .swiper-pagination-bullet-active {
    background: var(--swiper-pagination-color, #e91e63) !important; 
  }

  .schedule-swiper .swiper-pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative; 
    margin-top: 30px;
    height: 10px;
  }
`;

const SectionWrapper = styled.section`
  position: relative;
  margin-top: 100px;
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 500;
  margin: 0;
  margin-bottom: 20px;
`;

const DayGridContainer = styled.div`
  padding-bottom: 60px;
  overflow: visible;
`;

const DayColumn = styled.div`
  width: 100%;
  height: 362px;
  display: flex;
  text-align: center;
  flex-direction: column;
  padding: 20px;
  border: 1px solid ${(props) => (props.$active ? "#e91e63" : "#e0e0e0")};
  background-color: ${(props) => (props.$active ? "#fff5f7" : "white")};
  box-shadow: ${(props) =>
    props.$active
      ? "0 4px 15px rgba(233, 30, 99, 0.15)"
      : "0 2px 8px rgba(0,0,0,0.05)"};
  transition: all 0.3s ease;
  cursor: pointer;
  border-radius: 12px;

  &:hover {
    transform: none;
    box-shadow: ${(props) =>
      props.$active
        ? "0 4px 15px rgba(233, 30, 99, 0.15)"
        : "0 2px 8px rgba(0,0,0,0.05)"};
  }
  .meal-list {
    overflow-y: scroll;
  }
`;

const DayDate = styled.div`
  font-size: 1.375rem;
  font-weight: 500;
  color: ${(props) => (props.$active ? "#e91e63" : "#333")};
  margin-bottom: 12px;
  border-bottom: 1px solid ${(props) => (props.$active ? "#ffdde5" : "#f0f0f0")};
  padding-bottom: 8px;
`;

const MealItem = styled.div`
  line-height: 1.8;
  white-space: nowrap;
  text-overflow: ellipsis;
  margin-bottom: 12px;
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
