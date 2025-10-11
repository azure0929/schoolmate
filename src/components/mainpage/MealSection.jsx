import React, { useState, useEffect, useRef, useCallback } from "react";
import styled, { createGlobalStyle } from "styled-components";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import api from "@/api/index";

// GSAP 임포트
import { gsap } from "gsap";

import "swiper/css";
import "swiper/css/pagination";

const MealSection = () => {
  // GSAP Ref 추가: 섹션 전체, 제목, 슬라이드 요소들을 참조합니다.
  const sectionRef = useRef(null);
  const titleRef = useRef(null);
  const slideRefs = useRef([]);
  slideRefs.current = []; // Ref 배열 초기화

  const [swiper, setSwiper] = useState(null);
  const [monthlyMeals, setMonthlyMeals] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // 각 SwiperSlide DOM 요소를 Ref 배열에 추가하는 함수
  const addToRefs = (el) => {
    if (el && !slideRefs.current.includes(el)) {
      slideRefs.current.push(el);
    }
  };

  const processMealData = (mealData) => {
    const meals = [];
    const today = new Date();
    // UTC 기준이 아닌 로컬 시간 기준으로 yyyymmdd 생성
    const todayStr = `${today.getFullYear()}${(today.getMonth() + 1).toString().padStart(2, "0")}${today.getDate().toString().padStart(2, "0")}`;
    let todayIndex = 0;

    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(today.getDate() + i);

      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const day = date.getDate().toString().padStart(2, "0");
      const dayOfWeek = ["일", "월", "화", "수", "목", "금", "토"][
        date.getDay()
      ];
      const yyyymmdd = `${year}${month}${day}`;

      const mealForDay = mealData.find((m) => m.MLSV_YMD === yyyymmdd) || null;
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

  const fetchMonthlyMeals = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const authToken = localStorage.getItem("authToken");
    if (!authToken) {
      setError("로그인이 필요합니다. 인증 토큰이 없습니다.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await api.get("/api/school/meal", {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      const processedData = processMealData(response.data);
      setMonthlyMeals(processedData);
    } catch (err) {
      console.error("급식 정보 조회 실패:", err);
      setError("급식 정보를 불러오는 데 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMonthlyMeals();
  }, [fetchMonthlyMeals]);

  useEffect(() => {
    if (!isLoading && !error && monthlyMeals.length > 0) {
      const tl = gsap.timeline({
        defaults: { duration: 0.8, ease: "power2.out" },
      });

      // 초기 상태 숨김
      gsap.set(sectionRef.current, { opacity: 0 });
      gsap.set(titleRef.current, { y: -20, opacity: 0 });

      // 1. 섹션 전체 페이드인
      tl.to(sectionRef.current, { opacity: 1, duration: 0.5 }, 0);

      // 2. 제목 등장
      tl.to(titleRef.current, { y: 0, opacity: 1, duration: 0.5 }, 0.2);

      // 3. 슬라이드 그리드 등장 (stagger 효과)
      const slides = slideRefs.current.map((ref) =>
        ref.querySelector(".day-column"),
      );

      // 초기 활성화된 슬라이드에 GSAP 초기 상태 설정
      if (slides[activeIndex]) {
        // ⭐️ 활성화된 슬라이드에 var(--primary-color) 사용
        gsap.set(slides[activeIndex], {
          scale: 1,
          // CSS 변수 대신 강한 색상(var(--primary-color)의 대체색)을 임시로 사용하거나,
          // GlobalStyle을 통해 접근 가능한 CSS 변수를 사용해야 합니다.
          // 여기서는 F86166에 대응하는 rgba값을 사용하고, border는 CSS 변수를 직접 사용합니다.
          boxShadow: "0 8px 25px rgba(248, 97, 102, 0.25)",
          border: "2px solid var(--primary-color)",
        });
      }

      if (swiper) {
        // Swiper가 초기화된 후 Today로 이동
        swiper.slideTo(activeIndex, 500);
      }
    }
  }, [isLoading, error, monthlyMeals, swiper, activeIndex]);

  const handleSlideClick = (index) => {
    const prevActiveIndex = activeIndex;
    setActiveIndex(index);

    if (swiper) {
      // Swiper의 기본 슬라이드 전환 속도는 Swiper 컴포넌트의 speed 속성으로 제어됨
      swiper.slideTo(index, 500, false);
    }

    const prevSlide =
      slideRefs.current[prevActiveIndex]?.querySelector(".day-column");
    const newSlide = slideRefs.current[index]?.querySelector(".day-column");

    // 이전 슬라이드 비활성화 애니메이션
    if (prevSlide && prevSlide !== newSlide) {
      gsap.to(prevSlide, {
        scale: 1,
        border: "1px solid #e0e0e0",
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        duration: 0.3,
        ease: "power1.out",
      });
    }

    // 새 슬라이드 활성화 애니메이션 (약간 커졌다가 돌아오는 팝 효과)
    if (newSlide) {
      gsap.to(newSlide, {
        scale: 1.03,
        // ⭐️ 활성화 애니메이션에도 var(--primary-color)를 사용
        border: "2px solid var(--primary-color)",
        boxShadow: "0 8px 25px rgba(248, 97, 102, 0.25)",
        duration: 0.4,
        ease: "power2.out",
        onComplete: () => {
          gsap.to(newSlide, { scale: 1, duration: 0.2 });
        },
      });
    }
  };

  // 로딩 및 에러 상태에 따른 UI 분기 처리
  if (isLoading) {
    return (
      <SectionWrapper ref={sectionRef}>
        <SectionTitle ref={titleRef}>식단</SectionTitle>
        <LoadingContainer>로딩 중...</LoadingContainer>
      </SectionWrapper>
    );
  }

  if (error) {
    return (
      <SectionWrapper ref={sectionRef}>
        <SectionTitle ref={titleRef}>식단</SectionTitle>
        <ErrorContainer>{error}</ErrorContainer>
      </SectionWrapper>
    );
  }

  return (
    <SectionWrapper ref={sectionRef}>
      <SectionTitle ref={titleRef}>식단</SectionTitle>
      <SwiperPaginationStyles />
      <DayGridContainer>
        {monthlyMeals.length > 0 ? (
          <Swiper
            onSwiper={setSwiper}
            speed={800}
            breakpoints={{
              1200: {
                // 큰 화면 (데스크톱)
                slidesPerView: 4.3,
                spaceBetween: 25,
              },
              768: {
                // 태블릿
                slidesPerView: 4,
                spaceBetween: 20,
              },
              480: {
                // 작은 태블릿/큰 모바일
                slidesPerView: 2.5,
                spaceBetween: 15,
              },
              0: {
                // 모바일 (기본)
                slidesPerView: 2, // 두 개씩 보이도록 설정
                spaceBetween: 10,
              },
            }}
            modules={[Pagination]}
            pagination={{ clickable: true }}
            initialSlide={activeIndex}
            className="schedule-swiper"
          >
            {monthlyMeals.map((day, index) => (
              <SwiperSlide
                key={index}
                onClick={() => handleSlideClick(index)}
                ref={addToRefs}
              >
                <DayColumn
                  className="day-column"
                  $isToday={day.isToday}
                  $isActive={index === activeIndex}
                >
                  <DayDate
                    $isToday={day.isToday}
                    $isActive={index === activeIndex}
                  >
                    {day.formattedDate} ({day.dayName})
                  </DayDate>
                  <div className="meal-list">
                    {day.mealData ? (
                      day.mealData.dishName
                        .split("<br/>")
                        .map((item, i) => (
                          <MealItem key={i}>
                            {item.replace(/\s*\([^)]*\)/g, "")}
                          </MealItem>
                        ))
                    ) : (
                      <MealItem $noData={true}>급식 정보가 없습니다.</MealItem>
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
};
export default MealSection;

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
    transition: background 0.3s, transform 0.3s; 
  }
  .schedule-swiper .swiper-pagination-bullet-active {
    background: var(--swiper-pagination-color) !important; 
    transform: scale(1.2); 
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

  @media (max-width: 768px) {
    margin-top: 40px;
    padding: 0 24px;
  }
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 500;
  margin: 0;
  margin-bottom: 20px;

  @media (max-width: 768px) {
    font-size: 1.3rem;
    margin-bottom: 15px;
  }
`;

const DayGridContainer = styled.div`
  padding-bottom: 60px;
  overflow: visible;

  @media (max-width: 768px) {
    padding-bottom: 40px;
  }
`;

const LoadingContainer = styled.div`
  padding: 50px;
  text-align: center;
  font-size: 1.1rem;
  color: #666;
`;

const ErrorContainer = styled(LoadingContainer)`
  color: #d9534f;
  font-weight: 600;
`;

const DayColumn = styled.div`
  width: 100%;
  height: 362px;
  display: flex;
  text-align: center;
  flex-direction: column;
  padding: 20px;
  border-radius: 12px;
  cursor: pointer;
  background-color: white;

  border: 1px solid #e0e0e0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

  border: 1px solid
    ${(props) => (props.$isToday ? "var(--primary-color)" : "#e0e0e0")};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

  ${(props) =>
    props.$isActive &&
    `
    border: 2px solid var(--primary-color);
    box-shadow: 0 8px 25px rgba(248, 97, 102, 0.25);
    background-color: #fff5f7;
  `}

  @media (max-width: 768px) {
    height: 280px;
    padding: 15px;
  }

  .meal-list {
    overflow-y: auto;
    text-align: left;
    margin-top: 15px;
    padding-right: 10px;

    &::-webkit-scrollbar {
      width: 4px;
    }
    &::-webkit-scrollbar-thumb {
      background-color: #ccc;
      border-radius: 2px;
    }
    &::-webkit-scrollbar-track {
      background: transparent;
    }
  }
`;

const DayDate = styled.div`
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;

  @media (max-width: 768px) {
    font-size: 1rem;
    margin-bottom: 8px;
  }

  /* ⭐️ 오늘이면서 활성화된 경우: var(--primary-color) 사용 */
  color: ${(props) =>
    (props.$isToday && props.$isActive) || props.$isActive
      ? "var(--primary-color)"
      : "#333"};
`;

const MealItem = styled.div`
  line-height: 1.8;
  margin-bottom: 8px;

  @media (max-width: 768px) {
    font-size: 0.9rem;
    line-height: 1.6;
    margin-bottom: 6px;
  }

  color: ${(props) => (props.$noData ? "#999" : "#333")};
`;
