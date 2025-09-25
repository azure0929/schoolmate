import React from "react";
import styled from "styled-components";

function ProductSection() {
  const products = [
    {
      name: "스타벅스 아메리카노",
      price: "4,500P",
      src: "https://i.imgur.com/r0yD3XG.jpg",
    },
    {
      name: "스타벅스 라떼",
      price: "5,000P",
      src: "https://i.imgur.com/gK2oM2L.jpg",
    },
    {
      name: "투썸 초콜릿 케이크",
      price: "6,500P",
      src: "https://i.imgur.com/tYtQ5nK.jpg",
    },
    {
      name: "BHC 뿌링클 (콜라 포함)",
      price: "21,000P",
      src: "https://i.imgur.com/8Q9lK7r.jpg",
    },
    {
      name: "CU 모바일 상품권",
      price: "10,000P",
      src: "https://i.imgur.com/r0yD3XG.jpg",
    },
    // 추가 상품은 스크롤로 보여줄 수 있습니다.
  ];

  return (
    <SectionContainer>
      <SectionTitle>신규 상품은 뭐가 있을까?</SectionTitle>
      <ProductGrid>
        {products.map((product, index) => (
          <ProductCard key={index}>
            <ImagePlaceholder src={product.src} />
            <ProductName>{product.name}</ProductName>
            <ProductPrice>{product.price}</ProductPrice>
          </ProductCard>
        ))}
      </ProductGrid>
    </SectionContainer>
  );
}

export default ProductSection;

// ProductSection 스타일
const SectionContainer = styled.div`
  padding: 20px 0;
`;

const SectionTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 15px;
  color: #333;
`;

const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 20px;
  overflow-x: auto; /* 상품 목록이 5개 이상일 경우 스크롤링 대비 */
  padding-bottom: 10px;
`;

const ProductCard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: white;
  border-radius: 8px;
  padding: 15px 10px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
  min-width: 200px;
  cursor: pointer;
`;

const ImagePlaceholder = styled.div`
  width: 100px;
  height: 100px;
  background-color: #eee;
  border-radius: 5px;
  margin-bottom: 10px;
  background-image: url(${(props) => props.src});
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
`;

const ProductName = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: #333;
  text-align: center;
  margin-bottom: 5px;
`;

const ProductPrice = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: #e91e63;
`;
