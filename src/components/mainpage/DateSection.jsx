import React, { useState, useEffect, useCallback, useRef } from "react";
import styled from "styled-components";
import AttendanceConfirmModal from "@/components/modals/AttendanceConfirmModal";
import api from "@/api/index";
import ToastNotification from "@/components/modals/ToastNotification";

const BALANCE_API_PATH = "/api/point-history/student/me/balance";
const ATTENDANCE_CHECK_API_PATH = "/api/attend/student/me/check";
const ATTENDANCE_POINT_AMOUNT = 500;
const TRANSACTION_TYPE_ATTENDANCE = "ATTENDANCE_DAILY";

const today = new Date();
const currentYear = today.getFullYear();
const currentMonth = today.getMonth() + 1;
const currentDay = today.getDate();
const checkDate = `${currentYear}-${String(currentMonth).padStart(2, "0")}-${String(currentDay).padStart(2, "0")}`;

function DatePointSection() {
  const [currentPoints, setCurrentPoints] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const toastRef = useRef(null);

  // showToast 유틸리티 함수 정의
  const showToast = (message, type = "success") => {
    if (toastRef.current) {
      toastRef.current.showToast(message, type);
    }
  };

  // 1. 포인트 잔액 조회 함수 (재사용을 위해 useCallback 사용)
  const fetchPointBalance = useCallback(async () => {
    if (!localStorage.getItem("authToken")) {
      // 로그인 필요 시 토스트 알림
      showToast("로그인이 필요합니다.", "error");
      setError("로그인이 필요합니다.");
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await api.get(BALANCE_API_PATH);
      setCurrentPoints(response.data);
      setError(null);
    } catch (err) {
      console.error("포인트 잔액 조회 실패:", err);
      // 잔액 조회 실패 시 토스트 알림
      showToast("잔액 조회 실패", "error");
      setError("잔액 조회 실패");
    } finally {
      setLoading(false);
    }
  }, []);

  // 컴포넌트 로드 시 잔액 조회
  useEffect(() => {
    fetchPointBalance();
  }, [fetchPointBalance]);

  // 2. 출석체크 API 호출 및 잔액 업데이트 로직
  const handleAttendanceConfirm = async () => {
    setIsModalOpen(false); // 모달 닫기
    // setLoading(true); // 잔액 새로고침에서 로딩을 처리하므로 여기서는 제거

    const requestBody = {
      amount: ATTENDANCE_POINT_AMOUNT,
      tsType: TRANSACTION_TYPE_ATTENDANCE,
      transactionDate: checkDate,
    };

    try {
      // POST 요청으로 500포인트 지급 내역 기록
      await api.post(ATTENDANCE_CHECK_API_PATH, requestBody);

      // 성공 알림은 모달이 닫히면서 호출되는 showToast에서 처리됩니다.
      // 포인트 지급 후, 잔액을 새로고침하여 즉시 반영
      await fetchPointBalance();
      // 실패 알림은 여기서 직접 showToast 호출
      showToast(`출석체크가 완료되었습니다! +500P", "success"`);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "이미 출석했습니다.";

      // 실패 알림은 여기서 직접 showToast 호출
      showToast(`출석체크 실패: ${errorMessage}`, "error");
      setLoading(false);
    }
  };

  const formattedPoints =
    currentPoints !== null ? currentPoints.toLocaleString() + "P" : "...";

  const isInitialLoading = currentPoints === null && loading;

  return (
    <>
      {/* CustomAlert 대신 ToastNotification 렌더링 및 ref 연결 */}
      <ToastNotification ref={toastRef} />

      <DatePointWrapper>
        <PointInfo>
          <span>포인트:</span>
          <PointText>
            {isInitialLoading ? "로딩 중..." : error ? "오류" : formattedPoints}
          </PointText>
        </PointInfo>

        {/* 출석체크 버튼: 클릭 시 모달 열기 */}
        <AttendanceButton
          onClick={() => setIsModalOpen(true)}
          disabled={loading || error}
        >
          출석체크 (+{ATTENDANCE_POINT_AMOUNT}P)
        </AttendanceButton>
      </DatePointWrapper>

      {/* 모달 조건부 렌더링 */}
      {isModalOpen && (
        <AttendanceConfirmModal
          onConfirm={handleAttendanceConfirm}
          onCancel={() => setIsModalOpen(false)}
          // 모달에 toastRef prop을 전달 ( showAlert 대신)
          toastRef={toastRef}
        />
      )}
    </>
  );
}

export default DatePointSection;

const DatePointWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 10px 0 20px 0;
`;

const PointInfo = styled.div`
  display: flex;
  align-items: center;
  font-size: 14px;
  margin-right: 15px;
`;

const PointText = styled.span`
  font-weight: 700;
  color: #e91e63;
  margin-left: 5px;
`;

const AttendanceButton = styled.button`
  background-color: #e91e63;
  color: white;
  border: none;
  padding: 8px 18px;
  border-radius: 20px;
  cursor: pointer;
  font-weight: 500;
  font-size: 14px;
  transition: background-color 0.2s;
  box-shadow: 0 2px 5px rgba(233, 30, 99, 0.2);

  &:hover:not(:disabled) {
    background-color: #d81b60;
  }
  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;
