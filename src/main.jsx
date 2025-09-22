// import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "@/assets/css/font.css";
import "@/assets/css/global.css";

createRoot(document.getElementById("root")).render(
  // StrickMode 임시 주석 처리
  <>
    <App />
  </>,
);
