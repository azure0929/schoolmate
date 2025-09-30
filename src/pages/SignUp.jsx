import React, { useState, useEffect } from "react";
import styled, { css } from "styled-components";
import { FaRegUser } from "react-icons/fa";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import SchoolSearchModal from "../components/modals/SchoolSearchModal";

import {
  MdOutlineEmail,
  MdLockOutline,
  MdOutlinePermContactCalendar,
  MdOutlinePhone,
  MdOutlineSchool,
  MdSearch,
} from "react-icons/md";
import allergy1 from "@/assets/images/allergy1.png";
import allergy2 from "@/assets/images/allergy2.png";
import allergy3 from "@/assets/images/allergy3.png";
import allergy4 from "@/assets/images/allergy4.png";
import allergy5 from "@/assets/images/allergy5.png";
import allergy6 from "@/assets/images/allergy6.png";
import allergy7 from "@/assets/images/allergy7.png";
import allergy8 from "@/assets/images/allergy8.png";
import allergy9 from "@/assets/images/allergy9.png";
import allergy10 from "@/assets/images/allergy10.png";
import allergy11 from "@/assets/images/allergy11.png";
import allergy12 from "@/assets/images/allergy12.png";
import allergy13 from "@/assets/images/allergy13.png";
import allergy14 from "@/assets/images/allergy14.png";
import allergy15 from "@/assets/images/allergy15.png";
import allergy16 from "@/assets/images/allergy16.png";
import allergy17 from "@/assets/images/allergy17.png";
import allergy18 from "@/assets/images/allergy18.png";
import allergy19 from "@/assets/images/allergy19.png";
import allergy20 from "@/assets/images/allergy20.png";

// 환경 변수 안정화 및 기본값 설정
const BASE_API_URL =
  import.meta.env.REACT_APP_API_URL || "http://localhost:9000/api";

// Axios 인스턴스 생성 및 기본 URL 설정
const api = axios.create({
  baseURL: BASE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

const SignUpForm = () => {
  const navigate = useNavigate();
  // 폼 단계 관리
  const [step, setStep] = useState(1);
  // 폼 전체 데이터 관리
  const [formData, setFormData] = useState({
    // studnet
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    // profile
    nickname: "",
    gender: "",
    phone: "",
    birthDay: "", // 필드명 통일 (기존 birthdate -> birthDay)
    scCode: "",
    schoolCode: "",
    schoolName: "",
    majorName: "",
    grade: "",
    classNo: "",
    level: "", // schoolLevel 대신 level 사용
    // phone number
    hasPhoneNumber: true, // 전화번호 유무 상태 추가
    // allergy
    allergyId: [],
  });

  // 중복 및 유효성 검사 상태 관리
  const [validation, setValidation] = useState({
    email: { status: "unchecked", message: "" },
    nickname: { status: "unchecked", message: "" },
    passwordMatch: { status: "unchecked", message: "" },
  });

  // 학교 검색 모달 표시 여부 관리
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 버튼 활성화 상태 관리
  const [isNextDisabled, setIsNextDisabled] = useState(true);

  const allergyData = [
    { id: 1, name: "알류", icon: allergy1 },
    { id: 2, name: "우유", icon: allergy2 },
    { id: 3, name: "땅콩", icon: allergy3 },
    { id: 4, name: "콩", icon: allergy4 },
    { id: 5, name: "고등어", icon: allergy5 },
    { id: 6, name: "조개류", icon: allergy6 },
    { id: 7, name: "닭고기", icon: allergy7 },
    { id: 8, name: "돼지고기", icon: allergy8 },
    { id: 9, name: "쇠고기", icon: allergy9 },
    { id: 10, name: "복숭아", icon: allergy10 },
    { id: 11, name: "새우", icon: allergy11 },
    { id: 12, name: "토마토", icon: allergy12 },
    { id: 13, name: "호두", icon: allergy13 },
    { id: 14, name: "오징어", icon: allergy14 },
    { id: 15, name: "게", icon: allergy15 },
    { id: 16, name: "아몬드", icon: allergy16 },
    { id: 17, name: "키위", icon: allergy17 },
    { id: 18, name: "사과", icon: allergy18 },
    { id: 19, name: "간장", icon: allergy19 },
    { id: 20, name: "참깨", icon: allergy20 },
  ];

  // useEffect: '다음' 버튼 활성화 여부를 실시간으로 검사
  useEffect(() => {
    const {
      email,
      password,
      confirmPassword,
      name,
      nickname,
      birthDay,
      gender,
      level, // schoolLevel 대신 level 사용
      schoolName,
      grade,
      classNo,
      hasPhoneNumber,
      phone,
    } = formData;

    // 1. 필수 필드 체크 (phone은 hasPhoneNumber에 따라 조건부)
    let requiredFieldsFilled =
      email &&
      password &&
      confirmPassword &&
      name &&
      nickname &&
      birthDay &&
      gender &&
      level &&
      schoolName &&
      grade &&
      classNo;

    if (hasPhoneNumber) {
      requiredFieldsFilled = requiredFieldsFilled && phone;
    }

    // 2. 유효성/중복 검사 통과 여부
    const checksPassed =
      validation.email.status === "valid" &&
      validation.nickname.status === "valid";

    // 3. 비밀번호 일치 여부
    const passwordMatch = password && password === confirmPassword;

    // 비밀번호 일치 메시지 업데이트
    if (password && confirmPassword) {
      setValidation((prev) => ({
        ...prev,
        passwordMatch: {
          status: passwordMatch ? "valid" : "invalid",
          message: passwordMatch ? "" : "비밀번호가 일치하지 않습니다.",
        },
      }));
    } else if (validation.passwordMatch.status !== "unchecked") {
      setValidation((prev) => ({
        ...prev,
        passwordMatch: { status: "unchecked", message: "" },
      }));
    }

    setIsNextDisabled(!(requiredFieldsFilled && checksPassed && passwordMatch));
  }, [formData, validation.email.status, validation.nickname.status]); // 의존성 배열 최적화

  // 이벤트 핸들러 함수들
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // 중복검사 상태 초기화
    if (name === "email" || name === "nickname") {
      setValidation((prev) => ({
        ...prev,
        [name]: { status: "unchecked", message: "" },
      }));
    }
  };

  const handleGenderChange = (gender) => {
    setFormData({ ...formData, gender });
  };

  const handleSchoolLevelChange = (e) => {
    // level 변경 시 학교 정보 초기화
    setFormData({
      ...formData,
      level: e.target.value,
      schoolName: "",
      scCode: "",
      schoolCode: "",
    });
  };

  const handleAllergySelect = (id) => {
    setFormData((prev) => {
      const newAllergies = prev.allergyId.includes(id)
        ? prev.allergyId.filter((allergy) => allergy !== id)
        : [...prev.allergyId, id];
      return { ...prev, allergyId: newAllergies };
    });
  };

  const handleDuplicateCheck = async (type) => {
    const value = formData[type];
    if (!value.trim()) {
      alert(`${type === "email" ? "이메일을" : "닉네임을"} 입력해주세요.`);
      return;
    }

    try {
      setValidation((prev) => ({
        ...prev,
        [type]: { status: "checking", message: "확인 중..." },
      }));

      // api 인스턴스 사용
      const response = await api.get(`/auth/check-${type}`, {
        params: { [type]: value },
      });

      if (response.data) {
        setValidation((prev) => ({
          ...prev,
          [type]: {
            status: "invalid",
            message: `이미 사용 중인 ${type}입니다.`,
          },
        }));
      } else {
        setValidation((prev) => ({
          ...prev,
          [type]: { status: "valid", message: "사용 가능합니다!" },
        }));
      }
    } catch (error) {
      console.error(`${type} 중복 확인 실패:`, error);
      setValidation((prev) => ({
        ...prev,
        [type]: { status: "error", message: "확인 중 오류가 발생했습니다." },
      }));
    }
  };

  const handlePhoneNumberToggle = (hasPhoneNumber) => {
    // phone 필드명 통일 (phoneNumber -> phone)
    setFormData({ ...formData, hasPhoneNumber, phone: "" });
  };

  const handleSchoolSelect = (school) => {
    setFormData((prev) => ({
      ...prev,
      schoolName: school.SCHUL_NM,
      scCode: school.ATPT_OFCDC_SC_CODE,
      schoolCode: school.SD_SCHUL_CODE,
      majorName: "", // 학교 변경 시 전공/학과 초기화
    }));
    setIsModalOpen(false); // 선택 후 모달 닫기
  };

  const handleNextClick = (e) => {
    e.preventDefault();
    setStep(2);
  };

  // '가입하기' 버튼 클릭 시 실행될 함수
  const handleSubmit = async (e) => {
    e.preventDefault();

    const signupData = {
      student: {
        email: formData.email,
        password: formData.password,
        name: formData.name,
      },
      profile: {
        nickname: formData.nickname,
        gender: formData.gender === "남자" ? "MALE" : "FEMALE",
        phone: formData.phone || null, // 전화번호 없으면 null 전달
        birthDay: formData.birthDay,
        scCode: formData.scCode,
        schoolCode: formData.schoolCode,
        schoolName: formData.schoolName,
        majorName: formData.majorName,
        grade: parseInt(formData.grade),
        classNo: parseInt(formData.classNo),
        level: formData.level,
      },
      allergyId: formData.allergyId,
    };

    // 유효성 재검사
    if (isNextDisabled) {
      alert("필수 항목을 모두 입력하거나 중복 확인을 완료해 주세요.");
      return;
    }

    try {
      // api 인스턴스 사용
      const response = await api.post("/auth/signup", signupData);

      alert("회원가입에 성공했습니다!");

      // 백엔드 응답에서 토큰을 'Authorization' 헤더 대신 본문에서 받을 경우
      const token = response.data.token;
      if (token) {
        localStorage.setItem("authToken", token);
        // 향후 인증이 필요한 요청에 토큰 자동 포함
        // api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      }

      navigate("/mainpage");
    } catch (error) {
      console.error("회원가입 실패:", error.response?.data || error.message);

      // 서버 에러 메시지 추출 개선
      let serverMessage = "서버 오류가 발생했습니다.";
      if (error.response && error.response.data) {
        // 백엔드에서 JSON { message: "..." } 형태로 에러를 보냈을 경우
        serverMessage = error.response.data.message || error.response.data;
      } else if (error.request) {
        serverMessage =
          "서버에 연결할 수 없습니다. 네트워크 상태를 확인하세요.";
      }

      alert(`회원가입 중 오류가 발생했습니다: ${serverMessage}`);
    }
  };

  return (
    <SignUpContainer>
      <SchoolSearchModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelect={handleSchoolSelect}
        schoolLevel={formData.level}
      />
      <FormBox>
        <Title>회원가입</Title>
        <Subtitle>자세한 학교 정보를 알고 싶다면 입력해주세요!</Subtitle>

        {/* STEP 1: 필수 항목 */}
        {step === 1 && <RequiredSection>필수 항목</RequiredSection>}
        <RequiredForm onSubmit={handleNextClick} $visible={step === 1}>
          <div className="input-wrap">
            {/* 이메일 */}
            <InputWrapper>
              <Icon>
                <MdOutlineEmail />
              </Icon>
              <Input
                type="email"
                name="email"
                placeholder="이메일"
                value={formData.email}
                onChange={handleChange}
              />
              <CheckButton
                type="button"
                onClick={() => handleDuplicateCheck("email")}
              >
                중복확인
              </CheckButton>
            </InputWrapper>
            <ValidationMessage status={validation.email.status}>
              {validation.email.message}
            </ValidationMessage>

            {/* 비밀번호 */}
            <InputWrapper>
              <Icon>
                <MdLockOutline />
              </Icon>
              <Input
                type="password"
                name="password"
                placeholder="비밀번호"
                value={formData.password}
                onChange={handleChange}
              />
            </InputWrapper>

            {/* 비밀번호 확인 */}
            <InputWrapper>
              <Icon>
                <MdLockOutline />
              </Icon>
              <Input
                type="password"
                name="confirmPassword"
                placeholder="비밀번호 확인"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </InputWrapper>
            <ValidationMessage status={validation.passwordMatch.status}>
              {validation.passwordMatch.message}
            </ValidationMessage>
          </div>
          <div className="input-wrap">
            <div className="name">
              {/* 이름 */}
              <InputWrapper className="name-wrap">
                <Icon>
                  <FaRegUser />
                </Icon>
                <Input
                  type="text"
                  name="name"
                  placeholder="이름"
                  value={formData.name}
                  onChange={handleChange}
                />
              </InputWrapper>
              {/* 닉네임 */}
              <InputWrapper className="name-wrap">
                <Icon>
                  <FaRegUser />
                </Icon>
                <Input
                  type="text"
                  name="nickname"
                  placeholder="닉네임"
                  value={formData.nickname}
                  onChange={handleChange}
                />
                <CheckButton
                  type="button"
                  onClick={() => handleDuplicateCheck("nickname")}
                >
                  중복확인
                </CheckButton>
              </InputWrapper>
            </div>
            <ValidationMessage
              status={validation.nickname.status}
              style={{ textAlign: "right", paddingRight: "10px" }}
            >
              {validation.nickname.message}
            </ValidationMessage>

            {/* 생년월일 */}
            <InputWrapper>
              <Icon>
                <MdOutlinePermContactCalendar />
              </Icon>
              <Input
                type="date"
                name="birthDay" // ⭐️ birthDay로 수정
                placeholder="생년월일"
                value={formData.birthDay}
                onChange={handleChange}
              />
            </InputWrapper>

            {/* 성별 */}
            <GenderButtonWrapper>
              <GenderButton
                type="button"
                selected={formData.gender === "남자"}
                onClick={() => handleGenderChange("남자")}
              >
                남자
              </GenderButton>
              <GenderButton
                type="button"
                selected={formData.gender === "여자"}
                onClick={() => handleGenderChange("여자")}
              >
                여자
              </GenderButton>
            </GenderButtonWrapper>

            {/* 휴대전화번호 */}
            <PhoneInputWrapper>
              <PhoneInputBox>
                <Icon>
                  <MdOutlinePhone />
                </Icon>
                <Input
                  type="tel"
                  name="phone" // ⭐️ phone으로 수정
                  placeholder="휴대전화번호"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={!formData.hasPhoneNumber}
                />
              </PhoneInputBox>
              <NoPhoneRadio
                onClick={() =>
                  handlePhoneNumberToggle(!formData.hasPhoneNumber)
                }
              >
                <input
                  type="radio"
                  checked={!formData.hasPhoneNumber}
                  onChange={() => {}}
                />
                <label>없음</label>
              </NoPhoneRadio>
            </PhoneInputWrapper>
          </div>

          {/* 학교급 */}
          <SchoolLevelWrapper>
            <SchoolLevelRadioGroup>
              {["초등학교", "중학교", "고등학교"].map((level) => (
                <RadioLabel key={level}>
                  <RadioInput
                    type="radio"
                    name="level"
                    value={level}
                    checked={formData.level === level}
                    onChange={handleSchoolLevelChange}
                  />
                  {level}
                </RadioLabel>
              ))}
            </SchoolLevelRadioGroup>
          </SchoolLevelWrapper>

          {/* 학교 검색 */}
          <InputWrapper>
            <Icon>
              <MdOutlineSchool />
            </Icon>
            <Input
              type="text"
              name="schoolName"
              placeholder="학교를 검색해주세요"
              value={formData.schoolName}
              readOnly
            />
            <CheckButton
              type="button"
              onClick={() => setIsModalOpen(true)}
              disabled={!formData.level}
            >
              <SearchIcon>
                <MdSearch />
              </SearchIcon>{" "}
              검색
            </CheckButton>
          </InputWrapper>

          {/* 학년/반 */}
          <GradeClassWrapper>
            <GradeClassInputBox>
              <Input
                type="number"
                name="grade"
                placeholder="학년"
                value={formData.grade}
                onChange={handleChange}
                min="1"
              />
            </GradeClassInputBox>
            <GradeClassInputBox>
              <Input
                type="number"
                name="classNo"
                placeholder="반"
                value={formData.classNo}
                onChange={handleChange}
                min="1"
              />
            </GradeClassInputBox>
          </GradeClassWrapper>

          <NextButton type="submit" disabled={isNextDisabled}>
            다음
          </NextButton>
        </RequiredForm>

        {/* ------------------- STEP 2: 선택 항목 (알레르기) ------------------- */}
        {step === 2 && <RequiredSection>선택 항목</RequiredSection>}
        <OptionalSection $visible={step === 2}>
          <OptionalSubtitle>알레르기</OptionalSubtitle>
          <AllergyGrid>
            {/* 알레르기 아이템 맵핑: id 사용 */}
            {allergyData.map((item) => (
              <AllergyItem
                key={item.id}
                onClick={() => handleAllergySelect(item.id)}
                selected={formData.allergyId.includes(item.id)}
              >
                <img src={item.icon} alt={item.name} />
                <p>{item.name}</p>
              </AllergyItem>
            ))}
          </AllergyGrid>
          <CompleteButton type="button" onClick={handleSubmit}>
            회원가입
          </CompleteButton>
        </OptionalSection>
      </FormBox>
    </SignUpContainer>
  );
};

export default SignUpForm;

// 회원가입 페이지 스타일
const SignUpContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 480px;
  margin: 0 auto;
  padding: 76px 0;
  min-height: 100vh;
  background-color: #ffffff;
`;

const FormBox = styled.div`
  max-width: 600px;
  width: 100%;
  text-align: center;
  .input-wrap {
    margin-bottom: 40px;
    .name {
      display: flex;
      gap: 16px;
      justify-content: space-between;
      .name-wrap {
        width: 50%;
      }
    }
  }
`;

const Title = styled.h2`
  font-size: 2.5rem;
  font-weight: 600;
  margin-bottom: 8px;
`;

const Subtitle = styled.p`
  margin-bottom: 30px;
`;

const RequiredSection = styled.div`
  font-size: 1.875rem;
  margin-bottom: 20px;
  font-weight: 600;
`;

// 필수 항목 폼 스타일
const RequiredForm = styled.form`
  display: ${(props) => (props.$visible ? "block" : "none")};
`;

const InputWrapper = styled.div`
  display: flex;
  align-items: center;
  border: 1px solid #ddd;
  border-radius: 5px;
  margin-bottom: 12px;
  padding: 10px;
`;

const Icon = styled.span`
  color: #999;
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Input = styled.input`
  border: none;
  outline: none;
  flex: 1;
  padding: 0 12px;
  color: var(--text-color);
`;

const CheckButton = styled.button`
  display: flex;
  align-items: center;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  white-space: nowrap;
  cursor: pointer;
  background-color: var(--primary-color);
`;

const GenderButtonWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 12px;
`;

const GenderButton = styled.button`
  flex: 1;
  background-color: #fff;
  color: #555;
  border: 1px solid #ddd;
  padding: 15px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.2s;

  ${(props) =>
    props.selected &&
    css`
      background-color: var(--primary-color);
      color: white;
      border-color: var(--primary-color);
    `}
`;

const PhoneInputWrapper = styled.div`
  display: flex;
  align-items: center;
`;
const PhoneInputBox = styled(InputWrapper)`
  flex: 1;
  margin-bottom: 0;
`;
const NoPhoneRadio = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
  margin-left: 10px;
  padding: 8px 0;

  input {
    margin-right: 6px;
  }
  label {
    white-space: nowrap;
  }
`;

const SchoolLevelWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 10px 16px;
  margin-bottom: 15px;
`;

const SchoolLevelRadioGroup = styled.div`
  display: flex;
  gap: 54px;
`;

const RadioLabel = styled.label`
  display: flex;
  align-items: center;
  cursor: pointer;
`;

const RadioInput = styled.input`
  position: relative;
  margin-right: 8px;
  appearance: none;
  width: 20px;
  height: 20px;
  border: 1px solid #ddd;
  border-radius: 50%;

  &:checked {
    border-color: var(--primary-color);
  }

  &:checked::before {
    content: "";
    display: block;
    width: 10px;
    height: 10px;
    background-color: var(--primary-color);
    border-radius: 50%;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
`;

const GradeClassWrapper = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
`;

const GradeClassInputBox = styled(InputWrapper)`
  flex: 1;
  margin-bottom: 0;
`;

const NextButton = styled.button`
  width: 100%;
  background-color: var(--primary-color);
  color: white;
  border: none;
  padding: 16px;
  font-weight: bold;
  border-radius: 8px;
  cursor: pointer;
`;

const SearchIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  color: #ffffff;
`;

// 선택 항목 폼 (알레르기) 스타일
const OptionalSection = styled.div`
  display: ${(props) => (props.$visible ? "block" : "none")};
  text-align: center;
`;

const OptionalTitle = styled.h3`
  font-size: 1.875rem;
  font-weight: 600;
  margin-bottom: 8px;
`;

const OptionalSubtitle = styled.p`
  margin-bottom: 24px;
`;

const AllergyGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 20px;
`;

const AllergyItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;

  img {
    width: 50px;
    height: 50px;
    margin-bottom: 8px;
  }

  p {
    font-size: 0.875rem;
    color: #666;
  }
`;

const CompleteButton = styled(NextButton)`
  background-color: #f7a1a1;
  color: #fff;
  margin-top: 40px;
`;

const ValidationMessage = styled.p`
  font-size: 0.875rem;
  margin: -8px 0 12px 12px; /* 위아래, 좌우 여백 조정 */
  text-align: left;
  height: 1.2em; /* 메시지가 없을 때도 공간을 차지해 레이아웃이 흔들리지 않게 함 */

  /* status prop 값에 따라 글자색 변경 */
  color: ${({ status }) =>
    status === "valid"
      ? "green" /* 성공 시 초록색 */
      : status === "invalid"
        ? "red" /* 실패 시 빨간색 */
        : "#666"}; /* 기본 회색 */
`;
