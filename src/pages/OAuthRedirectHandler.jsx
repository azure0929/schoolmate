// src/pages/OAuthRedirectHandler.jsx

import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const OAuth2RedirectHandler = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // 1. URL에서 'token'이라는 이름의 파라미터를 찾습니다.
    const searchParams = new URLSearchParams(location.search);
    const token = searchParams.get("token");

    if (token) {
      // 2. 토큰이 있다면, localStorage에 저장합니다.
      localStorage.setItem("authToken", token);
      console.log("소셜 로그인 토큰 저장 성공!");

      // 3. 저장이 끝나면, 메인 페이지로 사용자를 보냅니다.
      navigate("/mainpage");
    } else {
      // 토큰이 없다면, 에러 메시지를 보여주고 로그인 페이지로 보냅니다.
      console.error("소셜 로그인 토큰을 찾을 수 없습니다.");
      alert("로그인에 실패했습니다. 다시 시도해주세요.");
      navigate("/");
    }
  }, [location, navigate]);

  // 이 페이지는 화면에 아무것도 보여주지 않고, 로직만 처리한 뒤 바로 이동합니다.
  return <div>로그인 처리 중...</div>;
};

export default OAuth2RedirectHandler;
