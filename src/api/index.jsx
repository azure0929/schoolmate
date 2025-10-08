import axios from "axios";

// 1. 기본 설정이 완료된 Axios 인스턴스 생성
const api = axios.create({
<<<<<<< Updated upstream
  baseURL: "http://localhost:9000/api", // 기본 서버 주소
=======
  baseURL: import.meta.env.MODE === "development" ? "/api" : BASE_API_URL,
>>>>>>> Stashed changes
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
  }
);

export default api; // 설정이 끝난 'api' 객체를 다른 파일에서 쓸 수 있도록 내보내기