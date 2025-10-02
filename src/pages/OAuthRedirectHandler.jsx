import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const OAuth2RedirectHandler = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const token = searchParams.get("token");
    // 백엔드에서 role 정보가 있다면 함께 파싱
    const role = searchParams.get("role"); // 백엔드에서 role을 함께 보낸다면 사용
    const tempToken = searchParams.get("tempToken"); // 임시 토큰 파싱
    const nickname = searchParams.get("nickname");
    const email = searchParams.get("email"); // 백엔드에서 email을 추가로 보냈을 경우

    // 1. 신규 회원: 임시 토큰(tempToken)이 있는지 최우선으로 확인
    if (tempToken) {
      console.log("소셜 계정 추가 정보 필요. 회원가입 페이지로 이동.");
      // /signup 페이지로 임시 토큰, 닉네임, 이메일을 들고 이동
      // (email은 백엔드 OAuth2SuccessHandler에서 추가했는지에 따라 선택적으로 사용)
      const redirectPath = `/signup?tempToken=${tempToken}&nickname=${nickname}&email=${email || ""}`;
      navigate(redirectPath, { replace: true });
    }
    // 2. 기존 회원: 최종 JWT(token)이 있는지 확인
    else if (token) {
      // 1. 토큰 저장
      localStorage.setItem("authToken", token);
      console.log("기존 회원 로그인 성공! 토큰 저장 완료.");

      // 2. 역할(role)에 따라 페이지 이동
      if (role === "ADMIN") {
        navigate("/admin", { replace: true });
      } else {
        navigate("/mainpage", { replace: true });
      }
    }
    // 3. 실패: 토큰도 임시 토큰도 없는 경우
    else {
      console.error("소셜 로그인 토큰을 찾을 수 없습니다. 로그인 실패.");
      alert("로그인에 실패했습니다. 다시 시도해주세요.");
      navigate("/", { replace: true });
    }
  }, [location, navigate]);

  // 화면에 아무것도 보여주지 않고, 로직만 처리한 뒤 바로 이동
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        fontSize: "1.2rem",
      }}
    >
      카카오 로그인 처리 중...
    </div>
  );
};

export default OAuth2RedirectHandler;
