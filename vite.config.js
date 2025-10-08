import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// 백엔드 배포 주소 또는 로컬 주소를 여기에 설정.
const TARGET_API_URL = "https://schoolmate-44907742353.us-south1.run.app";
// 로컬 테스트 시: const TARGET_API_URL = "http://localhost:9000";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    // 💡 프록시 설정 추가
    proxy: {
      // 프론트엔드에서 '/api'로 시작하는 모든 요청을 백엔드로 포워딩
      "/api": {
        target: TARGET_API_URL, // 백엔드 서버 주소
        changeOrigin: true, // 호스트 헤더를 대상 URL에 맞게 변경
        secure: false, // 대상 서버가 HTTPS이지만 로컬에서 테스트할 경우 (필요 시)
      },
      "/oauth2": {
        target: TARGET_API_URL,
        changeOrigin: true,
        secure: false,
      },
      "/login/oauth2/code": {
        target: TARGET_API_URL,
        changeOrigin: true,
        secure: false,
      },
    },
  },
  resolve: {
    alias: [
      {
        find: "@",
        replacement: path.resolve(__dirname, "src"),
      },
    ],
  },
});
