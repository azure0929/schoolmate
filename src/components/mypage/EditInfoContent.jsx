import React, { useState, useEffect, useCallback } from "react";
import styled, { css } from "styled-components";

// 백엔드 기본 URL 설정
const BASE_URL = "http://localhost:9000/api";

const EditInfoContent = () => {
  const [userInfo, setUserInfo] = useState({
    name: "",
    gender: "",
    school: "",
    grade: "",
    class: "",
    birth: "",
    phone: "",
    allergy: "",
    email: "",
    password: "***********",
  });
  const [profileImage, setProfileImage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // 회원 정보 불러오기
  const fetchUserInfo = useCallback(async () => {
    setIsLoading(true);
    // LocalStorage에서 토큰 가져오기
    const authToken = localStorage.getItem("authToken");
    const headers = {
      Authorization: `Bearer ${authToken}`,
      "Content-Type": "application/json",
    };

    if (!authToken) {
      console.error("인증 토큰이 없습니다. 로그인이 필요합니다.");
      setIsLoading(false);
      return;
    }

    try {
      // 회원 정보 조회: GET /students/me
      const res = await fetch(`${BASE_URL}/students/me`, { headers });

      if (res.ok) {
        const data = await res.json();
        const formattedBirth = data.birthDate
          ? new Date(data.birthDate)
              .toISOString()
              .split("T")[0]
              .replace(/-/g, ".")
          : "";

        setUserInfo({
          name: data.name || "",
          gender: data.gender || "",
          school: data.schoolName || "",
          grade: data.grade ? `${data.grade}학년` : "",
          class: data.classNumber ? `${data.classNumber}반` : "",
          birth: formattedBirth,
          phone: data.phoneNumber || "",
          allergy: data.allergyInfo || "",
          email: data.email || "",
          password: "***********",
        });

        if (data.profileImageUrl) {
          setProfileImage(data.profileImageUrl);
        }
      } else {
        console.error("회원 정보 조회 실패:", res.status);
      }
    } catch (error) {
      console.error("회원 정보 패칭 중 오류 발생:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserInfo();
  }, [fetchUserInfo]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectClick = (field) => {
    console.log(`${field} 선택 모달/드롭다운 오픈`);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
        console.log("프로필 이미지 업로드 완료 (가상)");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteImage = () => {
    setProfileImage(null);
    console.log("프로필 이미지 삭제 (가상)");
  };

  // 회원 정보 수정 (PUT /students/me/info 가정)
  const handleSubmit = async () => {
    console.log("회원 정보 수정 요청 (가상):", userInfo);
    const updateData = {
      name: userInfo.name,
      gender: userInfo.gender.replace(/학년|반/, "").trim(),
      schoolName: userInfo.school,
      grade: parseInt(userInfo.grade.replace("학년", "").trim(), 10),
      classNumber: parseInt(userInfo.class.replace("반", "").trim(), 10),
      birthDate: userInfo.birth.replace(/\./g, "-"),
      phoneNumber: userInfo.phone,
      allergyInfo: userInfo.allergy,
    };

    // LocalStorage에서 토큰 가져오기
    const authToken = localStorage.getItem("authToken");
    const headers = {
      Authorization: `Bearer ${authToken}`,
      "Content-Type": "application/json",
    };

    if (!authToken) {
      alert("인증 토큰이 없어 수정할 수 없습니다.");
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/students/me/info`, {
        method: "PUT",
        headers: headers,
        body: JSON.stringify(updateData),
      });

      if (res.ok) {
        alert("회원 정보가 성공적으로 수정되었습니다. (가상)");
        fetchUserInfo();
      } else {
        alert("회원 정보 수정 실패: " + res.status);
      }
    } catch (error) {
      console.error("회원 정보 수정 중 오류 발생:", error);
      alert("회원 정보 수정 중 오류가 발생했습니다.");
    }
  };

  if (isLoading) {
    return <Placeholder>데이터를 불러오는 중입니다...</Placeholder>;
  }

  return (
    <EditInfoWrap>
      <SectionTitle>프로필</SectionTitle>
      <ProfileSection>
        <ProfilePhoto $imageUrl={profileImage} />
        <ProfileActions>
          <label htmlFor="profile-upload">
            <ActionBtn as="span">파일 찾기</ActionBtn>
          </label>
          <HiddenFileInput
            id="profile-upload"
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
          />
          <ActionBtn onClick={handleDeleteImage}>프로필 삭제</ActionBtn>
        </ProfileActions>
      </ProfileSection>

      <RequiredInfoSection>
        <TitleAndButton>
          <SectionTitle>필수 정보 수정</SectionTitle>
          <SubmitButton onClick={handleSubmit}>수정하기</SubmitButton>
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
              disabled
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

export default EditInfoContent;

// --- EditInfoContent 전용 Styled Components ---

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

const ProfilePhoto = styled.div`
  width: 130px;
  height: 130px;
  border-radius: 50%;
  background-color: #f5f5f5;
  border: 1px solid #eee;
  margin-right: 20px;
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
  ${(props) => !props.$imageUrl && "background-size: 50%;"}
`;

const HiddenFileInput = styled.input`
  display: none;
`;

const ActionBtn = styled.button.attrs((props) => ({
  as: props.as || "button",
}))`
  padding: 10px 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
  background-color: #fff;
  font-size: 1rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 40px;

  &:last-child {
    background-color: #f8f8f8;
  }
`;

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
