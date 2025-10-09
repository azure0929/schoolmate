import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styled, { css } from "styled-components";
import { FaRegUser } from "react-icons/fa";
import axios from "axios";
import SchoolSelector from "@/components/common/SchoolSelector";

import {
  MdOutlineEmail,
  MdLockOutline,
  MdOutlinePermContactCalendar,
  MdOutlinePhone,
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

const BASE_API_URL = import.meta.env.VITE_API_URL || "http://localhost:9000";

const api = axios.create({
  baseURL: BASE_API_URL,
});

const apiService = {
  checkDuplicate: (type, value) =>
    api.get(`/api/auth/check-${type}`, { params: { [type]: value } }),
  submitSignup: (data) => api.post("/api/auth/signup", data),
  submitSocialSignup: (data) => api.post("/api/auth/signup/social", data),
  login: (credentials) => api.post("/api/auth/login", credentials),
};

const allergyData = [
  { id: 1, name: "난류", icon: allergy1 },
  { id: 2, name: "우유", icon: allergy2 },
  { id: 3, name: "메밀", icon: allergy3 },
  { id: 4, name: "땅콩", icon: allergy4 },
  { id: 5, name: "대두", icon: allergy5 },
  { id: 6, name: "밀", icon: allergy6 },
  { id: 7, name: "고등어", icon: allergy7 },
  { id: 8, name: "게", icon: allergy8 },
  { id: 9, name: "새우", icon: allergy9 },
  { id: 10, name: "돼지고기", icon: allergy10 },
  { id: 11, name: "복숭아", icon: allergy11 },
  { id: 12, name: "토마토", icon: allergy12 },
  { id: 13, name: "아황산류", icon: allergy13 },
  { id: 14, name: "호두", icon: allergy14 },
  { id: 15, name: "닭고기", icon: allergy15 },
  { id: 16, name: "쇠고기", icon: allergy16 },
  { id: 17, name: "오징어", icon: allergy17 },
  { id: 18, name: "조개류", icon: allergy18 },
  { id: 19, name: "잣", icon: allergy19 },
  { id: 20, name: "아무개", icon: allergy20 },
];

const SignUp = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedAllergies, setSelectedAllergies] = useState([]);

  const [step, setStep] = useState(1);
  const [tempToken, setTempToken] = useState(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    nickname: "",
    gender: "",
    phone: "",
    birthDay: "",
    schoolInfo: {
      level: "",
      scCode: "",
      schoolCode: "",
      schoolName: "",
      majorName: "",
      grade: "",
      classNo: "",
    },
    allergyId: [],
  });

  const [validation, setValidation] = useState({
    email: { status: "unchecked", message: "" },
    nickname: { status: "unchecked", message: "" },
    phone: { status: "unchecked", message: "" },
    password: { status: "unchecked", message: "" }, // 비밀번호 정책 검사 상태 추가
    passwordMatch: { status: "unchecked", message: "" },
    name: { status: "unchecked", message: "" },
    nicknamePattern: { status: "unchecked", message: "" },
  });

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const token = searchParams.get("tempToken");
    if (token && !tempToken) {
      const email = searchParams.get("email");
      const nickname = searchParams.get("nickname");

      setTempToken(token);
      setFormData((prev) => ({
        ...prev,
        email: email || "",
        nickname: nickname || "",
        password: "SOCIAL_USER_TEMP_PASSWORD",
        confirmPassword: "SOCIAL_USER_TEMP_PASSWORD",
      }));
      setValidation((prev) => ({
        ...prev,
        email: { status: "valid", message: "소셜 계정 이메일입니다." },
      }));
    }
  }, [location, tempToken]);

  const isStep1NextDisabled = useMemo(() => {
    const {
      email,
      password,
      confirmPassword,
      name,
      nickname,
      birthDay,
      gender,
      phone,
    } = formData;
    const requiredFieldsFilled =
      email &&
      password &&
      confirmPassword &&
      name &&
      nickname &&
      birthDay &&
      gender &&
      phone;

    // [수정] '다음' 버튼 활성화 조건에 비밀번호 정책 유효성(validation.password.status) 추가
    const checksPassed =
      validation.email.status === "valid" &&
      validation.nickname.status === "valid" &&
      validation.phone.status === "valid" &&
      validation.name.status !== "invalid" &&
      validation.nicknamePattern.status !== "invalid" &&
      (!!tempToken ||
        (validation.password.status === "valid" &&
          validation.passwordMatch.status === "valid"));

    return !(requiredFieldsFilled && checksPassed);
  }, [formData, validation, tempToken]);

  const isStep2NextDisabled = useMemo(() => {
    const { level, schoolName, majorName, grade, classNo } =
      formData.schoolInfo;
    const baseInfoFilled = schoolName && grade && classNo;
    // 고등학교는 학과까지 필수
    if (level === "고등학교") {
      const majorListExists = majorName !== undefined; // SchoolSelector에서 학과목록을 가져왔는지 여부
      return !(baseInfoFilled && (!majorListExists || majorName));
    }
    return !baseInfoFilled;
  }, [formData.schoolInfo]);

  const handleSchoolDataChange = useCallback((newSchoolInfo) => {
    setFormData((prev) => ({
      ...prev,
      schoolInfo: newSchoolInfo,
    }));
  }, []);

  // [핵심 수정 1] 전화번호 자동 하이픈 및 길이 제한 로직 복구
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "phone") {
      const cleaned = ("" + value).replace(/\D/g, "");
      if (cleaned.length > 11) {
        return;
      }
      let formatted = cleaned;
      if (cleaned.length > 3 && cleaned.length <= 7) {
        formatted = `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
      } else if (cleaned.length > 7) {
        formatted = `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7)}`;
      }
      setFormData((prev) => ({ ...prev, phone: formatted }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    if (["email", "nickname", "phone"].includes(name)) {
      setValidation((prev) => ({
        ...prev,
        [name]: { status: "unchecked", message: "" },
      }));
    }

    // [수정] 강화된 비밀번호 유효성 검사 로직
    if (name === "password") {
      const hasLetter = /[a-zA-Z]/.test(value);
      const hasNumber = /[0-9]/.test(value);
      const hasSpecial = /[^a-zA-Z0-9]/.test(value);
      const isValidLength = value.length >= 8;

      let status = "invalid";
      let message = "";

      if (!isValidLength) {
        message = "비밀번호는 최소 8자 이상이어야 합니다.";
      } else if (!hasLetter || !hasNumber || !hasSpecial) {
        // 어떤 조건이 누락되었는지 구체적으로 알려주는 메시지 생성
        const missingParts = [];
        if (!hasLetter) missingParts.push("영문");
        if (!hasNumber) missingParts.push("숫자");
        if (!hasSpecial) missingParts.push("특수문자");
        message = `영문, 숫자, 특수문자를 모두 조합해야 합니다. (${missingParts.join(", ")} 누락)`;
      } else {
        status = "valid";
        message = "안전한 비밀번호입니다!";
      }
      setValidation((prev) => ({ ...prev, password: { status, message } }));
    }

    if (name === "password" || name === "confirmPassword") {
      const newPassword = name === "password" ? value : formData.password;
      const newConfirmPassword =
        name === "confirmPassword" ? value : formData.confirmPassword;
      const isMatch =
        newPassword && newConfirmPassword && newPassword === newConfirmPassword;
      setValidation((prev) => ({
        ...prev,
        passwordMatch: {
          status: isMatch ? "valid" : "invalid",
          message: isMatch ? "" : "비밀번호가 일치하지 않습니다.",
        },
      }));
    }

    // [수정] 이름, 닉네임 유효성 검사 로직
    if (name === "name" || name === "nickname") {
      const validationType = name === "name" ? "name" : "nicknamePattern";
      const isNameField = name === "name";
      const maxLength = isNameField ? 20 : 10; // 이름은 20자, 닉네임은 10자
      const fieldName = isNameField ? "이름" : "닉네임";

      let status = "unchecked",
        message = "";

      if (value.length > maxLength) {
        status = "invalid";
        message = `${fieldName}은(는) ${maxLength}자를 초과할 수 없습니다.`;
      } else if (/[^가-힣a-zA-Z0-9\s]/.test(value) && !isNameField) {
        // 닉네임 특수문자 체크
        status = "invalid";
        message = "닉네임에는 특수문자를 사용할 수 없습니다.";
      } else if (/[^가-힣a-zA-Z\s]/.test(value) && isNameField) {
        // 이름 숫자/특수문자 체크
        status = "invalid";
        message = "이름에는 숫자나 특수문자를 사용할 수 없습니다.";
      }
      setValidation((prev) => ({
        ...prev,
        [validationType]: { status, message },
      }));
    }
  };

  const handleGenderChange = (gender) => {
    setFormData((prev) => ({ ...prev, gender }));
  };

  const handleAllergySelect = (id) => {
    setFormData((prev) => {
      const allergyId = prev.allergyId.includes(id)
        ? prev.allergyId.filter((item) => item !== id)
        : [...prev.allergyId, id];
      return { ...prev, allergyId };
    });
  };

  // [핵심 수정 2] 중복 체크 로직 최종 수정 (가장 표준적인 방식으로)
  const handleDuplicateCheck = async (type) => {
    const typeKorean = {
      email: "이메일",
      nickname: "닉네임",
      phone: "전화번호",
    };
    let value = formData[type];

    if (!value.trim()) {
      alert(`${typeKorean[type]}을(를) 입력해주세요.`);
      return;
    }
    if (
      type === "email" &&
      !/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(value)
    ) {
      alert("올바른 이메일 형식을 입력해주세요.");
      return;
    }
    if (type === "phone") {
      value = value.replace(/-/g, "");
    }

    setValidation((prev) => ({
      ...prev,
      [type]: { status: "checking", message: "확인 중..." },
    }));

    try {
      await apiService.checkDuplicate(type, value);
      setValidation((prev) => ({
        ...prev,
        [type]: { status: "valid", message: "사용 가능합니다!" },
      }));
    } catch (error) {
      if (error.response && error.response.status === 409) {
        setValidation((prev) => ({
          ...prev,
          [type]: {
            status: "invalid",
            message: `이미 사용 중인 ${typeKorean[type]}입니다.`,
          },
        }));
      } else {
        setValidation((prev) => ({
          ...prev,
          [type]: {
            status: "invalid",
            message: "확인 중 오류가 발생했습니다.",
          },
        }));
        console.error(`${type} 중복 확인 실패:`, error);
      }
    }
  };
  const handleNextStep = (e) => {
    if (e) e.preventDefault();
    setStep((prev) => prev + 1);
  };

  const handleNormalSubmit = async (data) => {
    try {
      await apiService.submitSignup(data);
      alert("회원가입에 성공했습니다!");
      const loginRes = await apiService.login({
        email: formData.email,
        password: formData.password,
      });
      const authHeader =
        loginRes.headers.authorization || loginRes.headers.Authorization;
      if (authHeader?.startsWith("Bearer ")) {
        const token = authHeader.split(" ")[1];
        localStorage.setItem("authToken", token);
        navigate("/mainpage", { replace: true });
      } else {
        throw new Error("토큰 추출 실패");
      }
    } catch (error) {
      console.error("일반 회원가입/로그인 오류:", error);
      alert(
        `회원가입 중 오류 발생: ${error.response?.data?.message || "서버 오류"}`,
      );
    }
  };

  const handleSocialSubmit = async (data) => {
    try {
      const response = await apiService.submitSocialSignup(data);
      alert("회원가입이 성공적으로 완료되었습니다!");
      const finalToken = response.data.token;
      if (finalToken) {
        localStorage.setItem("authToken", finalToken);
        navigate("/mainpage", { replace: true });
      } else {
        throw new Error("로그인 토큰을 받지 못했습니다.");
      }
    } catch (error) {
      console.error("소셜 회원가입 완료 실패:", error);
      alert(
        `가입 중 오류 발생: ${error.response?.data?.message || "서버 오류"}`,
      );
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { schoolInfo, allergyId, ...rest } = formData;
    const commonProfileData = {
      nickname: rest.nickname,
      gender: rest.gender === "남자" ? "MALE" : "FEMALE",
      phone: rest.phone.replace(/-/g, ""),
      birthDay: rest.birthDay,
      scCode: schoolInfo.scCode,
      schoolCode: schoolInfo.schoolCode,
      schoolName: schoolInfo.schoolName,
      majorName: schoolInfo.majorName || "일반학과",
      grade: parseInt(schoolInfo.grade),
      classNo: parseInt(schoolInfo.classNo),
      level: schoolInfo.level,
    };

    if (tempToken) {
      const socialSignupData = {
        tempToken,
        student: {
          email: rest.email,
          password: rest.password,
          name: rest.name,
        },
        profile: commonProfileData,
        allergyId,
      };
      handleSocialSubmit(socialSignupData);
    } else {
      const signupData = {
        student: {
          email: rest.email,
          password: rest.password,
          name: rest.name,
        },
        profile: commonProfileData,
        allergyId,
      };
      handleNormalSubmit(signupData);
    }
  };

  return (
    <SignUpContainer>
      <FormBox>
        <Title>회원가입</Title>
        <Subtitle>자세한 학교 정보를 알고 싶다면 입력해주세요!</Subtitle>

        <RequiredForm onSubmit={handleNextStep} $visible={step === 1}>
          <RequiredSection>필수 정보 입력</RequiredSection>
          <InputGroup>
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
                readOnly={!!tempToken}
                style={!!tempToken ? { backgroundColor: "#f0f0f0" } : {}}
              />
              {!tempToken && (
                <CheckButton
                  type="button"
                  onClick={() => handleDuplicateCheck("email")}
                >
                  중복확인
                </CheckButton>
              )}
            </InputWrapper>
            <ValidationMessage $status={validation.email.status}>
              {validation.email.message}
            </ValidationMessage>
          </InputGroup>

          {!tempToken && (
            <>
              <InputGroup>
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
                <ValidationMessage $status={validation.password.status}>
                  {validation.password.message}
                </ValidationMessage>
              </InputGroup>
              <InputGroup>
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
                <ValidationMessage $status={validation.passwordMatch.status}>
                  {validation.passwordMatch.message}
                </ValidationMessage>
              </InputGroup>
            </>
          )}

          <InputGroup>
            <InputWrapper>
              <Icon>
                <FaRegUser />
              </Icon>
              <Input
                type="text"
                name="name"
                placeholder="이름 (20자 이내, 숫자/특수문자 제외)"
                value={formData.name}
                onChange={handleChange}
              />
            </InputWrapper>
            <ValidationMessage $status={validation.name.status}>
              {validation.name.message}
            </ValidationMessage>
          </InputGroup>

          <InputGroup>
            <InputWrapper>
              <Icon>
                <FaRegUser />
              </Icon>
              <Input
                type="text"
                name="nickname"
                placeholder="닉네임 (10자 이내, 특수문자 제외)"
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
            <ValidationMessage
              $status={
                validation.nickname.status !== "invalid" &&
                validation.nicknamePattern.status === "invalid"
                  ? "invalid"
                  : validation.nickname.status
              }
            >
              {validation.nickname.status === "valid"
                ? validation.nickname.message
                : validation.nicknamePattern.message ||
                  validation.nickname.message}
            </ValidationMessage>
          </InputGroup>

          <InputGroup>
            <InputWrapper>
              <Icon>
                <MdOutlinePermContactCalendar />
              </Icon>
              <Input
                type="date"
                name="birthDay"
                value={formData.birthDay}
                onChange={handleChange}
              />
            </InputWrapper>
          </InputGroup>

          <InputGroup>
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
          </InputGroup>

          <InputGroup>
            <InputWrapper>
              <Icon>
                <MdOutlinePhone />
              </Icon>
              <Input
                type="tel"
                name="phone"
                placeholder="휴대전화번호"
                value={formData.phone}
                onChange={handleChange}
              />
              <CheckButton
                type="button"
                onClick={() => handleDuplicateCheck("phone")}
              >
                중복확인
              </CheckButton>
            </InputWrapper>
            <ValidationMessage $status={validation.phone.status}>
              {validation.phone.message}
            </ValidationMessage>
          </InputGroup>

          <NextButton type="submit" disabled={isStep1NextDisabled}>
            다음
          </NextButton>
        </RequiredForm>

        <RequiredForm onSubmit={handleNextStep} $visible={step === 2}>
          <RequiredSection>학교 정보 입력</RequiredSection>
          <SchoolSelector
            schoolData={formData.schoolInfo}
            onSchoolChange={handleSchoolDataChange}
          />
          <NextButton
            type="button"
            onClick={handleNextStep}
            disabled={isStep2NextDisabled}
          >
            다음
          </NextButton>
        </RequiredForm>

        <OptionalSection onSubmit={handleSubmit} $visible={step === 3}>
          <RequiredSection>3단계: 알레르기 선택 (선택)</RequiredSection>
          <AllergyGrid>
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
          <CompleteButton type="submit">회원가입</CompleteButton>
        </OptionalSection>
      </FormBox>
    </SignUpContainer>
  );
};

export default SignUp;

// --- Styled Components ---
const SignUpContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 480px;
  margin: 0 auto;
  padding: 76px 20px;
  min-height: 100vh;
  background-color: #ffffff;
`;

const FormBox = styled.div`
  max-width: 600px;
  width: 100%;
  text-align: center;
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

const RequiredForm = styled.form`
  display: ${(props) => (props.$visible ? "block" : "none")};
`;
const InputGroup = styled.div`
  margin-bottom: 20px;
  &:last-of-type {
    margin-bottom: 30px;
  }
`;
const InputWrapper = styled.div`
  display: flex;
  align-items: center;
  border: 1px solid #ddd;
  border-radius: 5px;
  padding: 10px;
  background-color: #f9f9f9;
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
  font-size: 1rem;
  color: #333;
  background-color: transparent;
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

const NextButton = styled.button`
  width: 100%;
  background-color: var(--primary-color);
  color: white;
  border: none;
  padding: 16px;
  font-weight: bold;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;

const OptionalSection = styled.form`
  display: ${(props) => (props.$visible ? "block" : "none")};
  text-align: center;
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
  padding: 5px;
  border-radius: 8px;
  border: 2px solid transparent;
  transition: all 0.2s;

  img {
    width: 50px;
    height: 50px;
    margin-bottom: 8px;
  }
  p {
    font-size: 0.875rem;
    color: #666;
  }

  ${(props) =>
    props.selected &&
    css`
      border-color: var(--primary-color);
      background-color: #fff5f7;
    `}
`;

const CompleteButton = styled(NextButton)`
  margin-top: 40px;
`;

const ValidationMessage = styled.p`
  font-size: 0.875rem;
  margin: 4px 0 4px 4px;
  text-align: left;
  height: 1.2em;
  color: ${({ $status }) =>
    $status === "valid" ? "green" : $status === "invalid" ? "red" : "#666"};
`;
