import React, { useState, useEffect, useCallback, useRef } from "react";
import styled from "styled-components";
import axios from "axios";
import PaginationControls from "@/components/common/PaginationControls";
import gsap from "gsap";

const VITE_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:9000";
const BASE_URL = `${VITE_BASE_URL}`;
const ATTENDANCE_COUNT_API = "/api/attend/student/me/count";

const ActivityLogContent = () => {
  const [pointBalance, setPointBalance] = useState(0);
  const [usedPoints, setUsedPoints] = useState(0);
  const [exchangeList, setExchangeList] = useState([]);
  const [mealCount, setMealCount] = useState(0);
  const [attendanceDays, setAttendanceDays] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // ⭐️ GSAP Ref 추가
  const wrapRef = useRef(null);
  const summaryRef = useRef(null);
  const titleRef = useRef(null);
  const listRef = useRef(null);

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
        axios.get(`${BASE_URL}/api/point-history/student/me/balance`, config),
        axios.get(
          `${BASE_URL}/api/point-history/student/me/meal-count`,
          config,
        ),
        axios.get(
          `${BASE_URL}/api/point-history/student/me/used-points`,
          config,
        ),

        // 교환 목록 API
        axios.get(
          `${BASE_URL}/api/exchanges/my-exchanges?page=${currentPage}&size=6&sort=exchangeDate,desc`,
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
          // 날짜 객체를 생성하고 YYYY.MM.DD 형식으로 포맷팅
          return new Date(dateString)
            .toLocaleDateString("ko-KR", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
            })
            .replace(/\s/g, "")
            .slice(0, -1); // 마지막 마침표 제거
        };

        const exchangedDate = formatDate(item.exchangeDate);
        const usedDate = item.usedDate ? formatDate(item.usedDate) : "N/A";

        let productExpirationDate = "N/A";
        let expirationDateObject = null;

        if (item.exchangeDate) {
          expirationDateObject = new Date(item.exchangeDate);
          // 교환일자에 12개월을 더한다.
          expirationDateObject.setFullYear(
            expirationDateObject.getFullYear() + 1,
          );

          // 유효기간 날짜 포맷팅
          productExpirationDate = expirationDateObject
            .toLocaleDateString("ko-KR", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
            })
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
          status = "expired"; // ⭐️ 상태 추가: 만료됨
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

  useEffect(() => {
    // isLoading이 false일 때만 실행
    if (!isLoading) {
      const ctx = gsap.context(() => {
        const tl = gsap.timeline({
          defaults: { duration: 0.7, ease: "power2.out" },
        });

        // 1. 전체 랩퍼와 요약 섹션 페이드인
        // listRef.current 자체를 초기 숨김 대상에 포함합니다.
        gsap.set([summaryRef.current, titleRef.current, listRef.current], {
          opacity: 1,
          y: 30,
        });

        tl.to(summaryRef.current, { opacity: 1, y: 0 }, 0.1);
        tl.to(titleRef.current, { opacity: 1, y: 0 }, 0.2);

        // 2. 교환 목록 Staggered 진입
        const listItems = gsap.utils.toArray(listRef.current.children);

        // 목록이 있고, 첫 번째 자식이 ExchangeItem(li)일 경우 Staggered 애니메이션 적용
        // (Placeholder는 ul의 자식으로 바로 들어가지 않을 수 있지만, 안전하게 li를 확인합니다.)
        if (
          listItems.length > 0 &&
          listItems[0].tagName.toLowerCase() === "li"
        ) {
          tl.to(
            listItems,
            {
              opacity: 1,
              y: 0,
              stagger: 0.08,
              duration: 0.5,
            },
            0.3,
          );
        } else {
          // 목록이 비어있거나 Placeholder만 있는 경우: listRef 컨테이너 자체를 애니메이션
          tl.to(listRef.current, { opacity: 1, y: 0, duration: 0.5 }, 0.3);
        }
      }, wrapRef);

      return () => ctx.revert();
    }
  }, [isLoading, exchangeList]);

  const handlePageChange = (page) => {
    // 페이지네이션은 1부터 시작하므로 API 요청 시 0부터 시작하도록 -1 처리
    setCurrentPage(page - 1);
  };

  if (isLoading) {
    return <Placeholder>데이터를 불러오는 중입니다...</Placeholder>;
  }

  return (
    <ActivityLogWrap ref={wrapRef}>
      <SummarySection ref={summaryRef}>
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

      <SectionTitle ref={titleRef}>교환한 상품</SectionTitle>

      <ExchangeList ref={listRef}>
        {exchangeList.length > 0 ? (
          exchangeList.map((item) => (
            <ExchangeItem key={item.id}>
              {item.imageUrl ? (
                <ItemImage src={item.imageUrl} alt={item.name} />
              ) : (
                <PlaceholderImage />
              )}

              <DetailsGroup>
                <ItemDetails className="name-point">
                  <ItemName>{item.name}</ItemName>
                  <ItemPoint>{item.point}</ItemPoint>
                </ItemDetails>
                <ItemDetails className="date-info">
                  <span className="date-label">교환일:</span>{" "}
                  {item.exchangedDate}
                </ItemDetails>
                <ItemDetails className="date-info">
                  <span className="date-label">유효기간:</span>{" "}
                  {item.expirationDate}
                </ItemDetails>
                <ItemDetails className="date-info">
                  <span className="date-label">사용일:</span> {item.usedDate}
                </ItemDetails>
              </DetailsGroup>

              <ItemStatus $status={item.status}>
                {item.status === "used"
                  ? "사용 완료"
                  : item.status === "unused_imminent"
                    ? "미사용 (임박)"
                    : item.status === "expired"
                      ? "만료" // ⭐️ 만료 상태 표시
                      : "미사용"}
              </ItemStatus>
            </ExchangeItem>
          ))
        ) : (
          <Placeholder>교환한 상품이 없습니다.</Placeholder>
        )}
      </ExchangeList>

      {totalPages > 1 && (
        <PaginationControls
          currentPage={currentPage + 1}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </ActivityLogWrap>
  );
};

export default ActivityLogContent;

// --- 스타일 컴포넌트 ---
const PRIMARY_COLOR = "var(--primary-color, #ff6b6b)";
const ACCENT_COLOR_BLUE = "#007bff";
const ACCENT_COLOR_GRAY = "#999";
const ACCENT_COLOR_RED = "#dc3545";

const Placeholder = styled.div`
  padding: 50px;
  text-align: center;
  color: #999;
  font-size: 1.1rem;
`;

const SectionTitle = styled.h3`
  font-size: 1.875rem;
  font-weight: 700;
  margin-bottom: 25px;
  text-align: left;

  @media (max-width: 768px) {
    font-size: 1.5rem;
    margin-bottom: 20px;
    padding: 0 10px;
  }
`;

const ActivityLogWrap = styled.div`
  padding-top: 20px;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
`;

const SummarySection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  margin-bottom: 40px;
  border: 1px solid #d9d9d9;
  border-radius: 10px;
  background-color: #fff;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    padding: 15px;
    margin-bottom: 20px;
    margin: 0 10px 20px 10px;
  }
`;

const SummaryItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0 15px;

  &:not(:last-child) {
    border-right: 1px solid #eee;
  }

  @media (max-width: 768px) {
    flex-direction: row;
    justify-content: space-between;
    width: 100%;
    padding: 8px 0;

    &:not(:last-child) {
      border-right: none;
      border-bottom: 1px dashed #eee;
    }
  }
`;

const Label = styled.span`
  color: #666;
  font-size: 0.95rem;
  margin-bottom: 4px;
  font-weight: 500;

  @media (max-width: 768px) {
    font-size: 1rem;
    margin-bottom: 0;
    color: #333;
    min-width: 120px;
  }
`;

const Value = styled.span`
  font-size: 1.625rem;
  font-weight: 700;
  color: ${PRIMARY_COLOR};

  @media (max-width: 768px) {
    font-size: 1.3rem;
  }
`;

const ExchangeList = styled.ul`
  list-style: none;
  padding: 0 20px;

  @media (max-width: 768px) {
    padding: 0 10px;
  }
`;

const ExchangeItem = styled.li`
  display: flex;
  align-items: center;
  padding: 20px 0;
  border-bottom: 1px solid #eee;
  transition: background-color 0.2s;

  /* ⭐️ GSAP 초기 상태 */
  opacity: 0;
  transform: translateY(20px);

  @media (max-width: 768px) {
    flex-wrap: wrap; /* ⭐️ 모바일: 줄바꿈 허용 */
    padding: 15px 0;
  }
`;

const ItemImage = styled.img`
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
  margin-right: 20px;
  border: 1px solid #eee;
  flex-shrink: 0;
`;

const PlaceholderImage = styled.div`
  width: 80px;
  height: 80px;
  background-color: #f0f0f0;
  border-radius: 8px;
  margin-right: 20px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #aaa;
  font-size: 0.8rem;
`;

const DetailsGroup = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  gap: 5px;
  max-width: calc(100% - 180px); /* 이미지(80) + 마진(20) + 상태(90) */

  @media (max-width: 768px) {
    max-width: none;
    width: calc(100% - 100px); /* 이미지 제외 공간 */
  }
`;

const ItemDetails = styled.div`
  font-size: 0.95rem;
  color: #555;
  display: flex;
  align-items: center;

  &.name-point {
    font-size: 1.1rem;
    font-weight: 600;
    color: #333;
    margin-bottom: 5px;

    @media (max-width: 768px) {
      width: 100%;
      margin-bottom: 0;
    }
  }

  &.date-info {
    @media (max-width: 768px) {
      width: 50%; /* 모바일에서 2줄로 배치 */
      font-size: 0.85rem;
    }
  }

  .date-label {
    font-weight: 500;
    color: #888;
    min-width: 65px;
    margin-right: 5px;
  }
`;

const ItemName = styled.span`
  flex-grow: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ItemPoint = styled.span`
  color: ${PRIMARY_COLOR};
  font-size: 1rem;
  font-weight: 700;
  margin-left: 10px;
  flex-shrink: 0;
`;

const ItemStatus = styled.span`
  font-size: 1rem;
  font-weight: 700;
  min-width: 110px;
  text-align: right;
  margin-left: auto; /* 우측 끝으로 밀기 */
  flex-shrink: 0;

  @media (max-width: 768px) {
    min-width: 80px;
    text-align: left;
    margin-top: 10px;
    margin-left: 10px;
    font-size: 0.9rem;
  }

  color: ${(props) => {
    switch (props.$status) {
      case "used":
        return ACCENT_COLOR_GRAY; // 사용 완료
      case "unused_imminent":
        return PRIMARY_COLOR; // 미사용 (임박) - 주황색/빨간색 계열
      case "unused":
        return ACCENT_COLOR_BLUE; // 미사용 - 파란색 계열
      case "expired":
        return ACCENT_COLOR_RED; // ⭐️ 만료 - 빨간색 계열
      default:
        return "#333";
    }
  }};
`;
