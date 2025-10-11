import React from "react";
import styled, { css } from "styled-components";

// SignUp.jsx에서 사용했던 allergy 이미지 import들을 그대로 가져옵니다.
import allergy1 from "@/assets/images/allergy1.png";
import allergy2 from "@/assets/images/allergy2.png";
import allergy3 from "@/assets/images/allergy3.png";
import allergy4 from "@/assets/images/allergy4.png";
import allergy5 from "@/assets/images/allergy5.png";
import allergy6 from "@/assets/images/allergy6.png";
import allergy7 from "@/assets/images/allergy7.png";
import allergy8 from "@/assets/images/allergy8.png";
import allergy9 from "@/assets/images/allergy9.png";
import allergy10 from "@/assets/images/allergy10.png";
import allergy11 from "@/assets/images/allergy11.png";
import allergy12 from "@/assets/images/allergy12.png";
import allergy13 from "@/assets/images/allergy13.png";
import allergy14 from "@/assets/images/allergy14.png";
import allergy15 from "@/assets/images/allergy15.png";
import allergy16 from "@/assets/images/allergy16.png";
import allergy17 from "@/assets/images/allergy17.png";
import allergy18 from "@/assets/images/allergy18.png";
import allergy19 from "@/assets/images/allergy19.png";

const allergyData = [
  { id: 1, name: "알류", icon: allergy1 },
  { id: 2, name: "우유", icon: allergy2 },
  { id: 3, name: "땅콩", icon: allergy3 },
  { id: 4, name: "밀", icon: allergy4 },
  { id: 5, name: "고등어", icon: allergy5 },
  { id: 6, name: "조개류", icon: allergy6 },
  { id: 7, name: "닭고기", icon: allergy7 },
  { id: 8, name: "돼지고기", icon: allergy8 },
  { id: 9, name: "쇠고기", icon: allergy9 },
  { id: 10, name: "복숭아", icon: allergy10 },
  { id: 11, name: "새우", icon: allergy11 },
  { id: 12, name: "토마토", icon: allergy12 },
  { id: 13, name: "호두", icon: allergy13 },
  { id: 14, name: "오징어", icon: allergy14 },
  { id: 15, name: "게", icon: allergy15 },
  { id: 16, name: "아몬드", icon: allergy16 },
  { id: 17, name: "키위", icon: allergy17 },
  { id: 18, name: "사과", icon: allergy18 },
  { id: 19, name: "간장", icon: allergy19 },
];

const AllergySelector = ({ selectedAllergies, onAllergyChange }) => {
  return (
    <Container>
      <Title>알레르기 선택</Title>
      <AllergyGrid>
        {allergyData.map((item) => (
          <AllergyItem
            key={item.id}
            // 클릭 시 부모로부터 받은 onAllergyChange 함수를 호출하여 변경된 id를 전달
            onClick={() => onAllergyChange(item.id)}
            // 부모로부터 받은 selectedAllergies 배열에 현재 id가 포함되어 있는지 확인
            selected={selectedAllergies.includes(item.id)}
          >
            <img src={item.icon} alt={item.name} />
            <p>{item.name}</p>
          </AllergyItem>
        ))}
      </AllergyGrid>
    </Container>
  );
};

export default AllergySelector;

const Container = styled.div`
  padding: 20px;
`;
const Title = styled.h3`
  font-size: 1.5rem;
  margin-bottom: 20px;
  text-align: center;
`;
const AllergyGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(70px, 1fr));
  gap: 20px;
  padding: 20px 0;
`;

const AllergyItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  border: 2px solid transparent;
  transition: all 0.2s;

  img {
    width: 50px;
    height: 50px;
    margin-bottom: 8px;
  }
  p {
    font-size: 0.875rem;
    color: #666;
    margin: 0;
  }

  ${(props) =>
    props.selected &&
    css`
      border-color: var(--primary-color);
      background-color: #fff5f7;
    `}
`;
