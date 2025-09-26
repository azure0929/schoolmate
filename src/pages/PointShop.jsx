import React, { useState, useEffect } from "react";
import styled from "styled-components";
import Header from "@/components/common/Header";
import TopMenu from "@/components/mainpage/TopMenu";
import { MdSearch } from "react-icons/md";

const axios = {
  get: (url) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const totalItems = 30;
        const productsData = Array.from({ length: totalItems }, (_, i) => ({
          id: i + 1,
          title: `DB 상품명 ${i + 1} 예시 (Axios)`,
          point: (i + 1) * 1000,
          imageUrl: `https://via.placeholder.com/242x242/f5f5f5/333?text=Item+${i + 1}`,
          subInfo: "",
        }));

        resolve({ data: { products: productsData } });
      }, 500); // 0.5초 지연
    });
  },
};

const PRIMARY_COLOR = "#f86166";
const ITEMS_PER_PAGE = 12;

const ProductItemComponent = ({ product, isSelected, onClick }) => (
  <ProductItem $selected={isSelected} onClick={() => onClick(product.id)}>
    <ProductImage src={product.imageUrl} alt={product.title} />
    <ProductInfo>
      <ProductSubInfo>{product.subInfo}</ProductSubInfo>
      <ProductTitle>{product.title}</ProductTitle>
      <ProductPoint>{product.point.toLocaleString()}P</ProductPoint>
    </ProductInfo>
  </ProductItem>
);

function ProductList({ products = [], isLoading, selectedItemId, onSelect }) {
  if (isLoading) {
    return (
      <GridContainer>
        <p>상품 목록을 불러오는 중...</p>
      </GridContainer>
    );
  }
  if (products.length === 0) {
    return (
      <GridContainer>
        <p>등록된 상품이 없습니다.</p>
      </GridContainer>
    );
  }

  return (
    <GridContainer>
      {products.map((product) => (
        <ProductItemComponent
          key={product.id}
          product={product}
          isSelected={product.id === selectedItemId}
          onClick={onSelect}
        />
      ))}
    </GridContainer>
  );
}

function PointShop() {
  // DB에서 한 번에 로드한 전체 상품 목록
  const [allProducts, setAllProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState(null);

  // Axios를 사용해 마운트 시 전체 상품을 로드
  useEffect(() => {
    const loadAllProducts = async () => {
      setIsLoading(true);

      try {
        const response = await axios.get("/api/products"); // Axios GET 요청 시뮬레이션
        // API 응답 데이터 (response.data.products)를 전체 상품 목록으로 저장
        setAllProducts(response.data.products);
      } catch (error) {
        console.error("상품 로드 중 오류 발생:", error);
        setAllProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadAllProducts();
    // 의존성 배열을 빈 배열로 두어 마운트 시 한 번만 실행되도록.
  }, []);

  const handleItemClick = (id) => {
    setSelectedItemId((prevId) => (prevId === id ? null : id));
  };

  // 클라이언트 측 페이지네이션 계산
  const totalItems = allProducts.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  // 현재 페이지에 표시할 상품 목록 계산
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentProducts = allProducts.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE,
  );

  return (
    <PointShopWrap>
      <Header />
      <TopMenu />
      <SearchBar>
        <input
          type="text"
          placeholder="상품명을 입력해주세요."
          id="productinfo"
          name="productinfo"
          className="searchinput"
        />
        <MdSearch className="search-icon" />
      </SearchBar>

      <ProductItemsSection>
        <SortAndExchangeBar>
          <SortButtons>
            <SortButton $active={true}>낮은 포인트순</SortButton>
            <SortButton $active={false}>높은 포인트순</SortButton>
          </SortButtons>
          <ExchangeButton>교환하기</ExchangeButton>
        </SortAndExchangeBar>

        <ProductList
          products={currentProducts} // 현재 페이지 상품만 전달
          isLoading={isLoading}
          selectedItemId={selectedItemId}
          onSelect={handleItemClick}
        />
      </ProductItemsSection>

      <BottomPagination>
        {pageNumbers.map((num) => (
          <PageNumber
            key={num}
            $active={num === currentPage}
            onClick={() => setCurrentPage(num)}
          >
            {num}
          </PageNumber>
        ))}
        <PageNumber
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          $active={false}
        >
          &gt;
        </PageNumber>
      </BottomPagination>
    </PointShopWrap>
  );
}

export default PointShop;

const PointShopWrap = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
  padding-top: 80px;
`;

const SearchBar = styled.div`
  position: relative;
  margin-top: 40px;
  width: 700px;
  height: 40px;
  border-radius: 4px;
  border: 1px solid #e0e0e0;

  input {
    width: 100%;
    height: 100%;
    border-radius: inherit;
    border: none;
    padding: 0 40px 0 20px;
    color: var(--text-color, #191919);
    outline: none;
    font-size: 1rem;
  }
  .search-icon {
    font-size: 20px;
    position: absolute;
    top: 50%;
    right: 15px;
    transform: translateY(-50%);
    color: #999;
  }
`;

const ProductItemsSection = styled.div`
  margin-top: 40px;
  width: 1060px;
`;
const SortAndExchangeBar = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-bottom: 30px;
  gap: 10px;
`;
const SortButtons = styled.div`
  display: flex;
  gap: 10px;
`;
const SortButton = styled.button`
  background-color: transparent;
  color: ${(props) => (props.$active ? PRIMARY_COLOR : "#999")};
  border: none;
  padding: 5px 0;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;

  ${(props) =>
    props.$active &&
    `
    font-weight: 700;
    text-decoration: underline;
  `}
`;
const ExchangeButton = styled.button`
  width: 96px;
  height: 36px;
  background-color: ${PRIMARY_COLOR};
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9375rem;
  font-weight: 700;
  margin-left: 20px;
`;

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-gap: 30px;
  grid-template-rows: repeat(3, 310px);
  width: 100%;
  height: auto;
  min-height: 980px;
`;

const ProductItem = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  box-sizing: border-box;
  border: 1px solid transparent;
  border-radius: 4px;
  padding: 0;

  ${(props) =>
    props.$selected &&
    `
    border: 1px solid ${PRIMARY_COLOR}; 
    box-shadow: 0 0 5px rgba(248, 97, 102, 0.3);
  `}
`;
const ProductImage = styled.img`
  width: 100%;
  height: 75%;
  max-height: 242px;
  object-fit: cover;
  border-radius: 4px;
`;
const ProductInfo = styled.div`
  padding: 10px 0;
  flex-grow: 1;
`;
const ProductSubInfo = styled.p`
  font-size: 0.75rem;
  color: ${PRIMARY_COLOR};
  margin: 0 0 2px 0;
  font-weight: 500;
  min-height: 12px;
`;
const ProductTitle = styled.h3`
  font-size: 0.9375rem;
  font-weight: 500;
  color: #191919;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;
const ProductPoint = styled.p`
  font-size: 1rem;
  font-weight: 500;
  color: #191919;
  margin: 4px 0 0 0;
`;

const BottomPagination = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 50px;
  gap: 5px;
  margin-bottom: 50px;
`;
const PageNumber = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  font-size: 1rem;
  cursor: pointer;
  color: ${(props) => (props.$active ? "white" : "#999")};
  background-color: ${(props) =>
    props.$active ? PRIMARY_COLOR : "transparent"};
  border-radius: 4px;
  font-weight: ${(props) => (props.$active ? "700" : "500")};

  &:hover {
    background-color: ${(props) => (props.$active ? PRIMARY_COLOR : "#f0f0f0")};
    color: ${(props) => (props.$active ? "white" : "#191919")};
  }
`;
