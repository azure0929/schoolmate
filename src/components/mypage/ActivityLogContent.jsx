import React, { useState, useEffect, useCallback } from "react";
import styled from "styled-components";
import axios from "axios";
import PaginationControls from "@/components/common/PaginationControls";

const BASE_URL = "http://localhost:9000/api";
const ATTENDANCE_COUNT_API = "/attend/student/me/count";

const ActivityLogContent = () => {
  const [pointBalance, setPointBalance] = useState(0);
  const [usedPoints, setUsedPoints] = useState(0);
  const [exchangeList, setExchangeList] = useState([]);
  const [mealCount, setMealCount] = useState(0);
  const [attendanceDays, setAttendanceDays] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    const authToken = localStorage.getItem("authToken");

    const config = {
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
    };

    if (!authToken) {
      console.error("인증 토큰이 없습니다. 로그인이 필요합니다.");
      setIsLoading(false);
      return;
    }

    try {
      const [
        balanceRes,
        mealCountRes,
        usedPointsRes,
        exchangeRes,
        attendanceCountRes,
      ] = await Promise.all([
        axios.get(`${BASE_URL}/point-history/student/me/balance`, config),
        axios.get(`${BASE_URL}/point-history/student/me/meal-count`, config),
        axios.get(`${BASE_URL}/point-history/student/me/used-points`, config),

        // 교환 목록 API
        axios.get(
          `${BASE_URL}/exchanges/my-exchanges?page=${currentPage}&size=6&sort=exchangeDate,desc`,
          config,
        ),

        // 출석 일 수 API
        axios.get(`${BASE_URL}${ATTENDANCE_COUNT_API}`, config),
      ]);

      setPointBalance(balanceRes.data);
      setMealCount(mealCountRes.data);
      setUsedPoints(usedPointsRes.data);
      setAttendanceDays(attendanceCountRes.data || 0); // 출석 일 수 상태 업데이트

      const pageData = exchangeRes.data;
      setTotalPages(pageData.totalPages);

      const formattedList = pageData.content.map((item) => {
        const product = item.product || {};

        const formatDate = (dateString) => {
          if (!dateString) return "N/A";
          return new Date(dateString)
            .toISOString()
            .split("T")[0]
            .replace(/-/g, ".");
        };

        const exchangedDate = formatDate(item.exchangeDate);
        const usedDate = formatDate(item.usedDate);

        let productExpirationDate = "N/A";
        let expirationDateObject = null;

        if (item.exchangeDate) {
          expirationDateObject = new Date(item.exchangeDate);
          // 교환일자에 12개월을 더한다.
          expirationDateObject.setFullYear(
            expirationDateObject.getFullYear() + 1,
          );

          // 한국 시간 포맷으로 YYYY.MM.DD 형식으로 변경
          productExpirationDate = expirationDateObject
            .toLocaleDateString("ko-KR", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
            })
            // "YYYY. MM. DD." 형태에서 공백을 제거하고 마지막 점 제거 -> "YYYY.MM.DD"
            .replace(/\s/g, "")
            .slice(0, -1);
        }

        const productPoints = product.productPoints || 0;
        const productName = product.productName || "알 수 없는 상품";
        const imageUrl = product.imageUrl || null;

        let status = "unused";
        const now = new Date();

        // 상태 결정 로직 (유효기간 계산을 새롭게 적용)
        if (item.usedDate) {
          status = "used";
        } else if (expirationDateObject && expirationDateObject < now) {
          status = "unused";
        } else if (expirationDateObject) {
          // 7일(7 * 24 * 60 * 60 * 1000ms) 이내로 남았는지 확인
          const sevenDaysInFuture = new Date(
            now.getTime() + 7 * 24 * 60 * 60 * 1000,
          );

          if (expirationDateObject < sevenDaysInFuture) {
            status = "unused_imminent"; // 미사용 (임박)
          } else {
            status = "unused"; // 미사용
          }
        }

        return {
          id: item.productExchangeId,
          name: productName,
          point: `${new Intl.NumberFormat().format(productPoints)}P`,
          expirationDate: productExpirationDate,
          exchangedDate: exchangedDate,
          usedDate: usedDate,
          status: status,
          imageUrl: imageUrl,
        };
      });
      setExchangeList(formattedList);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        console.error(
          "API 호출 실패:",
          error.response.status,
          error.response.data,
        );
      } else {
        console.error("활동 기록 데이터 패칭 중 오류 발생:", error);
      }
      setPointBalance(0);
      setMealCount(0);
      setUsedPoints(0);
      setAttendanceDays(0);
      setExchangeList([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handlePageChange = (page) => {
    setCurrentPage(page - 1);
  };

  if (isLoading) {
    return <Placeholder>데이터를 불러오는 중입니다...</Placeholder>;
  }

  return (
    <ActivityLogWrap>
      <SummarySection>
        <SummaryItem>
          <Label>출석 일수:</Label>
          <Value>{attendanceDays.toLocaleString()}</Value>
        </SummaryItem>
        <SummaryItem>
          <Label>급식 사진 업로드 수:</Label>
          <Value>{mealCount.toLocaleString()}</Value>
        </SummaryItem>
        <SummaryItem>
          <Label>사용 가능한 포인트:</Label>
          <Value>{pointBalance.toLocaleString()}P</Value>
        </SummaryItem>
        <SummaryItem>
          <Label>사용한 포인트:</Label>
          <Value>{usedPoints.toLocaleString()}P</Value>
        </SummaryItem>
      </SummarySection>

      <SectionTitle>교환한 상품</SectionTitle>

      <ExchangeList>
        {exchangeList.length > 0 ? (
          exchangeList.map((item) => (
            <ExchangeItem key={item.id}>
              {item.imageUrl ? (
                <ItemImage src={item.imageUrl} alt={item.name} />
              ) : (
                <PlaceholderImage />
              )}

              <ItemDetails>상품명: {item.name}</ItemDetails>
              <ItemDetails>포인트: {item.point}</ItemDetails>
              <ItemDetails>유효기간: {item.expirationDate}</ItemDetails>
              <ItemDetails>교환일자: {item.exchangedDate}</ItemDetails>
              <ItemDetails>사용일자: {item.usedDate}</ItemDetails>
              <ItemStatus $status={item.status}>
                {item.status === "used"
                  ? "사용 완료"
                  : item.status === "unused_imminent"
                    ? "미사용 (임박)"
                    : "미사용"}
              </ItemStatus>
            </ExchangeItem>
          ))
        ) : (
          <Placeholder>교환한 상품이 없습니다.</Placeholder>
        )}
      </ExchangeList>

      <PaginationControls
        currentPage={currentPage + 1}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </ActivityLogWrap>
  );
};

export default ActivityLogContent;

const Placeholder = styled.div`
  padding: 50px;
  text-align: center;
  color: #999;
`;

const SectionTitle = styled.h3`
  font-size: 1.875rem;
  font-weight: 700;
  margin-bottom: 25px;
  text-align: left;
`;

const ActivityLogWrap = styled.div`
  padding-top: 20px;
`;

const SummarySection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 0;
  margin-bottom: 40px;
  border-bottom: 1px solid #d9d9d9;
`;

const SummaryItem = styled.div`
  display: flex;
  align-items: baseline;
`;

const Label = styled.span`
  color: #333;
  font-size: 1.125rem;
  min-width: auto;
  margin-right: 10px;
  font-weight: 500;
`;

const Value = styled.span`
  font-size: 1.625rem;
  font-weight: 700;
  color: var(--primary-color, #ff6b6b);
`;

const ExchangeList = styled.ul`
  list-style: none;
  padding: 0;
`;

const ExchangeItem = styled.li`
  display: flex;
  align-items: center;
  padding: 15px 0;
  border-bottom: 1px solid #eee;
`;

const ItemImage = styled.img`
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
  margin-right: 20px;
  border: 1px solid #eee;
`;

const PlaceholderImage = styled.div`
  width: 80px;
  height: 80px;
  background-color: #f0f0f0;
  border-radius: 8px;
  margin-right: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #aaa;
  font-size: 0.8rem;
`;

const ItemDetails = styled.span`
  flex-grow: 1;
`;

const ItemStatus = styled.span`
  font-size: 1rem;
  font-weight: 500;
  min-width: 90px;
  text-align: right;

  color: ${(props) => {
    switch (props.$status) {
      case "used":
        return "#999";
      case "unused_imminent":
        return "#ff6b6b";
      case "unused":
        return "#007bff";
      default:
        return "#333";
    }
  }};
`;
