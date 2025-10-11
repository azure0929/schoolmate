import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import styled from "styled-components";
import TopMenu from "@/components/mainpage/TopMenu";
import { MdSearch } from "react-icons/md";
import ProductExchangeModal from "@/components/modals/ProductExchangeModal";
import PaginationControls from "@/components/common/PaginationControls";
import api from "@/api/index";
import { gsap } from "gsap";

// 배열을 무작위로 섞는 함수 (Fisher-Yates 셔플)
const shuffleArray = (array) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

const PRIMARY_COLOR = "#f86166";
const ITEMS_PER_PAGE = 12;

// 애니메이션을 위한 ref를 받도록 ProductItemComponent 수정 (React.forwardRef 유지)
const ProductItemComponent = React.forwardRef(
  ({ product, isSelected, onClick }, ref) => (
    <ProductItem
      ref={ref} // ref 전달
      $selected={isSelected}
      onClick={() => onClick(product.productId)}
    >
      <ProductImage src={product.imageUrl} alt={product.productName} />
      <ProductInfo>
        <ProductSubInfo>{product.subInfo}</ProductSubInfo>
        <ProductTitle>{product.productName}</ProductTitle>
        <ProductPoint>
          {new Intl.NumberFormat().format(product.productPoints)}P
        </ProductPoint>
      </ProductInfo>
    </ProductItem>
  ),
);

function ProductList({ products = [], isLoading, selectedItemId, onSelect }) {
  const containerRef = useRef();

  useEffect(() => {
    if (products.length > 0 && containerRef.current) {
      const ctx = gsap.context(() => {
        // 모든 상품 항목을 선택
        const items = gsap.utils.toArray(containerRef.current.children);

        // 애니메이션 초기화 (안전성을 위해)
        gsap.set(items, { opacity: 0, y: 50, scale: 0.9 });

        // 독특한 진입 애니메이션: 아래에서 살짝 올라오며 불투명해지는 효과를 staggered하게 적용
        gsap.to(items, {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          ease: "power2.out",
          // Staggered delay (0.05초 간격으로 순차적으로 애니메이션 실행)
          stagger: 0.05,
        });
      }, containerRef); // Scope the animation to containerRef

      return () => ctx.revert(); // Clean up GSAP animations
    }
  }, [products]); // 상품 목록이 변경될 때마다 재실행 (페이지 변경, 필터 변경 등)

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
        <p>검색 결과가 없거나 등록된 상품이 없습니다.</p>
      </GridContainer>
    );
  }

  return (
    <GridContainer ref={containerRef}>
      {products.map((product) => (
        <ProductItemComponent
          key={product.productId}
          product={product}
          isSelected={product.productId === selectedItemId}
          onClick={onSelect}
        />
      ))}
    </GridContainer>
  );
}

function PointShop() {
  const [allProducts, setAllProducts] = useState([]);
  const [initialProducts, setInitialProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [sortOrder, setSortOrder] = useState("random");

  const [searchTerm, setSearchTerm] = useState("");
  const [filterTerm, setFilterTerm] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);

  // API 호출 및 랜덤 셔플 적용 (상품 목록 로드 함수)
  const loadAllProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get("/api/products");
      const shuffledProducts = shuffleArray(response.data);

      setAllProducts(shuffledProducts);
      setInitialProducts(shuffledProducts);
    } catch (err) {
      console.error("상품 로드 중 오류 발생:", err);
      setError("상품 정보를 불러오는 데 실패했습니다.");
      setAllProducts([]);
      setInitialProducts([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllProducts();
  }, [loadAllProducts]);

  // 검색 실행 핸들러
  const handleSearch = useCallback(() => {
    setFilterTerm(searchTerm.trim());
    setCurrentPage(1);
  }, [searchTerm]);

  // 정렬 및 필터링 로직 (Memoized)
  const processedProducts = useMemo(() => {
    let filtered = allProducts;

    if (filterTerm) {
      const lowerCaseFilterTerm = filterTerm.toLowerCase();
      filtered = allProducts.filter((product) =>
        product.productName.toLowerCase().includes(lowerCaseFilterTerm),
      );
    }

    let sorted = [...filtered];

    if (sortOrder === "random") {
      // 검색 필터가 적용된 상태에서만 다시 셔플하거나, 초기 목록을 사용
      sorted = filterTerm ? shuffleArray(filtered) : initialProducts;
    } else if (sortOrder === "lowPoint") {
      sorted.sort((a, b) => a.productPoints - b.productPoints);
    } else if (sortOrder === "highPoint") {
      sorted.sort((a, b) => b.productPoints - a.productPoints);
    }

    return sorted;
  }, [allProducts, initialProducts, sortOrder, filterTerm]);

  const handleItemClick = (id) => {
    setSelectedItemId((prevId) => (prevId === id ? null : id));
  };

  const selectedProduct = useMemo(() => {
    return (
      processedProducts.find((p) => p.productId === selectedItemId) || null
    );
  }, [selectedItemId, processedProducts]);

  useEffect(() => {
    // 페이지네이션, 정렬, 필터 변경 시 선택 항목 초기화
    setSelectedItemId(null);
  }, [currentPage, sortOrder, filterTerm]);

  const handleExchangeClick = () => {
    if (selectedProduct) {
      setIsModalOpen(true);
    } else {
      alert("먼저 교환할 상품을 선택해주세요.");
    }
  };

  const handleExchangeSuccess = () => {
    setIsModalOpen(false);
    // 포인트 잔액 변경을 반영하기 위해 상품 목록을 다시 로드 (포인트 조회는 모달 내부에서 다시 발생)
    loadAllProducts();
  };

  // 페이지네이션 계산
  const totalItems = processedProducts.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentProducts = processedProducts.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE,
  );

  if (error) {
    return (
      <PointShopWrap>
        <TopMenu />
        <ErrorTitle>{error}</ErrorTitle>
      </PointShopWrap>
    );
  }

  return (
    <PointShopWrap>
      <TopMenu />
      <SearchBar>
        <input
          type="text"
          placeholder="상품명을 입력해주세요."
          id="productinfo"
          name="productinfo"
          className="searchinput"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSearch();
            }
          }}
        />
        <MdSearch className="search-icon" onClick={handleSearch} />
      </SearchBar>

      <ProductItemsSection>
        <SortAndExchangeBar>
          <SortButtons>
            <SortButton
              $active={sortOrder === "random"}
              onClick={() => {
                setSortOrder("random");
                setCurrentPage(1);
              }}
            >
              랜덤순
            </SortButton>
            <SortButton
              $active={sortOrder === "lowPoint"}
              onClick={() => {
                setSortOrder("lowPoint");
                setCurrentPage(1);
              }}
            >
              낮은 포인트순
            </SortButton>
            <SortButton
              $active={sortOrder === "highPoint"}
              onClick={() => {
                setSortOrder("highPoint");
                setCurrentPage(1);
              }}
            >
              높은 포인트순
            </SortButton>
          </SortButtons>
          {/* ExchangeButton에 핸들러 적용 */}
          <ExchangeButton
            disabled={!selectedItemId}
            onClick={handleExchangeClick}
          >
            교환하기
          </ExchangeButton>
        </SortAndExchangeBar>

        <ProductList
          products={currentProducts}
          isLoading={isLoading}
          selectedItemId={selectedItemId}
          onSelect={handleItemClick}
        />
      </ProductItemsSection>

      {/* PaginationControls 컴포넌트 적용 */}
      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      {/* ProductExchangeModal 렌더링 */}
      <ProductExchangeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedProduct={selectedProduct}
        onExchangeSuccess={handleExchangeSuccess}
      />
    </PointShopWrap>
  );
}

export default PointShop;

const ErrorTitle = styled.h2`
  color: ${PRIMARY_COLOR};
  margin-top: 50px;
  font-size: 1.5rem;
  font-weight: 500;
`;

const PointShopWrap = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;

  @media (max-width: 768px) {
    padding-top: 60px;
    padding-bottom: 30px;
  }
`;

const SearchBar = styled.div`
  position: relative;
  margin-top: 40px;
  width: 700px;
  height: 40px;
  border-radius: 4px;
  border: 1px solid #e0e0e0;

  @media (max-width: 768px) {
    width: 90%;
    margin-top: 20px;
  }

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
    cursor: pointer;
  }
`;

const ProductItemsSection = styled.div`
  margin-top: 40px;
  width: 1060px;

  @media (max-width: 1100px) {
    width: 90%;
  }
`;
const SortAndExchangeBar = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-bottom: 30px;
  gap: 10px;

  @media (max-width: 768px) {
    justify-content: space-between;
    margin-bottom: 20px;
  }
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

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
    margin-left: 0;
  }
`;

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-gap: 30px;
  grid-template-rows: repeat(3, 310px);
  width: 100%;
  height: auto;
  min-height: 980px;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    grid-gap: 12px;
    grid-template-rows: auto;
    min-height: auto;
  }
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

  @media (max-width: 768px) {
    height: 250px;
  }
`;
const ProductImage = styled.img`
  width: 100%;
  height: 75%;
  max-height: 242px;
  object-fit: cover;
  border-radius: 4px;
  object-fit: cover;

  @media (max-width: 768px) {
    max-height: 180px;
    height: 70%;
  }
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
