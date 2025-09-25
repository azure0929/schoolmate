import React from "react";
import styled, { createGlobalStyle } from "styled-components";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Grid } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/grid";

function MealPhotoSection() {
  const mealPhotos = Array(16)
    .fill(null)
    .map((_, i) => ({
      id: i + 1,
      src: `https://via.placeholder.com/200?text=Meal+${i + 1}`,
    }));

  return (
    <SectionWrapper>
      <SwiperStyles />
      <SectionHeader>
        <SectionTitle>급식 사진 (다른 학교 급식도 보자!)</SectionTitle>
        <MoreButton>급식 사진 업로드</MoreButton>
      </SectionHeader>
      <PhotoSwiperContainer>
        <Swiper
          slidesPerView={4}
          spaceBetween={20}
          grid={{
            rows: 2,
            fill: "row",
          }}
          modules={[Grid, Pagination]}
          pagination={{
            clickable: true,
            el: ".meal-photo-pagination",
          }}
          className="meal-photo-swiper"
        >
          {mealPhotos.map((photo) => (
            <SwiperSlide key={photo.id} className="meal-photo-slide">
              <MealItem>
                <img src={photo.src} alt={photo.description} />
              </MealItem>
            </SwiperSlide>
          ))}
        </Swiper>
        <div className="meal-photo-pagination" />
      </PhotoSwiperContainer>
    </SectionWrapper>
  );
}

export default MealPhotoSection;

const SwiperStyles = createGlobalStyle`
  .meal-photo-swiper {
    padding-bottom: 30px;
  }

  .meal-photo-pagination {
    text-align: center;
  }
  
  .meal-photo-pagination .swiper-pagination-bullet {
    background: #ccc;
    opacity: 1;
    width: 10px;
    height: 10px;
    margin: 0 5px;
  }

  .meal-photo-pagination .swiper-pagination-bullet-active {
    background: #e91e63;
  }

  .meal-photo-slide {
    width: calc(25% - 15px); 
    height: calc(50% - 10px); 
  }
`;

const SectionWrapper = styled.section`
  margin-top: 200px;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 500;
  margin: 0;
`;

const MoreButton = styled.button`
  border-radius: 8px;
  text-align: center;
  font-size: 1.375rem;
  width: 180px;
  height: 52px;
  transition: background-color 0.2s;
  color: #ababab;
  background-color: #eeeeee;
  cursor: pointer;

  &:hover {
    color: #fff;
    background-color: var(--primary-color, #e91e63);
  }
`;

const PhotoSwiperContainer = styled.div`
  height: fit-content;
`;

const MealItem = styled.div`
  width: 100%;
  aspect-ratio: 1 / 1;
  background-color: #eee;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s;

  &:hover {
    transform: scale(1.02);
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;
