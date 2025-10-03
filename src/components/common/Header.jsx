import React, { useState, useEffect } from "react";
import logo from "@/assets/images/logo.png";
import styled from "styled-components";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
// 임시로 넣어둔 기본 프로필이미지 :: 추후 삭제해야됨 
import defaultProfile from "@/assets/images/default-profile.jpg";

const BASE_API_URL = import.meta.env.REACT_APP_API_URL || "http://localhost:9000/api";

const Header = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState("");

    useEffect(() => {
    // 컴포넌트가 처음 렌더링될 때 학생 정보 겟또다제
    const fetchUserProfile = async () => {
      const token = localStorage.getItem("authToken");

      // 토큰이 없으면 빠꾸
      if (!token) {
        alert("로그인이 필요합니다.");
        navigate("/");
      }

      try {
        // 프로필 정보 요청
        const response = await axios.get(`${BASE_API_URL}/profile/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUserInfo(response.data)
      } catch (error) {
        console.error("프로필 정보 조회 실패:", error);
        alert("세션이 만료되었거나 유효하지 않습니다. 다시 로그인해주세요.");
        localStorage.removeItem("authToken");
        navigate("/");
      }
    };
    fetchUserProfile();
  }, [navigate]);

  // 날짜 겟또
  const getTodayDate = (dateString) => {
    const date = new Date();
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const dayName = days[date.getDay()];
    return `${year}년 ${month}월 ${day}일 (${dayName})`;
  };

  return (
    <div className="wrap">
      <StyledHeader>
        <div className="inner">
          <div className="logo" onClick={() => navigate("/mainpage")}>
            <img src={logo} alt="logo" />
          </div>

          {userInfo && (
            <UserMenu>
              {/* 로그인 날짜 */}
              <DateInfo>{getTodayDate()}</DateInfo>

              {/* 학교, 학년, 반, 이름 정보 */}
              <UserInfoText>
                {userInfo.schoolName} {userInfo.grade}학년 {userInfo.classNo}반{" "}
                <span>{userInfo.nickname}</span>님
              </UserInfoText>

              {/* 프로필 이미지 + 마이페이지 링크 */}
              <MyPageLink to="/mypage">
                <ProfileImage 
                  src={userInfo.profileImgUrl || defaultProfile} 
                  alt="프로필 이미지" 
                />
                <MyPageText>마이페이지</MyPageText>
              </MyPageLink>

            </UserMenu>
          )}
        </div>
      </StyledHeader>
    </div>
  );
};

export default Header;

const DateInfo = styled.p`
  font-size: 14px;
  color: #888;
  white-space: nowrap;
`;

const StyledHeader = styled.div`
border-bottom: 1px solid #eee;
  .inner {
    height: 130px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .logo {
    width: 176px;
    height: 60px;
    cursor: pointer;
    }
  }
`;

const UserMenu = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
`;

const Separator = styled.div`
  width: 1px;
  height: 16px;
  background-color: #e0e0e0;
`;

const UserInfoText = styled.p`
  font-size: 16px;
  font-weight: 500;
  color: #555;
  white-space: nowrap;
  
  span {
    font-weight: bold;
    color: var(--primary-color);
  }
`;

// Link 컴포넌트에 스타일을 직접 적용
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
`;

const ProfileImage = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%; /* 원형으로 만들기 */
  object-fit: cover; /* 이미지가 찌그러지지 않도록 */
  border: 1px solid #eee;
`;

const MyPageText = styled.span`
  font-size: 16px;
  font-weight: 500;
  color: #555;
`;