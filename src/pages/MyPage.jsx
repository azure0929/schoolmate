import React, { useState, useRef, useEffect } from "react";
import styled, { css } from "styled-components";
import { gsap } from "gsap";
import Header from "@/components/common/Header";
import TopMenu from "@/components/mainpage/TopMenu";

// 임시 상품 데이터 (변경 없음)
const mockExchangeList = [
  {
    id: 1,
    name: "스타벅스 아메리카노",
    point: "4,500P",
    expiry: "2025.12.31",
    exchangedDate: "2024.09.01",
    usedDate: "N/A",
    status: "unused",
  },
  {
    id: 2,
    name: "뿌링클 치킨 한마리",
    point: "18,000P",
    expiry: "2026.12.31",
    exchangedDate: "2025.09.01",
    usedDate: "2025.09.02",
    status: "used",
  },
  {
    id: 3,
    name: "이디야 카페라떼(Ice)",
    point: "1,200P",
    expiry: "2026.12.31",
    exchangedDate: "2025.08.02",
    usedDate: "N/A",
    status: "unused_imminent",
  },
  {
    id: 4,
    name: "CU 모바일 상품권",
    point: "8,000P",
    expiry: "2026.12.31",
    exchangedDate: "2025.08.21",
    usedDate: "2025.08.23",
    status: "used",
  },
];

// 모달 컴포넌트 (변경 없음)
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

const MyPage = () => {
  const [activeTab, setActiveTab] = useState("activityLog");
  const [modalType, setModalType] = useState(null);

  const handleTabClick = (tab) => {
    if (tab === "withdrawal") {
      setModalType("withdrawal");
    } else if (tab === "logout") {
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
        <span>임윤아</span>님 안녕하세요?
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

// **✅ 이 부분이 누락되었을 수 있습니다. 추가합니다.**
// export default MyPage;

// --- EditInfoContent 수정 적용 ---
const EditInfoContent = () => {
  const [userInfo, setUserInfo] = useState({
    name: "임윤아",
    gender: "여",
    school: "한림예술고등학교",
    grade: "3학년",
    class: "7반",
    birth: "2007.12.25",
    phone: "010-1234-1234",
    allergy: "견과류",
    email: "yoonai@naver.com",
    password: "***********",
  });

  // 프로필 이미지 상태 추가 (초기값은 기본 이미지 URL)
  const [profileImage, setProfileImage] = useState(null); // null이면 기본 배경 사용

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectClick = (field) => {
    console.log(`${field} 선택 모달/드롭다운 오픈`);
  };

  // 이미지 업로드 핸들러
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // FileReader를 사용하여 이미지를 URL로 변환하여 상태에 저장
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
        console.log("프로필 이미지 업로드 완료");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteImage = () => {
    setProfileImage(null);
    console.log("프로필 이미지 삭제");
  };

  return (
    <EditInfoWrap>
      <SectionTitle>프로필</SectionTitle>
      <ProfileSection>
        {/* profileImage 상태에 따라 배경이 변경됨 */}
        <ProfilePhoto $imageUrl={profileImage} />
        <ProfileActions>
          {/* 파일 찾기 버튼을 label로 수정하고 input과 연결 */}
          <label htmlFor="profile-upload">
            <ActionBtn as="span">파일 찾기</ActionBtn>
          </label>
          <HiddenFileInput
            id="profile-upload"
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
          />
          {/* 프로필 삭제 버튼 클릭 시 이미지 상태 초기화 */}
          <ActionBtn onClick={handleDeleteImage}>프로필 삭제</ActionBtn>
        </ProfileActions>
      </ProfileSection>

      <RequiredInfoSection>
        <TitleAndButton>
          <SectionTitle>필수 정보 수정</SectionTitle>
          <SubmitButton>수정하기</SubmitButton>
        </TitleAndButton>

        <InfoGrid>
          <InfoItem>
            <Label>이름:</Label>
            <InfoInput
              name="name"
              value={userInfo.name}
              onChange={handleChange}
            />
          </InfoItem>
          <InfoItem>
            <Label>성별:</Label>
            <Value onClick={() => handleSelectClick("gender")}>
              {userInfo.gender}
            </Value>
          </InfoItem>
          <InfoItem>
            <Label>학교:</Label>
            <InfoInput
              name="school"
              value={userInfo.school}
              onChange={handleChange}
              onClick={() => handleSelectClick("school")}
            />
          </InfoItem>
          <InfoItem>
            <Label>학년:</Label>
            <InfoInput
              name="grade"
              value={userInfo.grade}
              onChange={handleChange}
              onClick={() => handleSelectClick("grade")}
            />
          </InfoItem>
          <InfoItem>
            <Label>반:</Label>
            <InfoInput
              name="class"
              value={userInfo.class}
              onChange={handleChange}
              onClick={() => handleSelectClick("class")}
            />
          </InfoItem>
          <InfoItem>
            <Label>생년월일:</Label>
            <InfoInput
              name="birth"
              value={userInfo.birth}
              onChange={handleChange}
              placeholder="YYYY.MM.DD"
            />
          </InfoItem>
          <InfoItem>
            <Label>전화번호:</Label>
            <InfoInput
              name="phone"
              value={userInfo.phone}
              onChange={handleChange}
              type="tel"
            />
          </InfoItem>
          <InfoItem>
            <Label>알레르기:</Label>
            <InfoInput
              name="allergy"
              value={userInfo.allergy}
              onChange={handleChange}
            />
          </InfoItem>
          <InfoItem className="full-row">
            <Label>이메일:</Label>
            <InfoInput
              name="email"
              value={userInfo.email}
              onChange={handleChange}
              type="email"
            />
          </InfoItem>
          <InfoItem className="full-row">
            <Label>비밀번호:</Label>
            <InfoInput
              name="password"
              value={userInfo.password}
              type="password"
              disabled
              readOnly
            />
          </InfoItem>
        </InfoGrid>
      </RequiredInfoSection>
    </EditInfoWrap>
  );
};

// --- Styled Components (이하 변경 없음) ---

const ProfilePhoto = styled.div`
  width: 130px;
  height: 130px;
  border-radius: 50%;
  background-color: #f5f5f5;
  border: 1px solid #eee;
  margin-right: 20px;
  /* $imageUrl이 있으면 해당 이미지 사용, 없으면 기본 아이콘 */
  background-image: ${(props) =>
    props.$imageUrl
      ? `url(${props.$imageUrl})`
      : "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='#ccc' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M5.52 19L2 22.5V2H22v17H5.52zM12 9v6M9 12h6'/></svg>\")"};
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  display: flex;
  justify-content: center;
  align-items: center;
  ${(props) =>
    !props.$imageUrl && "background-size: 50%;"}/* 기본 아이콘일 때 크기 조정 */
`;

// 파일 업로드 input을 숨김
const HiddenFileInput = styled.input`
  display: none;
`;

// ActionBtn이 label의 span일 때도 버튼처럼 보이도록 as="span" 처리
const ActionBtn = styled.button.attrs((props) => ({
  as: props.as || "button",
}))`
  padding: 10px 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
  background-color: #fff;
  font-size: 1rem;
  cursor: pointer;
  display: inline-flex; /* span일 때 크기 유지를 위해 */
  align-items: center;
  justify-content: center;
  height: 40px; /* 버튼과 유사한 높이 유지 */

  &:last-child {
    background-color: #f8f8f8;
  }
`;

// Input 스타일 (이전 수정 내용 유지)
const InfoInput = styled.input`
  font-size: 1.25rem;
  font-weight: 700;
  color: #333;
  width: 100%;
  padding: 0;
  margin: 0;

  border: none;
  background-color: transparent;
  outline: none;

  transition: box-shadow 0.2s ease-in-out;

  &:focus {
    box-shadow: 0 0 0 2px #ffe500;
    border-radius: 4px;
    padding: 0 4px;
    margin: 0 -4px;
  }

  &:disabled {
    cursor: default;
    box-shadow: none;
    padding: 0;
    margin: 0;
  }
`;

const ActivityLogContent = () => (
  <ActivityLogWrap>
    <SummarySection>
      <SummaryItem>
        <Label>출석 일수:</Label>
        <Value>10일</Value>
      </SummaryItem>
      <SummaryItem>
        <Label>급식 사진 업로드 수:</Label>
        <Value>10</Value>
      </SummaryItem>
      <SummaryItem>
        <Label>사용 가능한 포인트:</Label>
        <Value>13,000P</Value>
      </SummaryItem>
      <SummaryItem>
        <Label>사용한 포인트:</Label>
        <Value>2,000P</Value>
      </SummaryItem>
    </SummarySection>

    <SectionTitle>교환한 상품</SectionTitle>
    <ExchangeMessage>유효기간이 다가온 상품 알림 및 재고 특색</ExchangeMessage>

    <ExchangeList>
      {mockExchangeList.map((item) => (
        <ExchangeItem key={item.id}>
          <PlaceholderImage />
          <ItemDetails>상품명: {item.name}</ItemDetails>
          <ItemDetails>포인트: {item.point}</ItemDetails>
          <ItemDetails>유효기간: {item.expiry}</ItemDetails>
          <ItemDetails>교환일자: {item.exchangedDate}</ItemDetails>
          <ItemDetails>사용일자: {item.usedDate}</ItemDetails>
          <ItemStatus $status={item.status}>
            {item.status === "used"
              ? "사용 완료"
              : item.status === "unused_imminent"
                ? "미사용 (임박)"
                : "미사용"}
          </ItemStatus>
        </ExchangeItem>
      ))}
    </ExchangeList>

    <Pagination>{/* 페이지네이션 */}</Pagination>
  </ActivityLogWrap>
);

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

const Placeholder = styled.div`
  padding: 50px;
  text-align: center;
  color: #999;
`;

const SectionTitle = styled.h3`
  font-size: 1.875rem;
  font-weight: 700;
  margin-bottom: 25px;
  text-align: left;
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

const EditInfoWrap = styled.div`
  display: flex;
  flex-direction: column;
`;

const ProfileSection = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 50px;
  padding-left: 10px;
`;

const ProfileActions = styled.div`
  display: flex;
  gap: 10px;
`;

const RequiredInfoSection = styled.div`
  border-top: 1px solid #d9d9d9;
  padding-top: 50px;
`;

const TitleAndButton = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
`;

const SubmitButton = styled.button`
  padding: 12px 30px;
  background-color: var(--primary-color, #ffe500);
  color: #333;
  font-size: 1.25rem;
  font-weight: bold;
  border: none;
  border-radius: 8px;
  cursor: pointer;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px 50px;
`;

const InfoItem = styled.div`
  display: flex;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px dashed #e0e0e0;
  cursor: text;

  &.full-row {
    grid-column: span 2;
  }
`;

const Label = styled.span`
  min-width: 120px;
  font-size: 1.25rem;
  font-weight: 500;
  color: #666;
`;

const Value = styled.span`
  font-size: 1.25rem;
  font-weight: 700;
  color: #333;
  cursor: pointer;
  text-decoration: underline;
`;

const ActivityLogWrap = styled.div`
  padding-top: 20px;
`;

const SummarySection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 0;
  margin-bottom: 40px;
  border-bottom: 1px solid #d9d9d9;
`;

const SummaryItem = styled.div`
  ${Label} {
    color: #333;
    font-size: 1.125rem;
    min-width: auto;
    margin-right: 10px;
  }
  ${Value} {
    font-size: 1.625rem;
    color: var(--primary-color, #ff6b6b);
  }
`;

const ExchangeMessage = styled.p`
  font-size: 1rem;
  color: #999;
  margin-bottom: 30px;
  text-align: right;
`;

const ExchangeList = styled.ul`
  list-style: none;
  padding: 0;
`;

const ExchangeItem = styled.li`
  display: flex;
  align-items: center;
  padding: 15px 0;
  border-bottom: 1px solid #eee;
`;

const PlaceholderImage = styled.div`
  width: 80px;
  height: 80px;
  background-color: #f0f0f0;
  border-radius: 8px;
  margin-right: 20px;
  background-size: cover;
  background-position: center;
`;

const ItemDetails = styled.span`
  flex-grow: 1;
`;

const ItemStatus = styled.span`
  font-size: 1rem;
  font-weight: 500;
  min-width: 90px;
  text-align: right;

  color: ${(props) => {
    switch (props.$status) {
      case "used":
        return "#999";
      case "unused_imminent":
        return "#ff6b6b";
      case "unused":
        return "#007bff";
      default:
        return "#333";
    }
  }};
`;

const Pagination = styled.div`
  text-align: center;
  padding: 30px 0 10px;
`;

export default MyPage;
