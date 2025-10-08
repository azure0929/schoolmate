import React, { useState } from "react";
import styled, { css } from "styled-components";
import { HiUserGroup } from "react-icons/hi";
import { BsBoxes } from "react-icons/bs";
import { BiSolidBarChartAlt2 } from "react-icons/bi";
import logoWhite from "@/assets/images/logo_white.png";
import { useNavigate } from "react-router-dom";

import MemberManagement from "@/components/admin/MemberManagement";
import ProductManagement from "@/components/admin/ProductManagement";

const Sidebar = ({ activeTab, onTabChange, navigate }) => {
  const handleLogout = () => {
    // 1. 클라이언트 측 토큰 삭제
    localStorage.removeItem("authToken");

    // 2. 로그인 페이지로 redirect
    navigate("/");
  };

  return (
    <SidebarContainer>
      <Logo>
        <img src={logoWhite} alt="logo" />
      </Logo>
      <div className="tabs">
        <TabButton
          onClick={() => onTabChange("member")}
          $active={activeTab === "member"}
        >
          <span>
            <HiUserGroup />
          </span>
          학생 정보
        </TabButton>
        <TabButton
          onClick={() => onTabChange("product")}
          $active={activeTab === "product"}
        >
          <span>
            <BsBoxes />
          </span>
          상품 관리
        </TabButton>
        <TabButton onClick={() => handleLogout()}>로그아웃</TabButton>
      </div>
    </SidebarContainer>
  );
};

const renderContent = (activeTab) => {
  switch (activeTab) {
    case "member":
      return <MemberManagement />;
    case "product":
      return <ProductManagement />;
    default:
      return <MemberManagement />;
  }
};

const Admin = () => {
  const [activeTab, setActiveTab] = useState("member");
  const navigate = useNavigate();

  return (
    <AdminLayout>
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        navigate={navigate}
      />
      <ContentContainer>{renderContent(activeTab)}</ContentContainer>
    </AdminLayout>
  );
};

export default Admin;

const AdminLayout = styled.div`
  display: flex;
  width: 100vw;
  height: 100vh;
`;

const SidebarContainer = styled.div`
  /* AdminLayout의 height: 100vh를 상속받아 높이를 채움 */
  height: 100%;
  background-color: #353535;
  color: #fff;
  display: flex;
  flex-direction: column;
  flex-shrink: 0; /* 너비가 줄어들지 않도록 고정 */

  .tabs {
    margin-top: 100px;
    display: flex;
    flex-direction: column;
    gap: 30px;
  }
`;

const Logo = styled.h1`
  margin: 0 auto;
  width: 176px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 80px;
`;

const TabButton = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  width: 100%;
  height: 56px;
  color: #fff;
  cursor: pointer;
  transition: background-color 0.2s;

  & > span {
    margin-right: 14px;
    font-size: 1.5rem;
  }

  ${(props) =>
    props.$active &&
    css`
      background-color: #d8383a;
      color: #fff;
      font-weight: 500;
    `}

  &:hover {
    background-color: ${(props) => (props.$active ? "#d8383a" : "#4a4a4a")};
  }
`;

const ContentContainer = styled.div`
  flex-grow: 1;
  padding: 40px;
  /* flex-grow를 사용하고, 넘칠 경우 스크롤 허용 */
  height: 100%;
  overflow-y: auto;
  box-sizing: border-box; /* padding이 전체 높이에 포함되도록 */
  background-color: #ffffff;
`;
