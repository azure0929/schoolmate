import React, { useState, useEffect } from "react";
import styled, { createGlobalStyle } from "styled-components";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import axios from "axios";

const BASE_API_URL =
  import.meta.env.REACT_APP_API_URL || "http://localhost:9000/api";

const api = axios.create({
  baseURL: BASE_API_URL,
});

api.interceptors.request.use(
  (config) => {
    // 필요하다면 토큰을 여기에 추가
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

function ProductSection() {
  // 상품 목록 상태
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 상품 목록 로딩 함수
  const fetchProducts = async () => {
    setLoading(true);
    try {
      // API 경로: 관리자 페이지와 동일한 GET /products 사용 가정
      const response = await api.get("/products");
      setProducts(response.data);
      setError(null);
    } catch (err) {
      console.error("상품 목록 로딩 실패:", err);
      setError("상품 정보를 불러오는 데 실패했습니다.");
      setProducts([]); // 실패 시 목록 비우기
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const gap = 20;
  const slidesPerView = 4;

  if (loading) {
    return (
      <SectionContainer>
        <SectionTitle style={{ textAlign: "center" }}>
          상품을 불러오는 중...
        </SectionTitle>
      </SectionContainer>
    );
  }

  if (error) {
    return (
      <SectionContainer>
        <SectionTitle style={{ color: "#ff0000" }}>
          상품을 불러오는데 실패했습니다...
        </SectionTitle>
      </SectionContainer>
    );
  }

  // 상품이 없을 경우 (API 성공했으나 데이터가 비어있음)
  if (products.length === 0) {
    return (
      <SectionContainer>
        <SectionTitle>등록된 신규 상품이 없습니다.</SectionTitle>
      </SectionContainer>
    );
  }

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
          {products.map((product) => (
            <SwiperSlide key={product.productId}>
              <ProductCard>
                <ImagePlaceholder>
                  {product.imageUrl && (
                    <ProductImage
                      src={product.imageUrl}
                      alt={product.productName}
                    />
                  )}
                </ImagePlaceholder>
                <div className="product-info">
                  <ProductName>{product.productName}</ProductName>
                  <ProductPoints>
                    {new Intl.NumberFormat().format(product.productPoints)}P
                  </ProductPoints>
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
  background-color: #eeeeee; /* 이미지가 없을 때의 배경색 */
  overflow: hidden; /* 이미지가 박스 밖으로 튀어나가지 않도록 */
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ProductImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
`;

const ProductName = styled.span`
  font-weight: 500;
  display: block;
  text-align: center;
`;

const ProductPoints = styled.span`
  font-weight: 500;
  margin-top: 4px;
  display: block;
  text-align: right;
`;
