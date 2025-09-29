import React, { useState, useMemo } from "react";
import Header from "@/components/common/Header";
import TopMenu from "@/components/mainpage/TopMenu";
import styled from "styled-components";

// 더미 데이터 (백엔드 연결 시 대체 예정)
const pointHistoryData = [
  {
    date: "25.08.01",
    type: "출석",
    details: "출석",
    point: 100,
    isDeduction: false,
  },
  {
    date: "25.08.02",
    type: "적립",
    details: "급식 사진 업로드",
    point: 300,
    isDeduction: false,
  },
  {
    date: "25.08.03",
    type: "출석",
    details: "출석",
    point: 100,
    isDeduction: false,
  },
  {
    date: "25.08.03",
    type: "적립",
    details: "급식 사진 업로드",
    point: 300,
    isDeduction: false,
  },
  {
    date: "25.08.04",
    type: "출석",
    details: "출석",
    point: 100,
    isDeduction: false,
  },
  {
    date: "25.08.04",
    type: "적립",
    details: "급식 사진 업로드",
    point: 300,
    isDeduction: false,
  },
  {
    date: "25.08.05",
    type: "출석",
    details: "출석",
    point: 100,
    isDeduction: false,
  },
  {
    date: "25.08.06",
    type: "출석",
    details: "출석",
    point: 100,
    isDeduction: false,
  },
  {
    date: "25.08.07",
    type: "출석",
    details: "출석",
    point: 100,
    isDeduction: false,
  },
  {
    date: "25.08.08",
    type: "출석",
    details: "출석",
    point: 100,
    isDeduction: false,
  },
  {
    date: "25.08.09",
    type: "출석",
    details: "출석",
    point: 100,
    isDeduction: false,
  },
  {
    date: "25.08.10",
    type: "출석",
    details: "출석",
    point: 100,
    isDeduction: false,
  },
  {
    date: "25.08.11",
    type: "출석",
    details: "출석",
    point: 100,
    isDeduction: false,
  },
  {
    date: "25.08.12",
    type: "차감",
    details: "상품 교환",
    point: -1500,
    isDeduction: true,
  }, // 차감 예시
  {
    date: "25.08.13",
    type: "출석",
    details: "출석",
    point: 100,
    isDeduction: false,
  },
  {
    date: "25.08.14",
    type: "출석",
    details: "출석",
    point: 100,
    isDeduction: false,
  },
  {
    date: "25.08.15",
    type: "출석",
    details: "출석",
    point: 100,
    isDeduction: false,
  },
  {
    date: "25.08.16",
    type: "출석",
    details: "출석",
    point: 100,
    isDeduction: false,
  },
  {
    date: "25.08.17",
    type: "출석",
    details: "출석",
    point: 100,
    isDeduction: false,
  },
  {
    date: "25.08.18",
    type: "출석",
    details: "출석",
    point: 100,
    isDeduction: false,
  },
  {
    date: "25.08.19",
    type: "출석",
    details: "출석",
    point: 100,
    isDeduction: false,
  },
  {
    date: "25.08.20",
    type: "출석",
    details: "출석",
    point: 100,
    isDeduction: false,
  },
  {
    date: "25.08.21",
    type: "출석",
    details: "출석",
    point: 100,
    isDeduction: false,
  },
  {
    date: "25.08.22",
    type: "출석",
    details: "출석",
    point: 100,
    isDeduction: false,
  },
  {
    date: "25.08.23",
    type: "출석",
    details: "출석",
    point: 100,
    isDeduction: false,
  },
];

const tabs = [
  { key: "all", name: "전체" },
  { key: "credit", name: "적립" },
  { key: "debit", name: "차감" },
];

const PointHistory = () => {
  const [activeTab, setActiveTab] = useState("all");

  const filteredHistory = useMemo(() => {
    switch (activeTab) {
      case "credit":
        // isDeduction이 false이고 point가 양수인 경우 (적립 및 출석으로 간주)
        return pointHistoryData.filter(
          (item) => !item.isDeduction && item.point > 0,
        );
      case "debit":
        // isDeduction이 true인 경우 (차감으로 간주)
        return pointHistoryData.filter((item) => item.isDeduction);
      case "all":
      default:
        return pointHistoryData;
    }
  }, [activeTab]);

  return (
    <PointHistoryWrap>
      <Header />
      <TopMenu />
      <div className="user-point">
        <span>사용가능한 포인트</span>
        <p className="point">
          <span>13,000</span>P
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
          {filteredHistory.map((item, index) => (
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
                {item.isDeduction
                  ? item.point.toLocaleString()
                  : `+${item.point.toLocaleString()}`}
                <span style={{ color: "#191919" }}>P</span>
              </p>
            </li>
          ))}
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
      font-weight: 500; /* medium */
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
