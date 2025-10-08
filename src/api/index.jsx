import axios from "axios";

// 1. 기본 설정이 완료된 Axios 인스턴스 생성
const BASE_API_URL = import.meta.env.VITE_API_URL || "http://localhost:9000";

const api = axios.create({
  baseURL: BASE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// 2. 요청 인터셉터
//    - 앞으로 api.get, api.post 등 모든 요청을 보낼 때마다
//    - 자동으로 localStorage에서 토큰을 꺼내 헤더에 실어줍니다.
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default api; // 설정이 끝난 'api' 객체를 다른 파일에서 쓸 수 있도록 내보내기
