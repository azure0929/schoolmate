import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styled, { css } from "styled-components";
import { FaRegUser } from "react-icons/fa";
import axios from "axios";
import SchoolSearchModal from "@/components/modals/SchoolSearchModal";

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

const apiService = {
  // 중복 확인 API 호출
  checkDuplicate: (type, value) => {
    return axios.get(`http://localhost:9000/api/auth/check-${type}`, {
      params: { [type]: value },
    });
  },
  // 학과 목록 조회 API 호출
  fetchMajors: (educationOfficeCode, schoolCode) => {
    return axios.get("http://localhost:9000/api/school-search/majors", {
      params: { educationOfficeCode, schoolCode },
    });
  },
  // 반 목록 조회 API 호출
  fetchClasses: (educationOfficeCode, schoolCode, grade, majorName) => {
    return axios.get("http://localhost:9000/api/school-search/class-info", {
      params: { educationOfficeCode, schoolCode, grade, majorName },
    });
  },
  // 최종 회원가입 데이터 전송
  submitSignup: (data) => {
    return axios.post("http://localhost:9000/api/auth/signup", data);
  },
  // 소셜 회원가입 데이터 전송
  submitSocialSignup: (data) => {
    return axios.post("http://localhost:9000/api/auth/signup/social", data);
  },
};

const SignUpForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // 소셜 가입용 임시 토큰을 저장할 상태
  const [tempToken, setTempToken] = useState(null);

  // 페이지가 처음 렌더링될 때, URL을 확인해서 임시 토큰이 있는지 검사
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const token = searchParams.get("tempToken");
    const nickname = searchParams.get("nickname");

    if (token) {
      console.log("소셜 가입 플로우 시작. 임시 토큰 발견:", token);
      setTempToken(token);
      // URL에 닉네임이 있다면, 폼에 미리 채워줌
      if (nickname) {
        setFormData((prev) => ({ ...prev, nickname: nickname }));
      }
    }
  }, [location]);

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
    birthDay: "",
    scCode: "",
    schoolCode: "",
    schoolName: "",
    majorName: "",
    grade: "",
    classNo: "",
    level: "", // schoolLevel 대신 level 사용
    // allergy
    allergyId: [],
  });

  // 중복 및 유효성 검사 상태 관리
  const [validation, setValidation] = useState({
    email: { status: "unchecked", message: "" },
    nickname: { status: "unchecked", message: "" },
    phone: { status: "unchecked", message: "" },
    passwordMatch: { status: "unchecked", message: "" },
    name: { status: "unchecked", message: "" }, // 이름 유효성
    nicknamePattern: { status: "unchecked", message: "" }, // 닉네임 유효성
  });

  // 선택된 학교의 학과 목록
  const [majorList, setMajorList] = useState([]);
  // 선택된 학년의 반 목록
  const [classList, setClassList] = useState([]);

  // 학교 검색 모달 표시 여부 관리
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 버튼 활성화 상태 관리
  const [isStep1NextDisabled, setIsStep1NextDisabled] = useState(true);
  const [isStep2NextDisabled, setIsStep2NextDisabled] = useState(true);

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
  ];

  // --- useEffect: 각 단계별 유효성 검사 ---
  useEffect(() => {
    // 1단계 유효성 검사
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
    // 필수 필드 채워짐 여부
    const requiredFieldsFilled =
      email &&
      password &&
      confirmPassword &&
      name &&
      nickname &&
      birthDay &&
      gender &&
      phone;
    // 유효성/중복 검사 통과 여부
    const checksPassed =
      validation.email.status === "valid" &&
      validation.nickname.status === "valid" &&
      validation.phone.status === "valid" &&
      validation.name.status !== "invalid" && // 이름 유효성 검사 추가
      validation.nicknamePattern.status !== "invalid"; // 닉네임 유효성 검사 추가
    // 비밀번호 일치 여부
    let passwordMatch = false;
    if (password && confirmPassword) {
      passwordMatch = password === confirmPassword;
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

    setIsStep1NextDisabled(
      !(requiredFieldsFilled && checksPassed && passwordMatch),
    );
  }, [formData, validation]); // 의존성 배열에 validation 추가

  useEffect(() => {
    // 2단계 유효성 검사
    const { level, schoolName, grade, classNo, majorName } = formData;
    const majorCheckPassed = majorList.length > 0 ? !!majorName : true;
    const requiredFieldsFilled =
      level && schoolName && grade && classNo && majorCheckPassed;
    setIsStep2NextDisabled(!requiredFieldsFilled);
  }, [formData]);

  // --- 전화번호 포맷팅 헬퍼 함수 ---
  const formatPhoneNumber = (phoneNumber) => {
    if (!phoneNumber) return "";
    const cleaned = ("" + phoneNumber).replace(/\D/g, ""); // 숫자만 남김
    const match = cleaned.match(/^(\d{3})(\d{4})(\d{4})$/);
    if (match) {
      return `${match[1]}-${match[2]}-${match[3]}`;
    }
    return cleaned; // 포맷에 맞지 않으면 숫자만 반환
  };

  // --- 이벤트 핸들러: 비동기 로직 ---
  const handleDuplicateCheck = async (type) => {
    let value = formData[type];
    const typeKorean = {
      email: "이메일을",
      nickname: "닉네임을",
      phone: "전화번호를",
    };

    if (!value.trim()) {
      alert(`${typeKorean[type]} 입력해주세요.`);
      return;
    }

    if (type === "email") {
      const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
      if (!emailRegex.test(value)) {
        alert("올바른 이메일 형식을 입력해주세요.");
        return; // 형식이 틀리면 여기서 함수 종료
      }
    }

    try {
      setValidation((prev) => ({
        ...prev,
        [type]: { status: "checking", message: "확인 중..." },
      }));
      const response = await apiService.checkDuplicate(type, value);
      if (response.data) {
        setValidation((prev) => ({
          ...prev,
          [type]: {
            status: "invalid",
            message: `이미 사용 중인 ${typeKorean[type].slice(0, -1)}입니다.`,
          },
        }));
      } else {
        setValidation((prev) => ({
          ...prev,
          [type]: { status: "valid", message: "사용 가능합니다!" },
        }));
        // 전화번호인 경우, 성공하면 포맷팅하여 다시 저장
        if (type === "phone") {
          setFormData((prev) => ({ ...prev, phone: formatPhoneNumber(value) }));
        }
      }
    } catch (error) {
      setValidation((prev) => ({
        ...prev,
        [type]: { status: "error", message: "확인 중 오류 발생" },
      }));
      console.error(`${type} 중복 확인 실패:`, error);
    }
  };
  const handleSchoolSelect = async (school) => {
    setFormData((prev) => ({
      ...prev,
      schoolName: school.SCHUL_NM,
      scCode: school.ATPT_OFCDC_SC_CODE,
      schoolCode: school.SD_SCHUL_CODE,
      majorName: "",
      grade: "",
      classNo: "",
    }));
    setMajorList([]);
    setClassList([]);
    try {
      const response = await apiService.fetchMajors(
        school.ATPT_OFCDC_SC_CODE,
        school.SD_SCHUL_CODE,
      );
      setMajorList(response.data);
    } catch (error) {
      setMajorList([]);
    }
  };

  const handleGradeChange = async (e) => {
    const newGrade = e.target.value;
    setFormData((prev) => ({ ...prev, grade: newGrade, classNo: "" }));
    setClassList([]);
    if (newGrade && formData.scCode && formData.schoolCode) {
      try {
        // 백엔드 API를 호출할 때 사용자가 선택한 학과명을 함께 전달!
        const response = await apiService.fetchClasses(
          formData.scCode,
          formData.schoolCode,
          newGrade,
          formData.majorName, // 👈 여기가 중요!
        );

        // 서버에서 이미 필터링된 결과를 그대로 state에 저장
        setClassList(response.data);
      } catch (error) {
        console.error("반 정보 조회 실패:", error);
        setClassList([]);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (tempToken) {
      // --- 소셜 회원가입 완료 로직 ---
      const socialSignupData = {
        tempToken: tempToken,
        profile: {
          nickname: formData.nickname,
          gender: formData.gender === "남자" ? "MALE" : "FEMALE",
          phone: formData.phone,
          birthDay: formData.birthDay,
          scCode: formData.scCode,
          schoolCode: formData.schoolCode,
          schoolName: formData.schoolName,
          majorName: formData.majorName || "일반학과",
          grade: parseInt(formData.grade),
          classNo: parseInt(formData.classNo),
          level: formData.level,
        },
        student: {
          // 백엔드가 최소한의 정보를 요구하므로 보내줍니다.
          name: formData.name,
          password: "social_user_temp_password", // 소셜 유저는 임시 비밀번호
        },
        allergyId: formData.allergyId,
      };

      try {
        // 소셜 손님용 문으로 요청을 보내도록 수정합니다.
        const response = await axios.post(
          "http://localhost:9000/api/auth/signup/social",
          socialSignupData,
        );
        alert("회원가입이 성공적으로 완료되었습니다!");

        const finalToken = response.data.token;
        if (finalToken) {
          localStorage.setItem("authToken", finalToken);
          navigate("/mainpage", { replace: true });
        } else {
          alert("로그인에 실패했습니다. 다시 시도해주세요.");
          navigate("/", { replace: true });
        }
      } catch (error) {
        console.error("소셜 회원가입 완료 실패:", error);
        alert(
          `가입 중 오류가 발생했습니다: ${error.response?.data?.message || "서버 오류"}`,
        );
      }
    } else {
      // --- 일반 회원가입 로직 (기존 코드와 완벽하게 동일) ---
      const signupData = {
        student: {
          email: formData.email,
          password: formData.password,
          name: formData.name,
        },
        profile: {
          nickname: formData.nickname,
          gender: formData.gender === "남자" ? "MALE" : "FEMALE",
          phone: formData.phone,
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

      try {
        // apiService를 사용하셨으니, 그대로 사용합니다.
        await apiService.submitSignup(signupData);
        alert("회원가입에 성공했습니다! 자동으로 로그인합니다.");

        const loginRes = await api.post("/auth/login", {
          email: formData.email,
          password: formData.password,
        });

        const token = loginRes.headers.authorization?.split(" ")[1];

        if (token) {
          localStorage.setItem("authToken", token);
          navigate("/mainpage", { replace: true });
        } else {
          alert("자동 로그인에 실패했습니다. 로그인 페이지로 이동합니다.");
          navigate("/", { replace: true });
        }
      } catch (error) {
        console.error("일반 회원가입/자동 로그인 중 오류:", error);
        alert(
          `회원가입 중 오류: ${error.response?.data?.message || "서버 오류"}`,
        );
      }
    }
  };

  // --- 이벤트 핸들러: 동기 로직 ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const newState = { ...prev, [name]: value };

      // 학과 변경 시 초기화 로직
      if (name === "majorName") {
        newState.grade = "";
        newState.classNo = "";
        setClassList([]);
      }
      // ------------------------------------

      return newState;
    });

    // 중복 검사 상태 초기화
    if (["email", "nickname", "phone"].includes(name)) {
      setValidation((prev) => ({
        ...prev,
        [name]: { status: "unchecked", message: "" },
      }));
    }

    // 이름 유효성 검사 (실시간)
    if (name === "name") {
      if (value.length > 10) {
        setValidation((prev) => ({
          ...prev,
          name: {
            status: "invalid",
            message: "이름은 10글자를 초과할 수 없습니다.",
          },
        }));
      } else if (/[^가-힣a-zA-Z\s]/.test(value)) {
        // 한글, 영문, 공백 제외 특수문자/숫자
        setValidation((prev) => ({
          ...prev,
          name: {
            status: "invalid",
            message: "이름에는 숫자나 특수문자를 사용할 수 없습니다.",
          },
        }));
      } else {
        setValidation((prev) => ({
          ...prev,
          name: { status: "unchecked", message: "" },
        }));
      }
    }

    // 닉네임 유효성 검사 (실시간)
    if (name === "nickname") {
      if (value.length > 10) {
        setValidation((prev) => ({
          ...prev,
          nicknamePattern: {
            status: "invalid",
            message: "닉네임은 10글자를 초과할 수 없습니다.",
          },
        }));
      } else if (/[^가-힣a-zA-Z0-9\s]/.test(value)) {
        // 한글, 영문, 숫자, 공백 제외 특수문자
        setValidation((prev) => ({
          ...prev,
          nicknamePattern: {
            status: "invalid",
            message: "닉네임에는 특수문자를 사용할 수 없습니다.",
          },
        }));
      } else {
        setValidation((prev) => ({
          ...prev,
          nicknamePattern: { status: "unchecked", message: "" },
        }));
      }
    }

    // 비밀번호 확인 실시간 업데이트 (여기서 바로 validation.passwordMatch를 업데이트할 필요는 없음)
    // useEffect에서 formData.password, formData.confirmPassword 의존성으로 처리됨
  };

  const handleNextStep = (e) => {
    e.preventDefault();
    const requiredFieldsMap = {
      1: {
        email: "이메일",
        password: "비밀번호",
        confirmPassword: "비밀번호 확인",
        name: "이름",
        nickname: "닉네임",
        birthDay: "생년월일",
        gender: "성별",
        phone: "전화번호",
      },
      2: {
        level: "교육 수준",
        schoolName: "학교",
        grade: "학년",
        classNo: "반",
        ...(majorList.length > 0 && { majorName: "학과" }),
      },
    };
    const fieldsToCheck = requiredFieldsMap[step];
    for (const field in fieldsToCheck) {
      if (!formData[field]) {
        alert(`'${fieldsToCheck[field]}' 항목을 모두 입력해야 합니다.`);
        return;
      }
    }

    // 1단계에서 다음 버튼을 누를 때 추가적인 유효성 검사
    if (step === 1) {
      if (validation.email.status !== "valid") {
        alert("이메일 중복 확인을 완료하거나 유효한 이메일을 입력하세요.");
        return;
      }
      if (validation.nickname.status !== "valid") {
        alert("닉네임 중복 확인을 완료하거나 유효한 닉네임을 입력하세요.");
        return;
      }
      if (validation.phone.status !== "valid") {
        alert("전화번호 중복 확인을 완료하거나 유효한 전화번호를 입력하세요.");
        return;
      }
      if (validation.name.status === "invalid") {
        alert(validation.name.message);
        return;
      }
      if (validation.nicknamePattern.status === "invalid") {
        alert(validation.nicknamePattern.message);
        return;
      }
      if (validation.passwordMatch.status !== "valid") {
        alert(validation.passwordMatch.message);
        return;
      }
    }

    setStep((prev) => prev + 1);
  };

  const gradeOptions = useMemo(() => {
    if (!formData.level) return [];
    const maxGrade = formData.level === "초등학교" ? 6 : 3;
    return Array.from({ length: maxGrade }, (_, i) => i + 1);
  }, [formData.level]);

  const handleGenderChange = (gender) =>
    setFormData((prev) => ({ ...prev, gender }));
  const handleAllergySelect = (id) =>
    setFormData((prev) => ({
      ...prev,
      allergyId: prev.allergyId.includes(id)
        ? prev.allergyId.filter((a) => a !== id)
        : [...prev.allergyId, id],
    }));
  const handleSchoolLevelChange = (e) =>
    setFormData((prev) => ({
      ...prev,
      level: e.target.value,
      schoolName: "",
      scCode: "",
      schoolCode: "",
      majorName: "",
      grade: "",
      classNo: "",
    }));

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

        {/* ====================================================== */}
        {/* STEP 1: 필수 정보 입력 */}
        {/* ====================================================== */}
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
          </InputGroup>
          {/* 비밀번호 */}
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
          </InputGroup>
          {/* 비밀번호 확인 */}
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
            <ValidationMessage status={validation.passwordMatch.status}>
              {validation.passwordMatch.message}
            </ValidationMessage>
          </InputGroup>

          {/* 이름 */}
          <InputGroup>
            <InputWrapper>
              <Icon>
                <FaRegUser />
              </Icon>
              <Input
                type="text"
                name="name"
                placeholder="이름 (10글자 이내, 숫자/특수문자 제외)"
                value={formData.name}
                onChange={handleChange}
              />
            </InputWrapper>
            <ValidationMessage status={validation.name.status}>
              {validation.name.message}
            </ValidationMessage>
          </InputGroup>

          {/* 닉네임*/}
          <InputGroup>
            <InputWrapper>
              <Icon>
                <FaRegUser />
              </Icon>
              <Input
                type="text"
                name="nickname"
                placeholder="닉네임 (10글자 이내, 특수문자 제외)"
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
              status={
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
          {/* 생년월일 */}
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
          {/* 생년월일 */}
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

          {/* 전화번호*/}
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
            <ValidationMessage status={validation.phone.status}>
              {validation.phone.message}
            </ValidationMessage>
          </InputGroup>

          <NextButton type="submit" disabled={isStep1NextDisabled}>
            다음
          </NextButton>
        </RequiredForm>

        {/* ====================================================== */}
        {/* STEP 2: 학교 정보 입력 */}
        {/* ====================================================== */}
        <RequiredForm onSubmit={handleNextStep} $visible={step === 2}>
          <RequiredSection>학교 정보 입력</RequiredSection>

          <InputGroup>
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
          </InputGroup>

          <InputGroup>
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
                <MdSearch /> 검색
              </CheckButton>
            </InputWrapper>
          </InputGroup>

          {majorList.length > 0 && (
            <InputGroup>
              <InputWrapper>
                <Icon>
                  <MdOutlineSchool />
                </Icon>
                <Select
                  name="majorName"
                  value={formData.majorName}
                  onChange={handleChange}
                >
                  <option value="">학과를 선택하세요</option>
                  {majorList.map((major) => (
                    <option key={major.DDDEP_NM} value={major.DDDEP_NM}>
                      {major.DDDEP_NM}
                    </option>
                  ))}
                </Select>
              </InputWrapper>
            </InputGroup>
          )}

          <InputGroup>
            <GradeClassWrapper>
              <SelectWrapper>
                <Select
                  name="grade"
                  value={formData.grade}
                  onChange={handleGradeChange}
                >
                  <option value="">학년 선택</option>
                  {gradeOptions.map((g) => (
                    <option key={g} value={g}>
                      {g}학년
                    </option>
                  ))}
                </Select>
              </SelectWrapper>
              <SelectWrapper>
                <Select
                  name="classNo"
                  value={formData.classNo}
                  onChange={handleChange}
                  disabled={classList.length === 0}
                >
                  <option value="">반 선택</option>
                  {classList.map((c) => (
                    <option key={c.CLASS_NM} value={c.CLASS_NM}>
                      {c.CLASS_NM}반
                    </option>
                  ))}
                </Select>
              </SelectWrapper>
            </GradeClassWrapper>
          </InputGroup>
          <NextButton type="submit" disabled={isStep2NextDisabled}>
            다음
          </NextButton>
        </RequiredForm>

        {/* ====================================================== */}
        {/* STEP 3: 알레르기 선택 */}
        {/* ====================================================== */}
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

export default SignUpForm;

// ======================================================
// == Styled-Components 전체 코드 ==
// ======================================================

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
  .name {
    display: flex;
    gap: 16px;
    justify-content: space-between;
    .name-wrap {
      width: 50%;
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

const RequiredForm = styled.form`
  display: ${(props) => (props.$visible ? "block" : "none")};
`;
const InputGroup = styled.div`
  margin-bottom: 20px; /* 각 입력 필드 그룹 간의 일관된 간격 */
  &:last-of-type {
    margin-bottom: 30px; /* 마지막 그룹에는 마진 제거 */
  }
`;
const InputWrapper = styled.div`
  display: flex;
  align-items: center;
  border: 1px solid #ddd;
  border-radius: 5px;
  /* margin-bottom: 12px; */
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

const Select = styled.select`
  border: none;
  outline: none;
  flex: 1;
  padding: 0 12px;
  font-size: 1rem;
  color: var(--text-primary);
  background-color: transparent;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
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
  gap: 8px;
  margin-bottom: 16px;
`;

// Select를 감싸기 위한 Wrapper 추가
const SelectWrapper = styled(InputWrapper)`
  flex: 1;
  margin-bottom: 0;
  padding: 0; /* 내부 Select가 padding을 갖도록 Wrapper는 padding 제거 */

  select {
    padding: 10px; /* Input과 유사한 내부 padding 적용 */
    width: 100%;
  }
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

// OptionalSection을 form으로 변경
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
  background-color: #f7a1a1; /* 다른 색상 예시 */
  margin-top: 40px;
`;

const ValidationMessage = styled.p`
  font-size: 0.875rem;
  margin: 4px 0 4px 4px;
  text-align: left;
  height: 1.2em;
  color: ${({ status }) =>
    status === "valid" ? "green" : status === "invalid" ? "red" : "#666"};
`;
