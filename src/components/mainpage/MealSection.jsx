import React, { useState, useEffect, useCallback } from "react";
import styled, { createGlobalStyle } from "styled-components";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import axios from "axios";

import "swiper/css";
import "swiper/css/pagination";

const BASE_API_URL = "http://localhost:9000/api/school";

// --- 1. 모든 styled-components 정의를 컴포넌트 함수보다 위로 옮깁니다. ---

const SwiperPaginationStyles = createGlobalStyle`
  :root {
    --swiper-pagination-color: var(--primary-color, #e91e63);
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
    background: var(--swiper-pagination-color) !important; 
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
  border-radius: 12px;
  transition: all 0.3s ease;
  cursor: pointer;
  background-color: white;
  
  border: ${(props) => 
    props.$isActive 
    ? "2px solid var(--primary-color)" 
    : "1px solid #e0e0e0"};
    
  box-shadow: ${(props) =>
    props.$isActive
      ? "0 4px 15px rgba(233, 30, 99, 0.15)"
      : "0 2px 8px rgba(0,0,0,0.05)"};

  .meal-list {
    overflow-y: auto;
    text-align: left;
    margin-top: 15px;
    padding-right: 10px;
  }
`;

const DayDate = styled.div`
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;

  color: ${(props) =>
    props.$isToday && props.$isActive
      ? "#ff5f00"
      : props.$isActive
      ? "var(--primary-color)"
      : "#333"};
`;

const DotsPlaceholder = styled.div`
  height: 100%;
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

const MealItem = styled.div`
  line-height: 1.8;
  margin-bottom: 8px;
`;


const MealSection = () => {
  const [swiper, setSwiper] = useState(null);
  const [monthlyMeals, setMonthlyMeals] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);

    // 1. 로딩과 에러 상태를 관리하기 위한 state 추가
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // 날짜 및 급식 데이터 가공 로직 (기존과 동일)
  const processMealData = (mealData) => {
    const meals = [];
    const today = new Date();
    const todayStr = `${today.getFullYear()}${(today.getMonth() + 1).toString().padStart(2, '0')}${today.getDate().toString().padStart(2, '0')}`;
    let todayIndex = 0;

    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(today.getDate() + i);

      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      const dayOfWeek = ["일", "월", "화", "수", "목", "금", "토"][date.getDay()];
      const yyyymmdd = `${year}${month}${day}`;

      const mealForDay = mealData.find(m => m.MLSV_YMD === yyyymmdd) || null;
      const isToday = yyyymmdd === todayStr;

      if (isToday) {
        todayIndex = i;
      }

      meals.push({
        formattedDate: `${year}.${month}.${day}`,
        date: day,
        dayName: dayOfWeek,
        isToday: isToday,
        mealData: mealForDay ? { dishName: mealForDay.DDISH_NM } : null,
      });
    }
    setActiveIndex(todayIndex);
    return meals;
  };

    // 2. API 호출 로직을 useCallback으로 감싸고, try/catch로 에러 처리 강화
  const fetchMonthlyMeals = useCallback(async () => {
    setIsLoading(true);
    setError(null); // 요청 시작 시 에러 상태 초기화

    const authToken = localStorage.getItem("authToken");
    if (!authToken) {
      setError("로그인이 필요합니다. 인증 토큰이 없습니다.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.get(`${BASE_API_URL}/meal`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      
      const processedData = processMealData(response.data);
      setMonthlyMeals(processedData);

    } catch (err) {
      console.error("급식 정보 조회 실패:", err);
      // CORS 에러는 여기에 잡히지 않고 브라우저 콘솔에만 표시될 수 있습니다.
      setError("급식 정보를 불러오는 데 실패했습니다.");
    } finally {
      setIsLoading(false); // 성공/실패 여부와 관계없이 로딩 상태 종료
    }
  }, []); // 의존성 배열이 비어있으므로 컴포넌트가 처음 마운트될 때 한 번만 생성됩니다.


  useEffect(() => {
    fetchMonthlyMeals();
  }, [fetchMonthlyMeals]);

  const handleSlideClick = (index) => {
    setActiveIndex(index);
    if (swiper) {
      swiper.slideTo(index);
    }
  };

    // 3. 로딩 및 에러 상태에 따른 UI 분기 처리
  if (isLoading) {
    return <SectionWrapper><SectionTitle>식단</SectionTitle><div>로딩 중...</div></SectionWrapper>;
  }

  if (error) {
    return <SectionWrapper><SectionTitle>식단</SectionTitle><div>{error}</div></SectionWrapper>;
  }


  return (
    <SectionWrapper>
      <SectionTitle>식단</SectionTitle>
      <SwiperPaginationStyles />
      <DayGridContainer>
        {monthlyMeals.length > 0 ? (
          <Swiper
            onSwiper={setSwiper}
            slidesPerView={4.3}
            spaceBetween={20}
            modules={[Pagination]}
            pagination={{ clickable: true }}
            initialSlide={activeIndex}
            className="schedule-swiper"
          >
            {monthlyMeals.map((day, index) => (
              <SwiperSlide key={index} onClick={() => handleSlideClick(index)}>
                <DayColumn $isToday={day.isToday} $isActive={index === activeIndex}>
                  <DayDate $isToday={day.isToday} $isActive={index === activeIndex}>
                    {day.formattedDate} ({day.dayName})
                  </DayDate>
                  <div className="meal-list">
                    {day.mealData ? (
                      day.mealData.dishName.split("<br/>").map((item, i) => (
                        <MealItem key={i}>{item.replace(/\s*\([^)]*\)/g, '')}</MealItem>
                      ))
                    ) : (
                      <MealItem>급식 정보가 없습니다.</MealItem>
                    )}
                  </div>
                </DayColumn>
              </SwiperSlide>
            ))}
          </Swiper>
        ) : (
          <div>표시할 급식 정보가 없습니다.</div>
        )}
      </DayGridContainer>
    </SectionWrapper>
  );
}
export default MealSection;