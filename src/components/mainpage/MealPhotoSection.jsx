import { useState, useEffect } from "react";
import styled, { createGlobalStyle } from "styled-components";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Grid } from "swiper/modules";
import EatPhotoModal from "@/components/modals/EatPhotoModal";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/grid";

const BASE_API_URL =
  import.meta.env.REACT_APP_API_URL || "http://localhost:9000";

function MealPhotoSection() {
  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [studentSchoolName, setStudentSchoolName] =
    useState("학교 정보 불러오는 중...");

  const [mealPhotos, setMealPhotos] = useState([]);

  const closeModal = () => setIsModalOpen(false);

  useEffect(() => {
    fetchMealPhotos();
  }, []);

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

  return (
    <SectionWrapper>
      <SwiperStyles />
      <SectionHeader>
        <SectionTitle>급식 사진 (다른 학교 급식도 보자!)</SectionTitle>
        <MoreButton onClick={handleOpenModal}>급식 사진 업로드</MoreButton>
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
            <SwiperSlide key={photo.eatphotoId} className="meal-photo-slide">
              <MealItem>
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
  position: relative;

  &:hover {
    transform: scale(1.02);
  }

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
`;
