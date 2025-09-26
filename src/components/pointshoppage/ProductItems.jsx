// ProductSlider.jsx
import React from "react";
import styled from "styled-components";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Navigation, Grid } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

const ProductItemComponent = ({ product }) => (
  <ProductItem>
    <ProductImage src={product.imageUrl} alt={product.title} />
    <ProductInfo>
      <ProductSubInfo>{product.subInfo}</ProductSubInfo>
      <ProductTitle>{product.title}</ProductTitle>
      <ProductPoint>{product.point.toLocaleString()}P</ProductPoint>
    </ProductInfo>
  </ProductItem>
);

function ProductSlider({ products = [] }) {
  return (
    <SwiperContainer>
      <Swiper
        slidesPerView={4}
        grid={{
          rows: 3, // 4열 x 3행 = 12개
          fill: "row",
        }}
        modules={[Grid, Pagination, Navigation]}
        pagination={{ clickable: true }}
        navigation={true}
        className="mySwiper"
      >
        {products.map((product) => (
          <SwiperSlide key={product.id}>
            <ProductItemComponent product={product} />
          </SwiperSlide>
        ))}
      </Swiper>
    </SwiperContainer>
  );
}

export default ProductSlider;

const SwiperContainer = styled.div`
  width: 100%;
  .mySwiper {
    width: 100%;
    height: 980px;
    padding-bottom: 40px;
  }
  .swiper-slide {
    height: calc((100% - (30px * 2)) / 3) !important;
  }

  .swiper-button-next,
  .swiper-button-prev {
    display: none !important;
  }
  .swiper-pagination {
    display: none !important;
  }
`;

const ProductItem = styled.div`
  width: 242px;
  height: auto;
  display: flex;
  flex-direction: column;
  cursor: pointer;
`;

const ProductImage = styled.img`
  width: 100%;
  height: 242px;
  object-fit: cover;
  border-radius: 4px;
`;

const ProductInfo = styled.div`
  padding: 10px 0;
  flex-grow: 1;
`;

const ProductSubInfo = styled.p`
  font-size: 0.75rem;
  color: var(--prrimary-color);
  margin: 0 0 2px 0;
  font-weight: 500;
`;

const ProductTitle = styled.h3`
  font-size: 0.9375rem;
  font-weight: 500;
  color: #191919;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ProductPoint = styled.p`
  font-size: 1rem;
  font-weight: 500;
  color: #191919;
  margin: 4px 0 0 0;
`;
