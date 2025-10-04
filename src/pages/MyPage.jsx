import React, { useState, useRef, useEffect, useCallback } from "react";
import styled, { css } from "styled-components";
import { gsap } from "gsap";
import TopMenu from "@/components/mainpage/TopMenu";
// 분리된 컴포넌트 임포트
import ActivityLogContent from "@/components/mypage/ActivityLogContent";
import EditInfoContent from "@/components/mypage/EditInfoContent";

// 백엔드 기본 URL 설정
const BASE_URL = "http://localhost:9000/api";

// --- Modal Component (로그아웃/탈퇴 모달) ---
const Modal = ({ type, onClose }) => {
  const modalRef = useRef(null);
  const wrapperRef = useRef(null);

  useEffect(() => {
    gsap.to(wrapperRef.current, { opacity: 1, duration: 0.3 });
    gsap.fromTo(
      modalRef.current,
      { scale: 0.9, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.3, ease: "power2.out" },
    );

    const handleWrapperClick = (e) => {
      if (e.target === wrapperRef.current) {
        handleClose();
      }
    };
    wrapperRef.current.addEventListener("click", handleWrapperClick);

    return () => {
      if (wrapperRef.current) {
        wrapperRef.current.removeEventListener("click", handleWrapperClick);
      }
    };
  }, []);

  const handleClose = () => {
    gsap.to(wrapperRef.current, { opacity: 0, duration: 0.2 });
    gsap.to(modalRef.current, {
      scale: 0.9,
      opacity: 0,
      duration: 0.2,
      ease: "power2.in",
      onComplete: onClose,
    });
  };

  const handleConfirm = () => {
    console.log(`${type} 실행`);
    // 실제 로그아웃/탈퇴 로직 구현 필요
    handleClose();
  };

  const isWithdrawal = type === "withdrawal";
  const title = isWithdrawal ? "탈퇴 하시겠습니까?" : "로그아웃 하시겠습니까?";
  const confirmText = "예";
  const cancelText = "아니오";

  return (
    <ModalWrapper ref={wrapperRef} style={{ opacity: 0 }}>
      <ModalContent ref={modalRef}>
        <ModalText>{title}</ModalText>
        <ModalActions>
          <ConfirmButton $type={type} onClick={handleConfirm}>
            {confirmText}
          </ConfirmButton>
          <CancelButton onClick={handleClose}>{cancelText}</CancelButton>
        </ModalActions>
      </ModalContent>
    </ModalWrapper>
  );
};

// --- MyPage Main Component ---
const MyPage = () => {
  const [activeTab, setActiveTab] = useState("activityLog");
  const [modalType, setModalType] = useState(null);
  const [studentName, setStudentName] = useState("사용자");

  // 학생 이름 불러오기 (환영 메시지용)
  const fetchStudentName = useCallback(async () => {
    // LocalStorage에서 토큰 가져오기
    const authToken = localStorage.getItem("authToken");
    const headers = {
      Authorization: `Bearer ${authToken}`,
      "Content-Type": "application/json",
    };

    if (!authToken) return;

    try {
      const res = await fetch(`${BASE_URL}/students/me`, { headers });
      if (res.ok) {
        const data = await res.json();
        setStudentName(data.name || "사용자");
      }
    } catch (error) {
      console.error("학생 이름 조회 실패:", error);
    }
  }, []);

  useEffect(() => {
    fetchStudentName();
  }, [fetchStudentName]);

  const handleTabClick = (tab) => {
    if (tab === "withdrawal") {
      setModalType("withdrawal");
    } else if (tab === "logout") {
      // 로그아웃 처리 시 로컬 스토리지에서 토큰 제거
      localStorage.removeItem("authToken");
      setModalType("logout");
    } else {
      setActiveTab(tab);
    }
  };

  const handleCloseModal = () => {
    setModalType(null);
  };

  const renderContent = () => {
    switch (activeTab) {
      // 분리된 컴포넌트 렌더링
      case "activityLog":
        return <ActivityLogContent />;
      case "editInfo":
        return <EditInfoContent />;
      default:
        return null;
    }
  };

  return (
    <MainPageWrap>
      <TopMenu />
      <WelcomeMessage>
        <span>{studentName}</span>님 안녕하세요?
      </WelcomeMessage>
      <MyPageMain>
        <TabMenu>
          <TabItem
            $active={activeTab === "activityLog"}
            onClick={() => handleTabClick("activityLog")}
          >
            활동 기록
          </TabItem>
          <TabItem
            $active={activeTab === "editInfo"}
            onClick={() => handleTabClick("editInfo")}
          >
            회원 정보 수정
          </TabItem>
          <TabItem onClick={() => handleTabClick("withdrawal")}>
            회원탈퇴
          </TabItem>
          <TabItem onClick={() => handleTabClick("logout")}>로그아웃</TabItem>
        </TabMenu>

        <ContentArea>{renderContent()}</ContentArea>
      </MyPageMain>
      {modalType && <Modal type={modalType} onClose={handleCloseModal} />}
    </MainPageWrap>
  );
};

// --- Styled Components (MyPage 전용) ---

const ModalWrapper = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  width: 432px;
  height: 246px;
  border-radius: 30px;
  background-color: white;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const ModalText = styled.p`
  flex-grow: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.5rem;
  font-weight: 500;
  color: #333;
  padding: 0 40px;
`;

const ModalActions = styled.div`
  display: flex;
  height: 80px;
  border-top: 1px solid #e0e0e0;
`;

const ModalButtonBase = css`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.3rem;
  font-weight: 700;
  cursor: pointer;
  border: none;
  transition: background-color 0.1s;
`;

const ConfirmButton = styled.button`
  ${ModalButtonBase}
  background-color: #333;
  color: white;
  border-right: 1px solid #e0e0e0;
`;

const CancelButton = styled.button`
  ${ModalButtonBase}
  background-color: #f0f0f0;
  color: #333;
`;

const MainPageWrap = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px 80px;
`;

const WelcomeMessage = styled.h2`
  width: 100%;
  text-align: left;
  font-size: 2rem;
  font-weight: 500;
  margin-top: 30px;
  margin-bottom: 40px;
`;

const MyPageMain = styled.div`
  width: 100%;
`;

const TabMenu = styled.div`
  display: flex;
  justify-content: flex-start;
  margin-bottom: 50px;
  gap: 15px;
`;

const TabItem = styled.span`
  border-radius: 30px;
  width: 146px;
  height: 40px;
  text-align: center;
  line-height: 2.4rem;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease-in-out;

  background-color: ${(props) => {
    if (props.children === "회원탈퇴" || props.children === "로그아웃") {
      return "#fff";
    }
    return props.$active ? "#ffe500" : "#f0f0f0";
  }};

  color: #333;
`;

const ContentArea = styled.div`
  width: 100%;
  padding: 0 10px;
`;

export default MyPage;
