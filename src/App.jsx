import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainPage from "@/pages/MainPage";
import Login from "@/pages/Login";
import SignUp from "@/pages/SignUp";
import PointShop from "@/pages/PointShop";
import PointHistory from "@/pages/PointHistory";
import Schedule from "@/pages/Schedule";
import MyPage from "@/pages/MyPage";
import Admin from "@/pages/admin/Admin";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/mainpage" element={<MainPage />} />
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
