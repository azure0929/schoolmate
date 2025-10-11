import React, { useState, useEffect } from "react";
import logo from "@/assets/images/logo.png";
import styled from "styled-components";
import { useNavigate, Link } from "react-router-dom";
import api from "@/api/index";

const Header = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null); // 초기 상태를 null로 변경하여 로딩 처리

  useEffect(() => {
    const fetchUserProfile = async () => {
      const token = localStorage.getItem("authToken");

      if (!token) {
        // alert("로그인이 필요합니다."); // 헤더에서는 조용히 리다이렉트
        navigate("/");
        return;
      }

      try {
        const response = await api.get("/api/profile/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUserInfo(response.data);
      } catch (error) {
        console.error("프로필 정보 조회 실패:", error);
        // alert("세션이 만료되었거나 유효하지 않습니다. 다시 로그인해주세요.");
        localStorage.removeItem("authToken");
        navigate("/");
      }
    };
    fetchUserProfile();
  }, [navigate]);

  // 날짜 겟또 (함수명 오타 수정 및 로직 유지)
  const getTodayDate = () => {
    const date = new Date();
    const days = ["일", "월", "화", "수", "목", "금", "토"];
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const dayName = days[date.getDay()];
    return `${year}년 ${month}월 ${day}일 (${dayName})`;
  };

  return (
    <StyledHeader>
      <div className="inner">
        {/* 로고: 모바일에서 크기 축소 */}
        <div className="logo" onClick={() => navigate("/mainpage")}>
          <img src={logo} alt="logo" />
        </div>

        {userInfo && (
          <UserMenu>
            {/* 1. 날짜 정보: 모바일에서 숨김 */}
            <DateInfo className="hidden-mobile">{getTodayDate()}</DateInfo>

            {/* 2. 학교/학년/반/이름 정보: 모바일에서 학교명 숨김 및 텍스트 축소 */}
            <UserInfoText>
              <span className="school-info">{userInfo.schoolName}</span>
              {userInfo.grade}학년 {userInfo.classNo}반{" "}
              <span className="nickname">{userInfo.nickname}</span>님
            </UserInfoText>

            {/* 3. 프로필 이미지 + 마이페이지 링크 */}
            <MyPageLink to="/mypage">
              <ProfileImage src={userInfo.profileImgUrl} alt="프로필 이미지" />
              <MyPageText className="hidden-mobile">마이페이지</MyPageText>
            </MyPageLink>
          </UserMenu>
        )}
      </div>
    </StyledHeader>
  );
};

export default Header;

const StyledHeader = styled.div`
  border-bottom: 1px solid #eee;
  width: 100%;

  .inner {
    max-width: 1200px;
    margin: 0 auto;
    height: 130px; /* 데스크톱 높이 */
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 40px;
  }

  .logo {
    width: 176px;
    height: 60px;
    cursor: pointer;
    img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
  }

  @media (max-width: 768px) {
    .inner {
      height: 70px; /* 모바일 높이 축소 */
      padding: 0 20px; /* 모바일 패딩 축소 */
    }

    .logo {
      width: 120px; /* 모바일 로고 크기 축소 */
      height: 40px;
    }

    .hidden-mobile {
      display: none !important; /* 날짜 및 마이페이지 텍스트 숨김 */
    }
  }
`;

const UserMenu = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;

  @media (max-width: 768px) {
    gap: 10px; /* 모바일 메뉴 간격 축소 */
  }
`;

const DateInfo = styled.p`
  font-size: 14px;
  color: #888;
  white-space: nowrap;
`;

const UserInfoText = styled.p`
  font-size: 16px;
  font-weight: 500;
  color: #555;
  white-space: nowrap;

  .nickname {
    font-weight: bold;
    color: var(--primary-color);
  }

  @media (max-width: 768px) {
    font-size: 14px; /* 모바일 글꼴 축소 */

    .school-info {
      display: none; /* 모바일에서 학교명 숨김 */
    }

    /* 학년/반/이름만 표시 */
    white-space: normal; /* 필요하면 줄 바꿈 허용 */
  }

  @media (max-width: 480px) {
    font-size: 13px;
    white-space: normal;
  }
`;

const MyPageLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 30px;
  transition: background-color 0.2s;

  &:hover {
    background-color: #f5f5f5;
  }

  @media (max-width: 768px) {
    padding: 4px; /* 모바일 패딩 축소 */
  }
`;

const ProfileImage = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid #eee;

  @media (max-width: 768px) {
    width: 32px; /* 모바일 이미지 크기 축소 */
    height: 32px;
  }
`;

const MyPageText = styled.span`
  font-size: 16px;
  font-weight: 500;
  color: #555;
`;
