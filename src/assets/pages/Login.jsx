import React from "react";
import Header from "@/assets/components/Header";
import styled from "styled-components";
import { MdOutlineEmail, MdLockOutline } from "react-icons/md";
import KakaoLogo from "@/assets/images/kakao.png";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();

  const handleSignUpClick = () => {
    navigate("/signup");
  };

  return (
    <LoginContainer>
      <Header />
      <Contents>
        <TitleSection>
          <MainTitle>
            학교생활 여기어때? <br />
            지금부터는 Fun!
          </MainTitle>
          <Subtitle>친구들과 소통하고, 포인트를 모아 혜택을 누리세요!</Subtitle>
        </TitleSection>

        <LoginForm>
          <InputGroup>
            <Icon>
              <MdOutlineEmail />
            </Icon>
            <StyledInput type="email" placeholder="이메일" />
          </InputGroup>

          <InputGroup>
            <Icon>
              <MdLockOutline />
            </Icon>
            <StyledInput type="password" placeholder="비밀번호" />
          </InputGroup>

          <StyledButton type="submit" className="login">
            로그인
          </StyledButton>
          <StyledButton type="button" className="kakao">
            <KakaoLogoImage src={KakaoLogo} alt="카카오 로고" />
            카카오 로그인
          </StyledButton>
        </LoginForm>

        <LinkContainer onClick={handleSignUpClick}>회원가입</LinkContainer>
      </Contents>
    </LoginContainer>
  );
};

export default Login;

// 로그인 페이지 스타일
const LoginContainer = styled.div`
  height: 100vh;
`;

const Contents = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0 auto;
  margin-top: 120px;
  width: fit-content;
`;

const TitleSection = styled.div`
  margin-bottom: 46px;
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

const InputGroup = styled.div`
  position: relative;
  margin-bottom: 20px;
  border: 1px solid #ddd;
  border-radius: 5px;
  display: flex;
  align-items: center;
  padding: 10px;
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
