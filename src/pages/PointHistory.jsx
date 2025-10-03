import React, { useState, useMemo, useEffect } from "react";
import TopMenu from "@/components/mainpage/TopMenu";
import styled from "styled-components";
import axios from "axios";

const BASE_API_URL =
  import.meta.env.REACT_APP_API_URL || "http://localhost:9000";

const api = axios.create({
  baseURL: BASE_API_URL,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

const useAuth = () => {
  const token = localStorage.getItem("authToken");
  // 토큰이 존재하면 인증된 것으로 간주
  const isAuthenticated = !!token;
  return { isAuthenticated };
};

const mapHistoryItem = (item) => {
  // 서버 DTO 구조를 기반으로 필드를 매핑. (PointHistoryRes 기반)
  const isDeduction = item.amount < 0;
  const pointValue = Math.abs(item.amount);

  let type, details;
  switch (
    item.tsType // tsType: EARN, EXCHANGE 등
  ) {
    case "EARN":
      type = "적립";
      details = item.refType || "포인트 적립"; // refType: 급식 사진 업로드 등
      break;
    case "EXCHANGE":
      type = "차감";
      details = "상품 교환";
      break;
    default:
      type = item.amount > 0 ? "적립" : "차감";
      details = item.refType || "기타 거래";
      break;
  }

  // yyyy-MM-ddTHH:mm:ss 형식의 createdAt을 'YY.MM.DD' 형식으로 변환
  const dateObj = new Date(item.createdAt);

  // Date 객체에서 연, 월, 일 추출
  const year = dateObj.getFullYear().toString().slice(-2); // 2025 -> 25
  const month = (dateObj.getMonth() + 1).toString().padStart(2, "0"); // 8 -> 08
  const day = dateObj.getDate().toString().padStart(2, "0"); // 4 -> 04

  // 'YY.MM.DD' 형식으로 조합
  const date = `${year}.${month}.${day}`;

  return {
    date: date,
    type: type,
    details: details,
    point: pointValue, // 절대값
    isDeduction: isDeduction,
  };
};

const tabs = [
  { key: "all", name: "전체" },
  { key: "credit", name: "적립" },
  { key: "debit", name: "차감" },
];

const PointHistory = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [historyData, setHistoryData] = useState([]);
  const [currentBalance, setCurrentBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // 인증 상태 사용
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      // PointHistoryController의 @RequestMapping("/api/point-history") 경로
      const API_BASE_PATH = "/api/point-history/student";

      try {
        if (!isAuthenticated) {
          throw new Error("페이지를 보기 위해 로그인이 필요합니다.");
        }

        // 1. 보유 포인트 잔액 조회 (GET /api/point-history/student/me/balance)
        const balanceRes = await api.get(`${API_BASE_PATH}/me/balance`);
        setCurrentBalance(balanceRes.data);

        // 2. 포인트 거래 내역 조회 (GET /api/point-history/student/{email})
        const historyRes = await api.get(`${API_BASE_PATH}/me`);

        // 3. 응답 유효성 검사 및 변환
        if (Array.isArray(historyRes.data)) {
          // 최신순으로 정렬되었으므로 그대로 사용
          const mappedData = historyRes.data.map(mapHistoryItem);
          setHistoryData(mappedData);
        } else {
          console.error(
            "History API 응답이 유효한 배열 형식이 아닙니다:",
            historyRes.data,
          );
          throw new Error("거래 내역 데이터를 불러올 수 없습니다.");
        }
      } catch (err) {
        if (!isAuthenticated) {
          setError("로그인이 필요합니다.");
        } else if (
          axios.isAxiosError(err) &&
          err.response &&
          err.response.status === 401
        ) {
          setError(
            "인증 정보가 만료되었거나 유효하지 않습니다. 다시 로그인해 주세요.",
          );
          localStorage.removeItem("authToken");
        } else if (
          axios.isAxiosError(err) &&
          err.response &&
          err.response.status === 404
        ) {
          setError(
            "API 경로 오류 또는 학생 정보가 없습니다. (백엔드 경로 점검 필요)",
          );
        } else {
          setError(err.message || "포인트 데이터를 불러오는 데 실패했습니다.");
        }
        console.error("API Fetch Error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated]); // 인증 상태가 변경될 때마다 실행

  // 탭별 필터링 로직
  const filteredHistory = useMemo(() => {
    switch (activeTab) {
      case "credit":
        // isDeduction이 false인 경우 (적립으로 간주)
        return historyData.filter((item) => !item.isDeduction);
      case "debit":
        // isDeduction이 true인 경우 (차감으로 간주)
        return historyData.filter((item) => item.isDeduction);
      case "all":
      default:
        return historyData;
    }
  }, [activeTab, historyData]);

  if (isLoading) {
    return <PointHistoryWrap>데이터 로딩 중...</PointHistoryWrap>;
  }

  if (error) {
    return (
      <PointHistoryWrap>
        <TopMenu />
        <div className="user-point" style={{ color: "red", marginTop: "80px" }}>
          {error}
        </div>
      </PointHistoryWrap>
    );
  }

  return (
    <PointHistoryWrap>
      <TopMenu />
      <div className="user-point">
        <span>사용가능한 포인트</span>
        <p className="point">
          <span>{currentBalance.toLocaleString()}</span>P
        </p>
      </div>
      <PointInfo>
        <ul className="tabs">
          {tabs.map((tab) => (
            <li
              key={tab.key}
              className={`tab ${activeTab === tab.key ? "active" : ""}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.name}
            </li>
          ))}
        </ul>
        <ul className="point-infos">
          {filteredHistory.length === 0 ? (
            <li
              className="point-info-item"
              style={{
                justifyContent: "center",
                color: "#888",
                border: "none",
              }}
            >
              {activeTab === "all"
                ? "거래 내역이 없습니다."
                : "해당 내역이 없습니다."}
            </li>
          ) : (
            filteredHistory.map((item, index) => (
              <li key={index} className="point-info-item">
                <span className="date">{item.date}</span>
                <span
                  className={`details ${item.isDeduction ? "deduction" : "credit"}`}
                >
                  {item.details}
                </span>
                <p
                  className={`point-value ${item.isDeduction ? "deduction" : "credit"}`}
                >
                  {/* 차감 금액은 이미 절대값이며, 앞에 '-' */}
                  {item.isDeduction
                    ? `-${item.point.toLocaleString()}`
                    : `+${item.point.toLocaleString()}`}
                  <span style={{ color: "#191919" }}>P</span>
                </p>
              </li>
            ))
          )}
        </ul>
      </PointInfo>
    </PointHistoryWrap>
  );
};

export default PointHistory;

const PointHistoryWrap = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 120px;
  .user-point {
    margin-top: 80px;
    > span {
      font-size: 1.875rem; /* 약 30px */
      font-weight: 500;
    }
    .point {
      margin-top: 30px;
      font-size: 3.75rem; /* 60px */
      font-weight: bold;
      span {
        color: var(--primary-color);
      }
    }
  }
`;

const PointInfo = styled.div`
  width: 100%;
  max-width: 1200px;
  margin-top: 50px;
  padding: 0 20px;

  .tabs {
    display: flex;
    justify-content: flex-start;
    padding: 0;
    list-style: none;
    margin-bottom: 20px;

    .tab {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 110px;
      height: 52px;
      border-radius: 30px;
      margin-right: 10px;
      cursor: pointer;
      background-color: #f0f0f0; /* 비활성 탭 배경색 */
      font-size: 1.5rem; /* 24px */
      font-weight: medium;
      transition: all 0.2s ease-in-out;

      &:last-child {
        margin-right: 0;
      }

      &.active {
        background-color: var(--secondary-color);
        color: var(--text-color);
      }
    }
  }

  .point-infos {
    list-style: none;
    padding: 0;
    .point-info-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 15px 0;
      border-bottom: 1px solid #eee;

      .date {
        font-size: 1.125rem; /* 18px */
        color: #888;
        flex-basis: 5%;
      }

      .details {
        font-size: 1.5rem; /* 24px */
        font-weight: 500;
        flex-basis: 50%;
        text-align: left;
      }

      .point-value {
        font-size: 1.5rem; /* 24px */
        font-weight: medium;
        flex-basis: 30%;
        text-align: right;

        &.credit {
          // 적립일 때
          color: var(--primary-color);
        }
        &.deduction {
          // 차감일 때
          color: var(--primary-color);
        }
      }
    }
  }
`;
