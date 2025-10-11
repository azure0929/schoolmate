import { useState, useEffect, useRef } from "react"; // useRef 추가
import styled, { createGlobalStyle } from "styled-components";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Grid } from "swiper/modules";
import EatPhotoModal from "@/components/modals/EatPhotoModal";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { gsap } from "gsap"; // GSAP 임포트
import { ScrollTrigger } from "gsap/ScrollTrigger"; // ScrollTrigger 임포트

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/grid";

// GSAP 플러그인 등록
gsap.registerPlugin(ScrollTrigger);

const BASE_API_URL =
  import.meta.env.REACT_APP_API_URL || "http://localhost:9000";

function MealPhotoSection() {
  const navigate = useNavigate();

  // GSAP Ref 추가
  const sectionRef = useRef(null);
  const headerRef = useRef(null);
  const swiperContainerRef = useRef(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [studentSchoolName, setStudentSchoolName] =
    useState("학교 정보 불러오는 중...");

  const [mealPhotos, setMealPhotos] = useState([]);

  const closeModal = () => setIsModalOpen(false);

  useEffect(() => {
    fetchMealPhotos();
  }, []);

  // ... (fetchMealPhotos 및 handleOpenModal, handlePhotoUpload 로직 유지) ...
  const fetchMealPhotos = async () => {
    const authToken = localStorage.getItem("authToken");

    try {
      const response = await axios.get(
        `${BASE_API_URL}/api/v1/photos/allStudentsPhotos`,
        {
          headers: {
            ...(authToken && { Authorization: `Bearer ${authToken}` }),
          },
        },
      );

      if (Array.isArray(response.data)) {
        setMealPhotos(response.data);
      } else {
        console.warn(
          "API 응답 데이터가 예상된 배열 형식이 아닙니다.",
          response.data,
        );
        setMealPhotos([]);
      }
    } catch (error) {
      console.error("급식 사진 목록 조회 실패:", error);
    }
  };

  const handleOpenModal = async () => {
    const authToken = localStorage.getItem("authToken");
    if (!authToken) {
      alert("로그인이 필요합니다.");
      navigate("/");
      return;
    }

    try {
      const response = await axios.get(`${BASE_API_URL}/api/profile/me`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      const schoolName = response.data.schoolName || "학교 정보 없음";
      setStudentSchoolName(schoolName);

      setIsModalOpen(true);
    } catch (error) {
      console.error("프로필 조회 실패:", error);
      alert("학생 정보를 불러오는데 실패했습니다. 다시 로그인해주세요.");
    }
  };

  const handlePhotoUpload = async (file) => {
    const authToken = localStorage.getItem("authToken");
    if (!file || !authToken) {
      throw new Error("파일과 로그인 정보가 유효하지 않습니다.");
    }

    const formData = new FormData();
    formData.append("file", file);

    const response = await axios.post(
      `${BASE_API_URL}/api/v1/photos/upload`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${authToken}`,
        },
      },
    );

    fetchMealPhotos();

    return response;
  };

  // ===============================================
  // GSAP ScrollTrigger 및 호버 애니메이션
  // ===============================================
  useEffect(() => {
    // 1. 초기 등장 애니메이션 (ScrollTrigger)
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
    gsap.set([headerRef.current, swiperContainerRef.current], {
      opacity: 0,
      y: 50,
    });

    // 애니메이션 시퀀스
    tl.to(headerRef.current, { opacity: 1, y: 0 }, 0).to(
      swiperContainerRef.current,
      { opacity: 1, y: 0 },
      0.2,
    );

    // 2. 카드 호버 인터랙티브 요소 (GSAP)
    const items = document.querySelectorAll(".meal-item-gsap");
    items.forEach((item) => {
      // 호버 인
      item.addEventListener("mouseenter", () => {
        gsap.to(item, {
          scale: 1.05,
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.2)",
          duration: 0.3,
          ease: "power2.out",
        });
      });

      // 호버 아웃
      item.addEventListener("mouseleave", () => {
        gsap.to(item, {
          scale: 1,
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)", // 기본 그림자
          duration: 0.3,
          ease: "power2.out",
        });
      });
    });

    // Cleanup for GSAP
    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
      items.forEach((item) => {
        item.removeEventListener("mouseenter", () => {});
        item.removeEventListener("mouseleave", () => {});
      });
    };
  }, [mealPhotos]); // mealPhotos가 로드될 때마다 호버 이벤트를 다시 연결

  return (
    <SectionWrapper ref={sectionRef}>
      <SwiperStyles />
      <SectionHeader ref={headerRef}>
        <SectionTitle>급식 사진 (다른 학교 급식도 보자!)</SectionTitle>
        <MoreButton onClick={handleOpenModal}>급식 사진 업로드</MoreButton>
      </SectionHeader>
      <PhotoSwiperContainer ref={swiperContainerRef}>
        <Swiper
          // 데스크톱 기본 설정
          slidesPerView={4}
          spaceBetween={20}
          grid={{
            rows: 2,
            fill: "row",
          }}
          // ----------------------------------------------------
          // ⭐ 모바일 반응형 설정 (2열 2줄 = 4개)
          // ----------------------------------------------------
          breakpoints={{
            // 769px 이상 (데스크톱)
            769: {
              slidesPerView: 4,
              spaceBetween: 20,
              grid: {
                rows: 2,
                fill: "row",
              },
            },
            // 0px ~ 768px (모바일/태블릿)
            0: {
              slidesPerView: 2, // 2열
              spaceBetween: 10, // 간격 축소
              grid: {
                rows: 2, // 2줄
                fill: "row",
              },
            },
          }}
          // ----------------------------------------------------
          modules={[Grid, Pagination]}
          pagination={{
            clickable: true,
            el: ".meal-photo-pagination",
          }}
          className="meal-photo-swiper"
        >
          {mealPhotos.map((photo) => (
            <SwiperSlide key={photo.eatphotoId} className="meal-photo-slide">
              <MealItem className="meal-item-gsap">
                {" "}
                {/* GSAP 타겟 클래스 추가 */}
                <img src={photo.eatimageUrl} alt="Uploaded meal photo" />
                <SchoolOverlay>
                  {photo.schoolName ? photo.schoolName : "학교 정보 없음"}
                </SchoolOverlay>
              </MealItem>
            </SwiperSlide>
          ))}
        </Swiper>
        <div className="meal-photo-pagination" />
      </PhotoSwiperContainer>

      <EatPhotoModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onUpload={handlePhotoUpload}
        studentSchoolName={studentSchoolName}
      />
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
    background: var(--primary-color, #e91e63);
  }

  /* 데스크톱/태블릿: 4열, 2줄 = 8개 */
  .meal-photo-swiper .swiper-slide {
    width: calc(25% - 15px); /* 4열, 20px 간격 기준 */
    height: calc(50% - 10px); /* 2줄, 20px 간격 기준 */
  }

  /* ---------------- 모바일 반응형 (768px 이하) ---------------- */
  @media (max-width: 768px) {
    .meal-photo-swiper {
      padding-bottom: 20px;
    }
    
    /* 모바일: 2열, 2줄 = 4개 */
    .meal-photo-swiper .swiper-slide {
      width: calc(50% - 5px); /* 2열, 10px 간격 기준 */
      height: calc(50% - 5px); /* 2줄, 10px 간격 기준 */
    }
  }
`;

const SectionWrapper = styled.section`
  margin-top: 200px;
  padding: 0 40px; /* 데스크톱 기본 패딩 */
  overflow: hidden; /* GSAP 애니메이션 overflow 방지 */

  @media (max-width: 768px) {
    margin-top: 80px; /* 모바일 상단 여백 축소 */
    padding: 0 20px; /* 모바일 좌우 패딩 축소 */
  }
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  @media (max-width: 768px) {
    flex-direction: column; /* 모바일에서 수직 정렬 */
    align-items: flex-start;
    margin-bottom: 15px;
  }
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 500;
  margin: 0;

  @media (max-width: 768px) {
    font-size: 1.3rem;
    margin-bottom: 10px; /* 버튼과 간격 확보 */
  }
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

  @media (max-width: 768px) {
    font-size: 1rem;
    width: 140px; /* 모바일 버튼 너비 축소 */
    height: 40px; /* 모바일 버튼 높이 축소 */
  }
`;

const PhotoSwiperContainer = styled.div`
  height: fit-content;
  /* GSAP 타겟이 될 수 있도록 position 조정 */
  position: relative;
`;

const MealItem = styled.div.attrs({ className: "meal-item-gsap" })`
  width: 100%;
  aspect-ratio: 1 / 1;
  background-color: #eee;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  position: relative;
  /* GSAP가 제어할 스타일을 초기값으로 설정 */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  /* 기존 CSS 호버 효과 제거 (GSAP로 대체)
  &:hover {
    transform: scale(1.02);
  } */

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const SchoolOverlay = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  color: #ffffff;
  text-align: center;
  padding: 8px 12px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  @media (max-width: 768px) {
    font-size: 0.9rem; /* 모바일 글꼴 축소 */
    padding: 6px 10px;
  }
`;
