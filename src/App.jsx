import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import React, { useEffect } from "react"; // useEffect 추가
import MainPage from "@/pages/MainPage";
import Login from "@/pages/Login";
import SignUp from "@/pages/SignUp";
import PointShop from "@/pages/PointShop";
import PointHistory from "@/pages/PointHistory";
import Schedule from "@/pages/Schedule";
import MyPage from "@/pages/MyPage";
import Admin from "@/pages/admin/Admin";
import OAuth2RedirectHandler from "@/pages/OAuthRedirectHandler";

// 인증이 필요한 라우트를 감싸는 컴포넌트 (AuthGuard 역할)
const ProtectedRoute = ({ children }) => {
  const navigate = useNavigate();
  const token = localStorage.getItem("authToken"); // 또는 SignUp에서 사용하는 "token" 이름 확인

  useEffect(() => {
    if (!token) {
      // 토큰이 없으면 로그인 페이지로 강제 이동
      alert("로그인이 필요합니다."); // 사용자에게 안내
      navigate("/", { replace: true }); // replace: true를 사용하여 뒤로 가기 방지
    }
  }, [token, navigate]);

  return token ? children : null; // 토큰이 있을 때만 자식 컴포넌트 렌더링
};

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/oauth-redirect" element={<OAuth2RedirectHandler />} />
          <Route path="/signup" element={<SignUp />} />
          <Route
            path="/mainpage"
            element={
              <ProtectedRoute>
                <MainPage />
              </ProtectedRoute>
            }
          />
          <Route path="/pointshop" element={<PointShop />} />
          <Route path="/pointhistory" element={<PointHistory />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/mypage" element={<MyPage />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
