import React from "react";
import styled, { css } from "styled-components";
import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
} from "chart.js";

// Chart.js 필수 등록 요소
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
);

// --- 전역 색상 상수 --- (CommonStyles.js 대체)
const COLOR = {
  sidebarBg: "#2d2d2d",
  sidebarActive: "#d8383a",
  primaryBtn: "#303030",
  secondaryBtn: "#f0f0f0",
  primaryText: "#fff",
  secondaryText: "#a0a0a0",
  defaultText: "#333",
  border: "#e0e0e0",
  inputBg: "#f7f7f7",
  pointYellow: "#ffcc00",
  confirmBlue: "#1a73e8",
};

// --- 스타일드 컴포넌트: 공통 요소 (CommonStyles.js 대체) ---
const Button = styled.button`
  padding: 5px 10px;
  margin: 0 2px;
  border: none;
  cursor: pointer;
  border-radius: 4px;
  font-size: 12px;
  transition: background-color 0.2s;

  ${(props) =>
    props.$primary &&
    css`
      background-color: ${COLOR.pointYellow};
      color: ${COLOR.defaultText};
      &:hover {
        background-color: #e6b800;
      }
    `}
`;

// --- 스타일드 컴포넌트: 통계 관련 ---
const PageTitle = styled.h2`
  font-size: 24px;
  font-weight: normal;
  margin-bottom: 30px;
  border-bottom: 1px solid ${COLOR.border};
  padding-bottom: 10px;
`;

const ChartWrapper = styled.div`
  width: 100%;
  height: 300px;
  border: 1px solid ${COLOR.border};
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 30px;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 10px;

  ${Button} {
    padding: 8px 15px;
    margin-left: 5px;

    &:first-child {
      margin-left: 0;
    }
  }
`;

// --- 더미 데이터 ---
const chartData1 = {
  labels: ["January", "February", "March", "April", "May", "June", "July"],
  datasets: [
    {
      label: "Dataset 1",
      data: [-50, -60, -20, 0, -10, 70, 90],
      borderColor: "#d8383a",
      backgroundColor: "#d8383a",
      tension: 0.4,
      pointRadius: 5,
    },
    {
      label: "Dataset 2",
      data: [-70, 50, -10, 50, 0, 70, 20],
      borderColor: "#1a73e8",
      backgroundColor: "#1a73e8",
      tension: 0.4,
      pointRadius: 5,
    },
  ],
};

const chartOptions1 = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "top",
    },
    title: {
      display: false,
    },
  },
};

const chartData2 = {
  labels: [
    "29 Sep 2019",
    "30 Sep 2019",
    "01 Oct 2019",
    "03 Oct 2019",
    "04 Oct 2019",
    "05 Oct 2019",
  ],
  datasets: [
    {
      label: "Users",
      data: [50, 120, 80, 40, 90, 60],
      backgroundColor: "#ffb3ba",
    },
    {
      label: "My Users",
      data: [40, 105, 75, 30, 100, 50],
      backgroundColor: "#a0c4ff",
    },
  ],
};

const chartOptions2 = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "bottom",
    },
    title: {
      display: true,
      text: "Users vs My Users",
      position: "bottom",
      font: {
        size: 14,
      },
      padding: {
        top: 0,
        bottom: 5,
      },
    },
  },
  scales: {
    x: {
      stacked: false,
    },
    y: {
      stacked: false,
    },
  },
};

// --- 컴포넌트: 통계 관리 페이지 ---
const StatisticsManagement = () => {
  return (
    <>
      <PageTitle>통계 관리</PageTitle>

      {/* 누적/평균 포인트 적립/사용 내역 (Line Chart) */}
      <h3 style={{ marginBottom: "20px", fontWeight: "normal" }}>
        누적/평균 포인트 적립/사용 내역
      </h3>
      <ChartWrapper style={{ height: 350 }}>
        <Line data={chartData1} options={chartOptions1} />
      </ChartWrapper>

      {/* 일/주/월별 사용자 가입 수 (Bar Chart) */}
      <ButtonGroup>
        <Button $primary>일별</Button>
        <Button>주별</Button>
        <Button>월별</Button>
      </ButtonGroup>

      <ChartWrapper style={{ height: 400 }}>
        <Bar data={chartData2} options={chartOptions2} />
      </ChartWrapper>
    </>
  );
};

export default StatisticsManagement;
