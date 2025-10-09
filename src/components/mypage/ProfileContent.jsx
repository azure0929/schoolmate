import React, { useState, useEffect, useCallback, useRef } from "react";
import styled from "styled-components";
import api from "@/api";
import dayjs from "dayjs";
import AllergySelector from "@/components/mypage/AllergySelector";
import SchoolSelector from "@/components/common/SchoolSelector";
import PasswordChangeModal from "@/components/modals/PasswordChangeModal";

const ProfileContent = ({ onLogoutClick, onWithdrawalClick, forceLogout }) => {
  const [profile, setProfile] = useState(null);
  const [editableProfile, setEditableProfile] = useState(null);
  const [isPasswordModalOpen, setPasswordModalOpen] = useState(false);
  const [isSchoolModalOpen, setSchoolModalOpen] = useState(false);
  const [isAllergyModalOpen, setAllergyModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false); // 저장 중 상태
  const fileInputRef = useRef(null);

  const [nameStatus, setNameStatus] = useState({
    valid: null,
    message: "",
  });
  const [nicknameStatus, setNicknameStatus] = useState({
    valid: null, // true / false / null
    message: "",
  });

  // 프로필 데이터 불러오기
  const fetchProfile = useCallback(async () => {
    try {
      const res = await api.get("/profile/me");
      setProfile(res.data);
      setEditableProfile(res.data);
      // 닉네임 상태 초기화 (현재 닉네임과 동일하므로 유효함)
      setNicknameStatus({ valid: true, message: "" });
    } catch (error) {
      console.error("프로필 정보 조회 실패:", error);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // 입력 핸들러
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditableProfile((prev) => ({ ...prev, [name]: value }));

    // 이름 유효성 검사
    if (name === "name") {
      // 이름 유효성 검사
      if (!value.trim()) {
        setNameStatus({ valid: false, message: "이름을 입력해주세요." });
        return;
      }
      if (value.length < 2 || value.length >= 20) {
        setNameStatus({
          valid: false,
          message: "이름은 2글자 이상, 20글자 미만으로 입력해주세요.",
        });
        return;
      }
      if (/[^가-힣a-zA-Z]/.test(value)) {
        setNameStatus({
          valid: false,
          message: "이름에는 특수문자나 숫자를 사용할 수 없습니다.",
        });
        return;
      }
      setNameStatus({ valid: true, message: "올바른 이름 형식입니다." });
    }
  };

  // 닉네임 유효성 및 변경 핸들러
  const handleNicknameChange = (e) => {
    const nickname = e.target.value;
    setEditableProfile((prev) => ({ ...prev, nickname }));

    // 닉네임 유효성 검사 로직
    if (!nickname.trim()) {
      setNicknameStatus({ valid: false, message: "닉네임을 입력해주세요." });
      return;
    }
    if (nickname.length < 2 || nickname.length > 10) {
      setNicknameStatus({
        valid: false,
        message: "닉네임은 2~10자 이내로 입력해주세요.",
      });
      return;
    }
    if (/[^가-힣a-zA-Z0-9]/.test(nickname)) {
      setNicknameStatus({
        valid: false,
        message: "닉네임에는 특수문자를 사용할 수 없습니다.",
      });
      return;
    }

    // 닉네임이 이전 값과 다르면 중복확인 필요 상태로 변경
    if (nickname !== profile.nickname) {
      setNicknameStatus({ valid: null, message: "중복확인을 해주세요." });
    } else {
      // 원래 닉네임으로 되돌아오면 유효 상태로 변경
      setNicknameStatus({ valid: true, message: "" });
    }
  };

  // 닉네임 중복확인 API
  const handleCheckNickname = async () => {
    const nickname = editableProfile.nickname?.trim();
    if (!nickname) {
      alert("닉네임을 입력해주세요.");
      return;
    }

    // 현재 닉네임과 같으면 중복확인 생략
    if (nickname === profile.nickname) {
      setNicknameStatus({ valid: true, message: "" });
      alert("현재 닉네임과 동일합니다.");
      return;
    }

    try {
      const res = await api.get("/auth/check-nickname", {
        params: { nickname },
      });
      if (res.status === 200) {
        setNicknameStatus({
          valid: true,
          message: "사용 가능한 닉네임입니다.",
        });
      }
    } catch (error) {
      if (error.response?.status === 409) {
        setNicknameStatus({
          valid: false,
          message: "이미 사용 중인 닉네임입니다.",
        });
      } else {
        setNicknameStatus({
          valid: false,
          message: "닉네임 중복확인 중 오류가 발생했습니다.",
        });
      }
    }
  };

  // 프로필 이미지 파일 업로드 핸들러
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("이미지 파일만 선택 가능합니다.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file); // 백엔드에서 'file' 이름으로 받도록 가정

    setIsSaving(true);
    try {
      // 1. 백엔드의 이미지 업로드 API 호출 (Firebase Storage 저장 및 URL 반환)
      const res = await api.post("/profile/upload-image", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const newImageUrl = res.data.profileImgUrl || res.data.url; // 응답 구조에 따라 키 조정

      if (newImageUrl) {
        // 2. editableProfile에 새 URL 저장
        setEditableProfile((prev) => ({
          ...prev,
          profileImgUrl: newImageUrl,
        }));
        alert(
          "이미지가 성공적으로 업로드되었습니다. '저장하기'를 눌러 반영하세요.",
        );
      } else {
        throw new Error("서버에서 이미지 URL을 받지 못했습니다.");
      }
    } catch (error) {
      console.error("이미지 업로드 실패:", error);
      alert(error.response?.data?.message || "이미지 업로드에 실패했습니다.");
    } finally {
      setIsSaving(false);
      // 파일 입력 필드 초기화 (같은 파일을 다시 선택할 수 있도록)
      e.target.value = null;
    }
  };

  // 프로필 이미지 삭제 핸들러
  const handleImageDelete = async () => {
    if (!window.confirm("현재 프로필 이미지를 삭제하시겠습니까?")) return;

    setIsSaving(true);
    try {
      // 1. 프로필 이미지 URL을 빈 문자열 또는 기본값으로 설정
      const defaultImgUrl = "/default-profile.png";

      // 3. 백엔드에 이미지 URL 삭제 요청 (DB 필드를 null로 설정)
      // DELETE /api/profile/delete-image 호출
      await api.delete("/profile/delete-image");

      // 4. 요청 성공 시 editableProfile과 profile 상태를 즉시 업데이트
      // DB가 null로 설정되었으므로, 클라이언트 상태도 null로 변경
      setEditableProfile((prev) => ({
        ...prev,
        profileImgUrl: null, // 서버에서 null 처리 완료
      }));

      // profile 상태도 업데이트 (재조회하지 않고)
      setProfile((prev) => ({
        ...prev,
        profileImgUrl: null,
      }));

      alert("프로필 이미지가 성공적으로 삭제되었습니다.");
    } catch (error) {
      console.error("이미지 삭제 준비 실패:", error);
      alert("이미지 삭제 준비 중 오류가 발생했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  // 학교 정보 변경
  const handleSchoolChange = (newSchoolData) => {
    setEditableProfile((prev) => ({ ...prev, ...newSchoolData }));
  };

  // 알레르기 변경
  const handleAllergyChange = (allergyId) => {
    const allergies = editableProfile.allergyId.includes(allergyId)
      ? editableProfile.allergyId.filter((id) => id !== allergyId)
      : [...editableProfile.allergyId, allergyId];
    setEditableProfile((prev) => ({ ...prev, allergyId: allergies }));
  };

  // 최종 저장하기
  const handleSave = async () => {
    // 닉네임 중복확인 검사
    if (
      editableProfile.nickname !== profile.nickname &&
      nicknameStatus.valid !== true
    ) {
      alert("닉네임 중복확인을 완료해주세요.");
      return;
    }

    // 이름 유효성 검사 (저장 시 최종 확인)
    if (nameStatus.valid === false) {
      alert("이름 형식이 올바르지 않습니다.");
      return;
    }

    // 변경된 내용 확인 (profileImgUrl 비교도 포함됨)
    if (JSON.stringify(profile) === JSON.stringify(editableProfile)) {
      alert("변경된 내용이 없습니다.");
      return;
    }

    setIsSaving(true);
    try {
      // 1. 프로필 정보 수정 API 호출 (변경된 profileImgUrl 포함)
      await api.put("/profile/me", editableProfile);

      alert("정보가 성공적으로 수정되었습니다.");

      // 2. 성공 후 프로필 정보 재조회 및 UI 업데이트
      await fetchProfile();
    } catch (error) {
      alert(error.response?.data?.message || "정보 수정에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!profile || !editableProfile) return <Container>로딩 중...</Container>;

  return (
    <Container>
      <Title>나의 정보</Title>

      {/* 프로필 이미지 */}
      <ProfileImageSection>
        <ImageCircle
          src={editableProfile.profileImgUrl || "/default-profile.png"}
          alt="프로필 이미지"
        />
        <ImageButtonWrapper>
          <ImageButton
            onClick={() => fileInputRef.current.click()}
            disabled={isSaving}
          >
            파일 찾기
          </ImageButton>
          {/* 파일 입력 필드에 onChange 이벤트 연결 */}
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: "none" }}
            accept="image/*"
            onChange={handleImageUpload}
            disabled={isSaving}
          />
          <ImageButton
            variant="delete"
            onClick={handleImageDelete}
            disabled={isSaving}
          >
            프로필 삭제
          </ImageButton>
        </ImageButtonWrapper>
      </ProfileImageSection>

      {/* 정보 수정 폼 (기존 로직 유지) */}
      <FormSection>
        <SectionRow>
          <Label>이메일</Label>
          <InfoText>{profile.email}</InfoText>
        </SectionRow>

        <SectionRow>
          <Label>비밀번호</Label>
          <ActionButton onClick={() => setPasswordModalOpen(true)}>
            비밀번호 수정
          </ActionButton>
        </SectionRow>

        <SectionRow>
          <Label>이름</Label>
          <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
            <Input
              name="name"
              value={editableProfile.name}
              onChange={handleInputChange}
              placeholder="이름 (2~19자, 한글/영문만 가능)"
            />
            {nameStatus.message && (
              <ValidationMessage $isValid={nameStatus.valid}>
                {nameStatus.message}
              </ValidationMessage>
            )}
          </div>
        </SectionRow>

        <SectionRow>
          <Label>성별</Label>
          <RadioWrapper>
            <label>
              <input
                type="radio"
                name="gender"
                value="MALE"
                checked={editableProfile.gender === "MALE"}
                onChange={handleInputChange}
              />
              남성
            </label>
            <label>
              <input
                type="radio"
                name="gender"
                value="FEMALE"
                checked={editableProfile.gender === "FEMALE"}
                onChange={handleInputChange}
              />
              여성
            </label>
          </RadioWrapper>
        </SectionRow>

        <SectionRow>
          <Label>생년월일</Label>
          <Input
            type="date"
            name="birthDay"
            value={dayjs(editableProfile.birthDay).format("YYYY-MM-DD")}
            onChange={handleInputChange}
          />
        </SectionRow>

        <SectionRow>
          <Label>학교 정보</Label>
          <InfoText>
            {editableProfile.schoolName} {editableProfile.grade}학년{" "}
            {editableProfile.classNo}반
          </InfoText>
          <ActionButton onClick={() => setSchoolModalOpen(true)}>
            학교 변경
          </ActionButton>
        </SectionRow>

        <SectionRow>
          <Label>닉네임</Label>
          <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
            <div style={{ display: "flex", gap: "8px" }}>
              <Input
                name="nickname"
                value={editableProfile.nickname || ""}
                onChange={handleNicknameChange}
                placeholder="닉네임 (2~10자, 특수문자 불가)"
              />
              <ActionButton onClick={handleCheckNickname}>
                중복확인
              </ActionButton>
            </div>
            {nicknameStatus.message && (
              <ValidationMessage $isValid={nicknameStatus.valid}>
                {nicknameStatus.message}
              </ValidationMessage>
            )}
          </div>
        </SectionRow>

        <SectionRow>
          <Label>보유 알레르기</Label>
          <InfoText>
            {editableProfile.allergyId?.length > 0
              ? `현재 ${editableProfile.allergyId.length}개 선택됨`
              : "보유 알레르기가 없습니다."}
          </InfoText>
          <ActionButton onClick={() => setAllergyModalOpen(true)}>
            {editableProfile.allergyId?.length > 0 ? "수정하기" : "등록하기"}
          </ActionButton>
        </SectionRow>
      </FormSection>

      <SaveButton onClick={handleSave} disabled={isSaving}>
        {isSaving ? "저장 중..." : "저장하기"}
      </SaveButton>

      <Separator />

      <EtcButtonWrapper>
        <EtcButton onClick={onLogoutClick}>로그아웃</EtcButton>
        <EtcButton onClick={onWithdrawalClick}>회원탈퇴</EtcButton>
      </EtcButtonWrapper>

      {/* 모달 섹션 (기존 로직 유지) */}
      {isPasswordModalOpen && (
        <PasswordChangeModal
          onClose={() => setPasswordModalOpen(false)}
          onSuccess={() => {
            alert("비밀번호가 변경되어 다시 로그인해야 합니다.");
            setPasswordModalOpen(false);
            if (forceLogout) forceLogout();
          }}
        />
      )}

      {isSchoolModalOpen && (
        <Modal onClose={() => setSchoolModalOpen(false)} title="학교 정보 변경">
          <SchoolSelector
            schoolData={editableProfile}
            onSchoolChange={handleSchoolChange}
          />
          <ModalButton onClick={() => setSchoolModalOpen(false)}>
            확인
          </ModalButton>
        </Modal>
      )}

      {isAllergyModalOpen && (
        <Modal
          onClose={() => setAllergyModalOpen(false)}
          title="알레르기 정보 변경"
        >
          <AllergySelector
            selectedAllergies={editableProfile.allergyId || []}
            onAllergyChange={handleAllergyChange}
          />
          <ModalButton onClick={() => setAllergyModalOpen(false)}>
            선택 완료
          </ModalButton>
        </Modal>
      )}
    </Container>
  );
};

export default ProfileContent;

const ValidationMessage = styled.p`
  font-size: 0.9rem;
  margin-top: 6px;
  color: ${({ $isValid }) => ($isValid ? "green" : "red")};
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;
const ModalContainer = styled.div`
  background: white;
  padding: 24px;
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
`;
const ModalTitle = styled.h3`
  font-size: 1.5rem;
  margin: 0 0 24px 0;
  text-align: center;
`;
const ModalButton = styled.button`
  width: 100%;
  padding: 16px;
  margin-top: 24px;
  border: none;
  border-radius: 8px;
  background-color: var(--primary-color);
  color: white;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
`;
const Container = styled.div`
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  padding: 20px 0;
`;
const Title = styled.h1`
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 40px;
`;
const ProfileImageSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  margin-bottom: 40px;
`;
const ImageCircle = styled.img`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  border: 1px solid #ddd;
  object-fit: cover;
`;
const ImageButtonWrapper = styled.div`
  display: flex;
  gap: 8px;
`;
const ImageButton = styled.button`
  padding: 6px 12px;
  border-radius: 4px;
  border: 1px solid
    ${(props) => (props.variant === "delete" ? "#ff4d4d" : "#ccc")};
  background-color: ${(props) =>
    props.variant === "delete" ? "#fff5f5" : "#f5f5f5"};
  color: ${(props) => (props.variant === "delete" ? "#ff4d4d" : "#333")};
  cursor: pointer;
  font-size: 0.875rem;
  transition: background-color 0.1s;
  &:active {
    background-color: var(--primary-color);
    color: white;
    border-color: var(--primary-color);
  }
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;
const FormSection = styled.div`
  border-top: 2px solid #333;
`;
const SectionRow = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 12px;
  border-bottom: 1px solid #eee;
`;
const Label = styled.span`
  min-width: 120px;
  font-size: 1rem;
  font-weight: 500;
`;
const InfoText = styled.span`
  color: #555;
  flex: 1;
`;
const Input = styled.input`
  padding: 8px 12px;
  border: 1px solid #333;
  border-radius: 4px;
  font-size: 1rem;
  color: #333;
  flex: 1;
  &:focus {
    border-color: var(--primary-color);
    outline: none;
    box-shadow: 0 0 0 2px rgba(233, 30, 99, 0.2);
  }
`;
const RadioWrapper = styled.div`
  display: flex;
  gap: 16px;
  label {
    display: flex;
    align-items: center;
    gap: 4px;
    cursor: pointer;
  }
`;
const ActionButton = styled.button`
  padding: 6px 12px;
  border-radius: 4px;
  border: 1px solid #ccc;
  background-color: var(--primary-color);
  color: white;
  cursor: pointer;
  margin-left: auto;
  &:hover {
    background-color: var(--secondary-color);
    color: #333;
  }
`;
const SaveButton = styled.button`
  width: 100%;
  padding: 16px;
  margin-top: 32px;
  border: none;
  border-radius: 8px;
  background-color: var(--primary-color);
  color: white;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;
const Separator = styled.hr`
  border: none;
  border-top: 1px solid #eee;
  margin: 32px 0;
`;
const EtcButtonWrapper = styled.div`
  display: flex;
  justify-content: center;
  gap: 10px;
  flex-direction: column;
`;
const EtcButton = styled.button`
  font-size: 1rem;
  background: none;
  border: none;
  color: #333;
  cursor: pointer;
  &:hover {
    color: var(--primary-color);
    text-decoration: underline;
  }
`;
