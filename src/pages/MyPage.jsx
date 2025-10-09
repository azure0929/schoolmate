import React, { useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import api from "@/api";

// 모든 하위 컴포넌트들을 import 합니다.
import TopMenu from "@/components/mainpage/TopMenu";
import ProfileContent from "@/components/mypage/ProfileContent";
import ActivityLogContent from "@/components/mypage/ActivityLogContent"; // 실제 컴포넌트로 교체
import ActionConfirmModal from "@/components/modals/ActionConfirmModal";

const MyPage = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [modalType, setModalType] = useState(null); // 'logout' 또는 'withdrawal'
  const navigate = useNavigate();

  // --- 실제 기능 구현 ---
  const handleLogout = () => {
    console.log("로그아웃 실행");
    localStorage.removeItem("authToken"); // 로컬 스토리지에서 토큰 삭제
    navigate("/"); // 로그인 페이지로 이동
  };

  const handleWithdrawal = async () => {
    console.log("회원탈퇴 실행");
    try {
      // 백엔드에 회원 탈퇴 API 요청
      await api.delete("api/students/me");
      alert("회원 탈퇴가 완료되었습니다.");
      localStorage.removeItem("authToken"); // 토큰 삭제
      navigate("/"); // 로그인 페이지로 이동
    } catch (error) {
      alert(error.response?.data?.message || "회원 탈퇴에 실패했습니다.");
    }
  };

  // 선택된 탭에 따라 보여줄 컨텐츠를 결정하는 함수
  const renderContent = () => {
    switch (activeTab) {
      case "profile":
        return (
          <ProfileContent
            onLogoutClick={() => setModalType("logout")}
            onWithdrawalClick={() => setModalType("withdrawal")}
            forceLogout={handleLogout}
          />
        );
      case "activityLog":
        return <ActivityLogContent />; // 실제 활동 기록 컴포넌트 렌더링
      default:
        return <ProfileContent />;
    }
  };

  return (
    <PageWrapper>
      <TopMenu />
      <Container>
        <TabContainer>
          <TabButton
            $isActive={activeTab === "profile"}
            onClick={() => setActiveTab("profile")}
          >
            프로필
          </TabButton>
          <TabButton
            $isActive={activeTab === "activityLog"}
            onClick={() => setActiveTab("activityLog")}
          >
            활동 기록
          </TabButton>
        </TabContainer>

        <ContentArea>{renderContent()}</ContentArea>
      </Container>

      {/* 로그아웃/회원탈퇴 모달 렌더링 */}
      {modalType && (
        <ActionConfirmModal
          type={modalType}
          onClose={() => setModalType(null)}
          onConfirm={modalType === "logout" ? handleLogout : handleWithdrawal}
        />
      )}
    </PageWrapper>
  );
};

export default MyPage;

// --- Styled Components ---
const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
`;

const Container = styled.div`
  width: 100%;
  max-width: 1000px;
  padding: 40px 20px;
`;

const TabContainer = styled.div`
  display: flex;
  gap: 24px;
  border-bottom: 1px solid #ddd;
`;

const TabButton = styled.button`
  border: none;
  background: none;
  padding: 12px 4px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  color: ${(props) => (props.$isActive ? "var(--primary-color)" : "#888")};
  border-bottom: 3px solid
    ${(props) => (props.$isActive ? "var(--primary-color)" : "transparent")};
  transition: all 0.2s;
  margin-bottom: -1px; // 하단 경계선과 겹치도록
`;

const ContentArea = styled.div`
  margin-top: 40px;
`;
