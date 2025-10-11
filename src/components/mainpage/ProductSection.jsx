import React, { useState, useEffect, useRef } from "react";
import styled, { createGlobalStyle } from "styled-components";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import { gsap } from "gsap"; // GSAP 임포트
import { ScrollTrigger } from "gsap/ScrollTrigger"; // ScrollTrigger 임포트
import "swiper/css";
import "swiper/css/pagination";
import api from "@/api/index";

// GSAP 플러그인 등록
gsap.registerPlugin(ScrollTrigger);

function ProductSection() {
  const sectionRef = useRef(null); // 섹션 전체 Ref
  const titleRef = useRef(null); // 제목 Ref
  const swiperContainerRef = useRef(null); // Swiper 컨테이너 Ref

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 상품 목록 로딩 함수
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await api.get("/api/products");
      setProducts(response.data);
      setError(null);
    } catch (err) {
      console.error("상품 목록 로딩 실패:", err);
      setError("상품 정보를 불러오는 데 실패했습니다.");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // ===============================================
  // GSAP: 스크롤 등장 애니메이션
  // ===============================================
  useEffect(() => {
    if (!loading && !error && products.length > 0) {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom-=100", // 섹션 상단이 뷰포트 하단에서 100px 위에 있을 때 시작
          toggleActions: "play none none none",
          once: true,
        },
        defaults: { duration: 0.8, ease: "power2.out" },
      });

      // 초기 상태 설정
      gsap.set([titleRef.current, swiperContainerRef.current], {
        opacity: 0,
        y: 50,
      });

      // 애니메이션 시퀀스 (아래에서 위로 서서히 등장)
      tl.to(titleRef.current, { opacity: 1, y: 0 }, 0).to(
        swiperContainerRef.current,
        { opacity: 1, y: 0 },
        0.2,
      );
    }

    // Cleanup for GSAP
    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, [loading, error, products]);

  // ===============================================
  // 렌더링
  // ===============================================

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

  if (products.length === 0) {
    return (
      <SectionContainer>
        <SectionTitle>등록된 신규 상품이 없습니다.</SectionTitle>
      </SectionContainer>
    );
  }

  return (
    <SectionContainer ref={sectionRef}>
      <SwiperStyles />
      <SectionTitle ref={titleRef}>신규 상품은 뭐가 있을까?</SectionTitle>
      <SwiperContainer ref={swiperContainerRef}>
        <Swiper
          modules={[Pagination]}
          pagination={{
            clickable: true,
            el: ".product-pagination",
          }}
          initialSlide={0}
          className="product-swiper"
          // ---------------------------------------------
          // ⭐ Swiper 반응형 설정
          // ---------------------------------------------
          breakpoints={{
            1025: {
              slidesPerView: 4,
              spaceBetween: 20,
            },
            769: {
              slidesPerView: 3, // 태블릿: 3개씩
              spaceBetween: 15,
            },
            481: {
              slidesPerView: 2, // 모바일: 2개씩
              spaceBetween: 10,
            },
            0: {
              slidesPerView: 1.5, // 좁은 모바일: 1.5개씩 (다음 슬라이드 힌트)
              spaceBetween: 10,
            },
          }}
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

// ===============================================
// Styled Components (반응형 추가)
// ===============================================

const SwiperStyles = createGlobalStyle`
  .product-pagination {
    margin-top: 30px; 
    text-align: center;
    
    @media (max-width: 768px) {
        margin-top: 20px;
    }
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

  /* Swiper Slide 크기는 Swiper의 slidesPerView와 spaceBetween이 제어 */
`;

const SectionContainer = styled.div`
  margin-top: 120px;
  padding: 0 40px; /* 데스크톱/태블릿 패딩 */
  overflow: hidden; /* GSAP 애니메이션 overflow 방지 */

  @media (max-width: 768px) {
    margin-top: 60px; /* 모바일 상단 여백 축소 */
    padding: 0 20px; /* 모바일 좌우 패딩 축소 */
  }
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 500;
  margin: 0;
  margin-bottom: 20px;

  @media (max-width: 768px) {
    font-size: 1.3rem; /* 모바일 글꼴 축소 */
    margin-bottom: 15px;
  }
`;

const SwiperContainer = styled.div`
  padding-bottom: 50px;
  position: relative; /* GSAP 타겟을 위한 position */

  @media (max-width: 768px) {
    padding-bottom: 30px;
  }
`;

const ProductCard = styled.div`
  display: flex;
  flex-direction: column;
  background-color: white;
  border-radius: 8px;
  cursor: pointer;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05); /* 카드에 기본 그림자 추가 */

  &:hover {
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
    transform: translateY(-5px);
    transition: all 0.3s ease-in-out;
  }

  .product-info {
    margin-top: 14px;
    padding: 0 10px 10px;
  }
`;

const ImagePlaceholder = styled.div`
  width: 100%;
  aspect-ratio: 1 / 1;
  border-radius: 8px; /* Card 전체와 맞추기 위해 상단만 둥글게 */
  background-color: #eeeeee;
  overflow: hidden;
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
  text-align: left; /* 왼쪽 정렬로 변경 */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  @media (max-width: 768px) {
    font-size: 0.95rem;
  }
`;

const ProductPoints = styled.span`
  font-weight: 600;
  margin-top: 4px;
  display: block;
  text-align: left; /* 왼쪽 정렬로 변경 */
  color: var(--primary-color, #e91e63);

  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;
