import React, { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import { MdOutlineEmail, MdLockOutline } from "react-icons/md";
import KakaoLogo from "@/assets/images/kakao.png";
import { useNavigate } from "react-router-dom";
import api from "@/api/index";
import { gsap } from "gsap";

const BASE_API_URL = import.meta.env.VITE_API_URL || "http://localhost:9000";

const Login = () => {
  const navigate = useNavigate();

  // GSAP에서 참조할 DOM 요소들
  const loginContainerRef = useRef(null);
  const titleSectionRef = useRef(null);
  const formCardRef = useRef(null);
  const kakaoButtonRef = useRef(null);
  const loginButtonRef = useRef(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // 컴포넌트 마운트 시 GSAP 애니메이션 실행 (GSAP 로직은 반응형과 독립적으로 유지)
  useEffect(() => {
    // GSAP Timeline 생성
    const tl = gsap.timeline({
      defaults: { duration: 0.8, ease: "power3.out" },
    });

    // 1. 배경
    gsap.fromTo(
      loginContainerRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 1, ease: "none" },
    );

    // 2. 제목 섹션 등장
    tl.from(titleSectionRef.current, { y: -50, opacity: 0, scale: 0.95 }, 0.1);

    // 3. 로그인 폼 카드 등장
    tl.from(
      formCardRef.current,
      { y: 50, opacity: 0, rotationX: 10, transformOrigin: "top center" },
      "-=0.5",
    );

    // 4. 입력 필드 및 버튼 등장
    gsap.from(
      formCardRef.current.querySelectorAll("h2, .form-group, button"),
      {
        opacity: 0,
        y: 10,
        stagger: 0.1,
        duration: 0.5,
        ease: "power2.out",
      },
      "-=0.3",
    );

    // 버튼 호버 애니메이션 설정
    const buttons = [loginButtonRef.current, kakaoButtonRef.current];
    buttons.forEach((btn) => {
      if (btn) {
        btn.onmouseenter = () => {
          gsap.to(btn, { scale: 1.03, duration: 0.3, ease: "power2.out" });
        };
        btn.onmouseleave = () => {
          gsap.to(btn, { scale: 1, duration: 0.3, ease: "power2.out" });
        };
      }
    });
  }, []);

  const handleSignUpClick = () => {
    gsap.to(loginContainerRef.current, {
      opacity: 0,
      duration: 0.5,
      onComplete: () => navigate("/signup"),
    });
  };

  // 로그인 제출 핸들러 함수
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (email.trim() === "" || password.trim() === "") {
      alert("이메일과 비밀번호를 입력해주세요.");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post(
        "/api/auth/login",
        { email, password },
        { withCredentials: true },
      );

      const { data = {}, headers = {} } = response || {};

      const authHeader =
        headers["authorization"] ||
        headers.authorization ||
        headers.Authorization;
      let token = null;
      if (authHeader && typeof authHeader === "string") {
        if (authHeader.startsWith("Bearer ")) {
          token = authHeader.split(" ")[1];
        } else {
          token = authHeader;
        }
      }
      if (!token) {
        token =
          data.token ||
          data.accessToken ||
          data.data?.token ||
          data.data?.accessToken ||
          null;
      }

      if (token) {
        localStorage.setItem("authToken", token);
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        const role = data.role || data.data?.role || null;
        const targetPath = role === "ADMIN" ? "/admin" : "/mainpage";

        gsap.to(loginContainerRef.current, {
          opacity: 0,
          duration: 0.5,
          onComplete: () => navigate(targetPath),
        });
      } else {
        alert("로그인에 실패했습니다: 서버에서 토큰을 반환하지 않았습니다.");
      }
    } catch (error) {
      let errorMessage = "로그인에 실패했습니다.";
      if (error.response) {
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
          if (error.response.status === 401) {
            errorMessage = "이메일 또는 비밀번호가 일치하지 않습니다.";
          } else {
            errorMessage = error.response.statusText || errorMessage;
          }
        }
      } else if (error.request) {
        errorMessage = "서버에 연결할 수 없습니다. (네트워크 또는 CORS 문제)";
      } else {
        errorMessage = "요청 설정 오류: " + (error.message || "");
      }

      console.error("로그인 API 호출 에러:", error);
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleKakaoLogin = () => {
    const base = BASE_API_URL.replace(/\/+$/, "");
    const url = `${base}/oauth2/authorization/kakao`;
    gsap.to(loginContainerRef.current, {
      opacity: 0,
      duration: 0.5,
      onComplete: () => (window.location.href = url),
    });
  };

  return (
    <LoginContainer ref={loginContainerRef}>
      <Contents>
        <TitleSection ref={titleSectionRef}>
          <MainTitle>
            학교생활 여기어때? <br />
            지금부터는 Fun!
          </MainTitle>
          <Subtitle>친구들과 소통하고, 포인트를 모아 혜택을 누리세요!</Subtitle>
        </TitleSection>

        <FormCard ref={formCardRef}>
          <FormTitle>로그인</FormTitle>
          <LoginForm onSubmit={handleSubmit}>
            <FormGroup className="form-group">
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

            <FormGroup className="form-group">
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

            <StyledButton
              ref={loginButtonRef}
              type="submit"
              className="login"
              disabled={loading}
            >
              {loading ? "로그인 중..." : "로그인"}
            </StyledButton>

            <StyledButton
              ref={kakaoButtonRef}
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

const LoginContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  width: 100%;
  background: var(--gradient-hero);
  padding: 20px;

  @media (max-width: 768px) {
    align-items: center;
    padding-top: 20px;
    padding-bottom: 20px;
  }
`;

const Contents = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0 auto;
  width: fit-content;

  @media (max-width: 768px) {
    width: 100%;
    padding: 0 10px;
  }
`;

const TitleSection = styled.div`
  margin-bottom: 46px;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);

  @media (max-width: 768px) {
    margin-bottom: 30px;
    text-align: center;
  }
`;

const MainTitle = styled.h1`
  font-size: 3.75rem;
  font-weight: bold;
  line-height: 1.3;
  margin-bottom: 10px;

  @media (max-width: 768px) {
    font-size: 2.2rem;
    line-height: 1.2;
  }
  @media (max-width: 480px) {
    font-size: 1.8rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1.25rem;
  text-align: center;
  font-weight: 500;

  @media (max-width: 768px) {
    font-size: 1rem;
  }
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

  @media (max-width: 768px) {
    padding: 25px;
    border-radius: 12px;
    max-width: 100%;
  }
`;

const FormTitle = styled.h2`
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 30px;
  color: var(--text-primary);
  text-align: center;

  @media (max-width: 768px) {
    font-size: 20px;
    margin-bottom: 20px;
  }
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

  @media (max-width: 768px) {
    height: 40px;
  }
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

  @media (max-width: 768px) {
    height: 50px;
    font-size: 1rem;
  }

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

  @media (max-width: 768px) {
    margin-top: 30px;
  }
`;

const KakaoLogoImage = styled.img`
  width: 34px;
  height: 34px;

  @media (max-width: 768px) {
    width: 30px;
    height: 30px;
  }
`;
