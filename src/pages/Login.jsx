import React, { useState } from "react";
import styled from "styled-components";
import { MdOutlineEmail, MdLockOutline } from "react-icons/md";
import KakaoLogo from "@/assets/images/kakao.png";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// 환경 변수 안정화: 환경 변수가 로드되지 않을 경우 기본값 제공
const BASE_API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:9000/api";

const api = axios.create({
  baseURL: BASE_API_URL,
  headers: {
    Authorization: localStorage.getItem("Authorization"),
  },
});

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignUpClick = () => {
    navigate("/signup");
  };

  // 로그인 제출 핸들러 함수 (axios 인스턴스 사용)
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (email.trim() === "" || password.trim() === "") {
      alert("이메일과 비밀번호를 입력해주세요.");
      return;
    }

    setLoading(true);
    try {
      // **중요**: 항상 앞에 슬래시를 붙여 절대 경로로 요청합니다.
      const response = await api.post(
        "/auth/login",
        { email, password },
        { withCredentials: true },
      );

      // 응답 구조 안전하게 분해
      const { data = {}, headers = {} } = response || {};

      // 헤더에서 토큰 추출 (axios는 보통 소문자 키를 사용)
      const authHeader =
        headers["authorization"] ||
        headers.authorization ||
        headers.Authorization;
      let token = null;
      if (authHeader && typeof authHeader === "string") {
        if (authHeader.startsWith("Bearer ")) {
          token = authHeader.split(" ")[1];
        } else {
          // 일부 서버는 header 값에 토큰만 담아둘 수 있음
          token = authHeader;
        }
      }

      // 바디에서 토큰 추출 (여러 네이밍에 대응)
      if (!token) {
        token =
          data.token ||
          data.accessToken ||
          data.data?.token ||
          data.data?.accessToken ||
          null;
      }

      if (token) {
        // 로컬 스토리지 저장 및 axios 기본 헤더에 세팅
        localStorage.setItem("authToken", token);
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        // role에 따라 라우팅 (존재하지 않으면 기본 경로로)
        const role = data.role || data.data?.role || null;
        if (role === "ADMIN") {
          navigate("/admin");
        } else {
          navigate("/mainpage");
        }
      } else {
        alert("로그인에 실패했습니다: 서버에서 토큰을 반환하지 않았습니다.");
      }
    } catch (error) {
      // 에러 메시지 파싱을 더 안전하게 처리
      let errorMessage = "로그인에 실패했습니다.";

      if (error.response) {
        // 응답이 있는 경우: 서버에서 보낸 메시지 우선 사용
        const respData = error.response.data;
        try {
          if (typeof respData === "string") {
            const parsed = JSON.parse(respData);
            errorMessage = parsed.message || parsed.error || errorMessage;
          } else if (typeof respData === "object" && respData !== null) {
            errorMessage =
              respData.message ||
              respData.error ||
              respData.detail ||
              error.response.statusText ||
              errorMessage;
          } else {
            errorMessage = error.response.statusText || errorMessage;
          }
        } catch (parseErr) {
          // 파싱 실패 시 상태 코드에 따른 기본 메시지
          if (error.response.status === 401) {
            errorMessage = "이메일 또는 비밀번호가 일치하지 않습니다.";
          } else {
            errorMessage = error.response.statusText || errorMessage;
          }
        }
      } else if (error.request) {
        // 요청은 보냈지만 응답이 없는 경우 (네트워크/CORS)
        errorMessage = "서버에 연결할 수 없습니다. (네트워크 또는 CORS 문제)";
      } else {
        // 기타 설정 오류 등
        errorMessage = "요청 설정 오류: " + (error.message || "");
      }

      console.error("로그인 API 호출 에러:", error);
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleKakaoLogin = () => {
    // BASE_API_URL 끝의 슬래시 제거 후 안전하게 붙임
    const base = BASE_API_URL.replace(/\/+$/, "");
    const url = `${base}/oauth2/authorization/kakao`;
    window.location.href = url;
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
                  name="email"
                  type="email"
                  placeholder="이메일 주소를 입력해주세요"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
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
                  id="password"
                  name="password"
                  type="password"
                  placeholder="비밀번호를 입력해주세요"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
              </InputGroup>
            </FormGroup>

            <StyledButton type="submit" className="login" disabled={loading}>
              {loading ? "로그인 중..." : "로그인"}
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

/* ==================================================
  Styled Components (원본 유지)
================================================== */
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
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
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
