import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { MdOutlineEmail, MdLockOutline } from "react-icons/md";
import KakaoLogo from "@/assets/images/kakao.png";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// 환경 변수 안정화: 환경 변수가 로드되지 않을 경우 기본값 제공
const BASE_API_URL = import.meta.env.VITE_API_URL || "http://localhost:9000";

// 카카오 인가 요청을 위한 상수 추가
const KAKAO_CLIENT_ID =
  import.meta.env.VITE_KAKAO_CLIENT_ID || "f71b4c3a397902b27c666e262e974e86";
// const KAKAO_REDIRECT_URI = "http://localhost:9000/login/oauth2/code/kakao";
const KAKAO_SCOPE = "profile_nickname%20account_email";

const api = axios.create({
  baseURL: BASE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignUpClick = () => {
    navigate("/signup");
  };

  // 로그인 제출 핸들러 함수 (axios 인스턴스 사용)
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (email === "" || password === "") {
      alert("이메일과 비밀번호를 입력해주세요.");
      return;
    }

    try {
      // 인스턴스 사용: 전체 URL 대신 상대 경로만 사용
      const response = await api.post("/api/auth/login", { email, password });

      // 토큰 추출 안정화 (소문자/대문자 헤더 모두 처리)
      const authHeader =
        response.headers.authorization || response.headers.Authorization;
      let token = null;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
      }
      // ------------------------------------------

      if (token) {
        localStorage.setItem("authToken", token);

        // 서버 응답 body에서 role을 확인하여 이동
        if (response.data.role === "ADMIN") {
          navigate("/admin");
        } else {
          // STUDENT 또는 다른 역할인 경우의 기본 경로
          navigate("/mainpage");
        }
      } else {
        console.error("로그인 성공했으나 JWT를 찾을 수 없습니다.");
        alert("로그인에 실패했습니다: 토큰 오류");
      }
    } catch (error) {
      let errorMessage = "로그인에 실패했습니다.";

      if (error.response) {
        // 서버 응답이 있는 경우 (401, 403 등)
        try {
          // 백엔드 LoginFilter의 unsuccessfulAuthentication 응답 파싱
          const errorResponseText = error.response.data;
          // 응답이 JSON 문자열일 경우를 대비하여 파싱 시도
          const errorData = JSON.parse(errorResponseText);
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          // JSON 파싱 실패 시, 401 Unauthorized 일 때의 명시적 메시지 사용
          if (error.response.status === 401) {
            errorMessage = "이메일 또는 비밀번호가 일치하지 않습니다.";
          } else {
            errorMessage = error.response.statusText || errorMessage;
          }
        }
      } else if (error.request) {
        // 요청은 보냈으나 응답을 받지 못한 경우 (네트워크 에러)
        errorMessage = "서버에 연결할 수 없습니다. (네트워크 또는 CORS 문제)";
      } else {
        // 요청 설정 중 문제 발생
        errorMessage = "요청 설정 오류: " + error.message;
      }

      console.error("로그인 API 호출 에러:", error);
      alert(errorMessage);
    }
  };

  const handleKakaoLogin = () => {
    const SPRING_SECURITY_KAKAO_START_URL = `${BASE_API_URL}/oauth2/authorization/kakao`;
    window.location.href = SPRING_SECURITY_KAKAO_START_URL;
  };

  return (
    <LoginContainer>
      <Contents>
        <TitleSection>
          <MainTitle>
            학교생활 여기어때? <br />
            지금부터는 Fun!
          </MainTitle>
          <Subtitle>친구들과 소통하고, 포인트를 모아 혜택을 누리세요!</Subtitle>
        </TitleSection>

        {/* 폼 제출 핸들러 연결 */}
        <FormCard>
          <FormTitle>로그인</FormTitle>
          <LoginForm onSubmit={handleSubmit}>
            <FormGroup>
              <Label htmlFor="email">이메일</Label>
              <InputGroup>
                <Icon>
                  <MdOutlineEmail />
                </Icon>
                <StyledInput
                  id="email"
                  type="email"
                  placeholder="이메일 주소를 입력해주세요"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </InputGroup>
            </FormGroup>

            <FormGroup>
              <Label htmlFor="password">비밀번호</Label>
              <InputGroup>
                <Icon>
                  <MdLockOutline />
                </Icon>
                <StyledInput
                  id="password" // Label의 htmlFor와 연결
                  type="password"
                  placeholder="비밀번호를 입력해주세요"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </InputGroup>
            </FormGroup>
            <StyledButton type="submit" className="login">
              로그인
            </StyledButton>
            <StyledButton
              type="button"
              className="kakao"
              onClick={handleKakaoLogin}
            >
              <KakaoLogoImage src={KakaoLogo} alt="카카오 로고" />
              카카오 로그인
            </StyledButton>
          </LoginForm>

          <LinkContainer onClick={handleSignUpClick}>회원가입</LinkContainer>
        </FormCard>
      </Contents>
    </LoginContainer>
  );
};

export default Login;

const FormTitle = styled.h2`
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 30px;
  color: var(--text-primary);
  text-align: center;
`;

const FormCard = styled.div`
  width: 100%;
  max-width: 420px;
  padding: 40px;
  border-radius: 16px;
  flex-shrink: 0;
  background-color: rgba(255, 255, 255, 0.65);
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(4px);
`;

const LoginContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  width: 100%;
  background: var(--gradient-hero);
`;

const Contents = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0 auto;
  width: fit-content;
`;

const TitleSection = styled.div`
  margin-bottom: 46px;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
`;

const MainTitle = styled.h1`
  font-size: 3.75rem;
  font-weight: bold;
  line-height: 1.3;
  margin-bottom: 10px;
`;

const Subtitle = styled.p`
  font-size: 1.25rem;
  text-align: center;
  font-weight: 500;
`;

const LoginForm = styled.form`
  width: 100%;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
  width: 100%;
  text-align: left;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #333;
`;

const InputGroup = styled.div`
  position: relative;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  display: flex;
  align-items: center;
  padding: 0 15px;
  background-color: #f9f9f9;
  transition: border-color 0.2s;

  &:focus-within {
    border-color: var(--primary-color);
  }
`;

const Icon = styled.div`
  color: #929292;
  margin-right: 10px;
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StyledInput = styled.input`
  flex: 1;
  border: none;
  outline: none;
  font-size: 1rem;
  padding: 0;
  color: var(--text-color);
  height: 46px;
`;

const StyledButton = styled.button`
  width: 100%;
  height: 56px;
  padding: 15px;
  margin-bottom: 15px;
  font-weight: bold;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  &.login {
    background-color: var(--primary-color);
    color: white;
  }
  &.kakao {
    background-color: #fee500;
    color: #3c1e1e;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
  }
`;

const LinkContainer = styled.div`
  border-top: 1px solid #929292;
  margin-top: 44px;
  padding-top: 12px;
  width: 100%;
  text-align: center;
  cursor: pointer;
`;

const KakaoLogoImage = styled.img`
  width: 34px;
  height: 34px;
`;
