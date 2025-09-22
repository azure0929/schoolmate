import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainPage from "@/assets/pages/MainPage";
import Login from "@/assets/pages/Login";
import SignUp from "@/assets/pages/SignUp";
import PointShop from "@/assets/pages/PointShop";
import PointHistory from "@/assets/pages/PointHistory";
import Schedule from "@/assets/pages/Schedule";
import HealthCheck from "@/assets/pages/HealthCheck";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/main" element={<MainPage />} />
          <Route path="/pointshop" element={<PointShop />} />
          <Route path="/pointhistory" element={<PointHistory />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/healthcheck" element={<HealthCheck />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
