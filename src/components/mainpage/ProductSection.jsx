import React from "react";
import styled, { createGlobalStyle } from "styled-components";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

function ProductSection() {
  const products = [
    {
      name: "스타벅스 아메리카노",
      src: "https://via.placeholder.com/284x284?text=Prod+1",
    },
    {
      name: "스타벅스 라떼",
      src: "https://via.placeholder.com/284x284?text=Prod+2",
    },
    {
      name: "투썸 초콜릿 케이크",
      src: "https://via.placeholder.com/284x284?text=Prod+3",
    },
    {
      name: "BHC 뿌링클 (콜라 포함)",
      src: "https://via.placeholder.com/284x284?text=Prod+4",
    },
    {
      name: "CU 모바일 상품권",
      src: "https://via.placeholder.com/284x284?text=Prod+5",
    },
    {
      name: "BBQ 황금올리브",
      src: "https://via.placeholder.com/284x284?text=Prod+6",
    },
    {
      name: "나이키 운동화",
      src: "https://via.placeholder.com/284x284?text=Prod+7",
    },
    {
      name: "CU 삼각김밥",
      src: "https://via.placeholder.com/284x284?text=Prod+8",
    },
  ];

  const gap = 20;
  const slidesPerView = 4;

  return (
    <SectionContainer>
      <SwiperStyles />
      <SectionTitle>신규 상품은 뭐가 있을까?</SectionTitle>
      <SwiperContainer>
        <Swiper
          slidesPerView={slidesPerView}
          spaceBetween={gap}
          modules={[Pagination]}
          pagination={{
            clickable: true,
            el: ".product-pagination",
          }}
          initialSlide={0}
          className="product-swiper"
        >
          {products.map((product, index) => (
            <SwiperSlide key={index}>
              <ProductCard>
                <ImagePlaceholder $src={product.src} />
                <div className="product-info">
                  <ProductName>{product.name}</ProductName>
                </div>
              </ProductCard>
            </SwiperSlide>
          ))}
        </Swiper>
        <div className="product-pagination" />
      </SwiperContainer>
    </SectionContainer>
  );
}

export default ProductSection;

const SwiperStyles = createGlobalStyle`
  .product-pagination {
    margin-top: 30px; 
    text-align: center;
  }
  
  .product-pagination .swiper-pagination-bullet {
    background: #ccc;
    opacity: 1;
    width: 10px;
    height: 10px;
    margin: 0 5px;
    transition: background 0.3s;
  }

  .product-pagination .swiper-pagination-bullet-active {
    background: var(--primary-color) !important; 
  }
`;

const SectionContainer = styled.div`
  margin-top: 120px;
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 500;
  margin: 0;
  margin-bottom: 20px;
`;

const SwiperContainer = styled.div`
  padding-bottom: 50px;
`;

const ProductCard = styled.div`
  display: flex;
  flex-direction: column;
  background-color: white;
  border-radius: 8px;
  cursor: pointer;
  .product-info {
    margin-top: 14px;
  }
`;

const ImagePlaceholder = styled.div`
  width: 100%;
  aspect-ratio: 1 / 1;
  border-radius: 12px;
  background-color: #eeeeee;
  background-image: url(${(props) => props.$src});
  background-size: cover;
  background-position: center;
`;

const ProductName = styled.span`
  font-weight: 500;
`;
