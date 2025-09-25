import React from "react";
import styled from "styled-components";

function MealSection() {
  // 실제 이미지가 아닌 더미 데이터를 사용합니다.
  const mealPhotos = Array(12)
    .fill(null)
    .map((_, i) => ({
      id: i + 1,
      src: `https://via.placeholder.com/200?text=Meal+${i + 1}`, // 실제 이미지 URL로 대체
      description: "학교 급식 사진",
    }));

  return (
    <SectionWrapper>
      <SectionHeader>
        <SectionTitle>급식 사진</SectionTitle>
        <MoreButton>급식 사진 더보기</MoreButton>
      </SectionHeader>
      <MealGrid>
        {mealPhotos.map((photo) => (
          <MealItem key={photo.id}>
            <img src={photo.src} alt={photo.description} />
          </MealItem>
        ))}
      </MealGrid>
    </SectionWrapper>
  );
}

export default MealSection;

const SectionWrapper = styled.section`
  padding: 20px 0;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end; /* 텍스트 베이스라인 정렬 */
  margin-bottom: 20px;
`;

const SectionTitle = styled.h2`
  font-size: 18px;
  font-weight: 700;
  color: #333;
  margin: 0;
`;

const MoreButton = styled.button`
  background: none;
  border: 1px solid #ddd;
  color: #555;
  padding: 6px 15px;
  border-radius: 20px;
  font-size: 13px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #f0f0f0;
  }
`;

const MealGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr); /* 6열 그리드 */
  gap: 10px; /* 사진 간 간격 */
`;

const MealItem = styled.div`
  width: 100%;
  aspect-ratio: 1 / 1; /* 정사각형 */
  background-color: #eee;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: transform 0.2s;

  &:hover {
    transform: scale(1.03);
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;
