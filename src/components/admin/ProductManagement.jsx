import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import styled, { css } from "styled-components";
import { gsap } from "gsap";
import { FiUpload } from "react-icons/fi";
import { BiSearch } from "react-icons/bi";
import { FaChevronRight } from "react-icons/fa6";
import PaginationControls from "@/components/common/PaginationControls";
import axios from "axios";

const BASE_API_URL =
  import.meta.env.REACT_APP_API_URL || "http://localhost:9000/api";

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

// 사용자 정의 Alert Hook 및 컴포넌트는 그대로 유지
const useAlert = () => {
  const [alert, setAlert] = useState({
    message: null,
    type: "info",
    key: 0,
  });

  const showAlert = (message, type = "success") => {
    setAlert({ message, type, key: alert.key + 1 });
  };

  return [alert, showAlert];
};

const CustomAlert = ({ message, type, alertKey }) => {
  const alertRef = useRef(null);

  useEffect(() => {
    const el = alertRef.current;
    if (el && message) {
      gsap.set(el, { x: 300, opacity: 0 });
      gsap.to(el, {
        x: 0,
        opacity: 1,
        duration: 0.5,
        ease: "power3.out",
      });
      gsap.to(el, {
        x: 300,
        opacity: 0,
        duration: 0.5,
        delay: 2.5,
        ease: "power3.in",
      });
    }
  }, [alertKey, message]);

  if (!message) return null;

  return (
    <AlertContainer ref={alertRef} $type={type}>
      <AlertMessage>{message}</AlertMessage>
    </AlertContainer>
  );
};

// 상품 카테고리 분류 로직
const categorizeProduct = (productName) => {
  const name = productName.toUpperCase();
  if (
    name.includes("카페") ||
    name.includes("라떼") ||
    name.includes("아메리카노") ||
    name.includes("프라페") ||
    name.includes("공차")
  )
    return "CO";
  if (
    name.includes("CU") ||
    name.includes("세븐일레븐") ||
    name.includes("GS25") ||
    name.includes("상품권")
  )
    return "CS";
  if (
    name.includes("배달의 민족") ||
    name.includes("쿠팡이츠") ||
    name.includes("요기요")
  )
    return "BE";
  if (
    name.includes("CGV") ||
    name.includes("롯데시네마") ||
    name.includes("메가박스") ||
    name.includes("영화")
  )
    return "MO";
  if (
    name.includes("뚜레쥬르") ||
    name.includes("파리바게트") ||
    name.includes("던킨도너츠") ||
    name.includes("성심당")
  )
    return "BR";
  return "ETC";
};

const searchOptions = [
  { key: "name", label: "상품명" },
  { key: "category", label: "카테고리" },
];

const PRODUCTS_PER_PAGE = 6;

// ProductManagement Component
const ProductManagement = () => {
  const [productItems, setProductItems] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [activeProductId, setActiveProductId] = useState(null);

  const [showDeletePopUp, setShowDeletePopUp] = useState(false);
  const [showEditPopUp, setShowEditPopUp] = useState(false);
  const [isDragOverDelete, setIsDragOverDelete] = useState(false);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchBy, setSearchBy] = useState(searchOptions[0]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentSearchTerm, setCurrentSearchTerm] = useState("");

  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [selectedSidebarImage, setSelectedSidebarImage] = useState(null);
  const [productName, setProductName] = useState("");
  const [productCategory, setProductCategory] = useState("");
  const [productPoints, setProductPoints] = useState("");
  const [productQuantity, setProductQuantity] = useState("");
  const [productStock, setProductStock] = useState("");

  const [alert, showAlert] = useAlert();

  const fileInputRef = useRef(null);

  // 현재 선택된 상품 정보 조회
  const activeProduct = useMemo(() => {
    return productItems.find((p) => p.productId === activeProductId);
  }, [productItems, activeProductId]);

  // 상품 목록 조회
  const fetchProducts = useCallback(async () => {
    try {
      const response = await api.get("/products");
      const items = response.data;
      setProductItems(items);
    } catch (error) {
      showAlert("상품 목록 로딩에 실패했습니다.", "error");
      localStorage.removeItem("authToken");
      window.location.href = "/";
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, []);

  // 사이드바 입력 필드 초기화
  const resetSidebarState = useCallback(() => {
    setActiveProductId(null);
    setProductName("");
    setProductCategory("");
    setProductPoints("");
    setProductQuantity("");
    setProductStock("");
    setSelectedSidebarImage(null);
    setSelectedImageFile(null);
  }, []);

  // activeProduct가 변경될 때 사이드바 상태 업데이트
  useEffect(() => {
    if (activeProduct) {
      setProductName(activeProduct.productName || "");
      setProductPoints(activeProduct.productPoints || "");
      setProductQuantity(activeProduct.totalQuantity || "");
      setProductStock(activeProduct.stock || "");
      setProductCategory(
        activeProduct.productCategory ||
          categorizeProduct(activeProduct.productName || ""),
      );

      setSelectedSidebarImage(activeProduct.imageUrl || null);
      setSelectedImageFile(null);
    } else {
      resetSidebarState();
    }
  }, [activeProductId, activeProduct, resetSidebarState]);

  // 상품 검색 필터링 로직
  const filteredProducts = useMemo(() => {
    if (currentSearchTerm.length < 2 && currentSearchTerm.length !== 0) {
      return productItems;
    }

    if (!currentSearchTerm || currentSearchTerm.length === 0) {
      return productItems;
    }

    const term = currentSearchTerm.toLowerCase();

    return productItems.filter((product) => {
      if (searchBy.key === "name") {
        return product.productName.toLowerCase().includes(term);
      } else if (searchBy.key === "category") {
        // 상품 카테고리 검색
        const categoryCode =
          product.productCategory ||
          categorizeProduct(product.productName || "");
        return categoryCode.toLowerCase().includes(term);
      }
      return true;
    });
  }, [productItems, searchBy.key, currentSearchTerm]);

  // 페이지네이션 로직
  useEffect(() => {
    const totalPagesCount = Math.ceil(
      filteredProducts.length / PRODUCTS_PER_PAGE,
    );
    setTotalPages(totalPagesCount > 0 ? totalPagesCount : 1);

    if (currentPage > totalPagesCount && totalPagesCount > 0) {
      setCurrentPage(totalPagesCount);
    } else if (totalPagesCount === 0) {
      setCurrentPage(1);
    }
  }, [filteredProducts, currentPage]);

  // 검색 버튼 핸들러
  const handleSearch = () => {
    if (searchTerm.length > 0 && searchTerm.length < 2) {
      showAlert("검색어는 두 글자 이상 입력해야 합니다.", "warning");
      return;
    }
    setCurrentSearchTerm(searchTerm);
    setCurrentPage(1);
  };

  const handleSelectSearchBy = (option) => {
    setSearchBy(option);
    setIsDropdownOpen(false);
    setSearchTerm("");
    setCurrentSearchTerm("");
  };

  const handleProductInfoClick = (product) => {
    if (activeProductId === product.productId) {
      setActiveProductId(null);
    } else {
      setActiveProductId(product.productId);
    }
  };

  const handleProductCheck = (productId) => {
    setSelectedProducts((prevSelected) => {
      const isSelected = prevSelected.includes(productId);

      if (isSelected) {
        const newSelected = prevSelected.filter((id) => id !== productId);
        if (newSelected.length === 0) {
          resetSidebarState();
        } else if (activeProductId === productId) {
          setActiveProductId(newSelected[0] || null);
        }
        return newSelected;
      } else {
        setActiveProductId(productId);
        return [...prevSelected, productId];
      }
    });
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImageFile(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedSidebarImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRegisterOrEdit = () => {
    if (activeProductId) {
      setShowEditPopUp(true);
    } else {
      confirmRegister();
    }
  };

  // 새 상품 등록 로직
  const confirmRegister = async () => {
    if (!productName || !productPoints || !productQuantity || !productStock) {
      showAlert(
        "필수 항목(상품명, 포인트, 수량, 재고)을 모두 입력하세요.",
        "warning",
      );
      return;
    }

    try {
      const productData = {
        productName: productName,
        productPoints: parseInt(productPoints),
        totalQuantity: parseInt(productQuantity),
        stock: parseInt(productStock),
      };

      const formData = new FormData();
      formData.append(
        "product",
        new Blob([JSON.stringify(productData)], { type: "application/json" }),
      );

      if (selectedImageFile) {
        formData.append("file", selectedImageFile);
      }

      await api.post("/products", formData, {
        headers: {
          "Content-Type": undefined,
        },
      });

      fetchProducts();
      resetSidebarState();

      showAlert(`새 상품 "${productName}"이 등록되었습니다.`, "success");
    } catch (error) {
      showAlert(
        `상품 등록 실패: ${error.response?.data?.message || error.message}`,
        "error",
      );
    }
  };

  const handleDeleteClick = () => {
    if (selectedProducts.length > 0) {
      setShowDeletePopUp(true);
    } else {
      showAlert("삭제할 상품을 선택해주세요.", "warning");
    }
  };

  const handlePopUpClose = () => {
    setShowDeletePopUp(false);
    setShowEditPopUp(false);
  };

  // 선택 상품 삭제 로직
  const confirmDelete = async () => {
    setShowDeletePopUp(false);

    try {
      for (const id of selectedProducts) {
        await api.delete(`/products/${id}`);
      }

      fetchProducts();

      showAlert(
        `${selectedProducts.length}개의 상품이 삭제되었습니다.`,
        "error",
      );
      setSelectedProducts([]);
      resetSidebarState();
    } catch (error) {
      showAlert(
        `상품 삭제 실패: ${error.response?.data?.message || error.message}`,
        "error",
      );
    }
  };

  // 상품 수정 로직
  const confirmEdit = async () => {
    if (!activeProductId) {
      setShowEditPopUp(false);
      return;
    }

    setShowEditPopUp(false);

    try {
      const updatedProductData = {
        productName: productName,
        productPoints: parseInt(productPoints),
        totalQuantity: parseInt(productQuantity),
        stock: parseInt(productStock),
      };

      const formData = new FormData();
      formData.append(
        "product",
        new Blob([JSON.stringify(updatedProductData)], {
          type: "application/json",
        }),
      );

      if (selectedImageFile) {
        formData.append("file", selectedImageFile);
      }

      await api.put(`/products/${activeProductId}`, formData, {
        headers: {
          "Content-Type": undefined,
        },
      });

      fetchProducts();

      showAlert(
        `상품 ID ${activeProductId}의 정보가 수정되었습니다.`,
        "success",
      );
    } catch (error) {
      showAlert(
        `상품 수정 실패: ${error.response?.data?.message || error.message}`,
        "error",
      );
    }
  };

  // 현재 페이지의 상품 목록 계산
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
    const endIndex = startIndex + PRODUCTS_PER_PAGE;
    return filteredProducts.slice(startIndex, endIndex);
  }, [filteredProducts, currentPage]);

  // 드래그 앤 드롭 로직
  const handleDragStart = (e, productId) => {
    e.dataTransfer.setData("productId", productId.toString());
    if (!selectedProducts.includes(productId)) {
      setSelectedProducts([productId]);
      setActiveProductId(productId);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOverDelete(true);
  };

  const handleDragLeave = (e) => {
    setIsDragOverDelete(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOverDelete(false);

    const productId = parseInt(e.dataTransfer.getData("productId"), 10);

    if (productId) {
      setSelectedProducts((prev) =>
        prev.includes(productId) ? prev : [...prev, productId],
      );
      setActiveProductId(productId);
      setShowDeletePopUp(true);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const searchPlaceholderText = useMemo(() => {
    if (searchBy.key === "name") {
      return "상품명을 두 글자 이상 입력하세요.";
    }
    return "커피, 편의점, 배달음식, 영화, 빵집 중 하나를 입력하세요.";
  }, [searchBy.key]);

  return (
    <>
      <CustomAlert
        message={alert.message}
        type={alert.type}
        alertKey={alert.key}
      />
      <PageTitle>상품 정보</PageTitle>

      <SearchBarContainer>
        <NameDropdown>
          <DropdownToggle onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
            {searchBy.label}
            <DropdownIcon $isOpen={isDropdownOpen} size="0.75rem" />
          </DropdownToggle>
          <DropdownList $isOpen={isDropdownOpen}>
            {searchOptions.map((option) => (
              <DropdownItem
                key={option.key}
                onClick={() => handleSelectSearchBy(option)}
              >
                {option.label}
              </DropdownItem>
            ))}
          </DropdownList>
        </NameDropdown>

        <SearchForm
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
        >
          <SearchBar>
            <Input
              placeholder={searchPlaceholderText}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <SearchButton type="submit">
              <BiSearch size="1.75rem" />
            </SearchButton>
          </SearchBar>
        </SearchForm>

        <ActionButtons
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          $dragOver={isDragOverDelete}
        >
          <Button $primary onClick={handleDeleteClick}>
            선택 삭제
          </Button>
          <Button $primary>전체 삭제</Button>
        </ActionButtons>
      </SearchBarContainer>

      <MainContentArea>
        <ProductGrid>
          {paginatedProducts.length > 0 ? (
            paginatedProducts.map((product) => (
              <ProductCard
                key={product.productId}
                className={`product-card-${product.productId}`}
                onClick={() => handleProductInfoClick(product)}
                $selected={
                  selectedProducts.includes(product.productId) ||
                  activeProductId === product.productId
                }
                draggable="true"
                onDragStart={(e) => handleDragStart(e, product.productId)}
              >
                <Checkbox
                  checked={selectedProducts.includes(product.productId)}
                  onChange={() => handleProductCheck(product.productId)}
                  onClick={(e) => e.stopPropagation()}
                />
                <ProductImage className="dummy-img">
                  {product.imageUrl && (
                    <img
                      src={product.imageUrl}
                      alt={product.productName}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  )}
                </ProductImage>
                <ProductInfo>
                  <p>상품번호: {product.productCode}</p>
                  <p>상품명: {product.productName}</p>
                  <p>
                    포인트:{" "}
                    {new Intl.NumberFormat().format(product.productPoints)}P
                  </p>
                  <p>
                    등록일자: {String(product.registrationDate).split("T")[0]}
                  </p>
                  <p>재고: {product.stock}</p>
                </ProductInfo>
              </ProductCard>
            ))
          ) : (
            <NoResultsMessage>
              검색 결과가 없습니다.
              {currentSearchTerm &&
                currentSearchTerm.length >= 2 &&
                ` ("${currentSearchTerm}")`}
            </NoResultsMessage>
          )}
        </ProductGrid>

        <ProductSidebar>
          <SidebarProductImage
            className="dummy-img"
            onClick={() => fileInputRef.current && fileInputRef.current.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              style={{ display: "none" }}
            />

            {selectedSidebarImage ? (
              <UploadedImage
                src={selectedSidebarImage}
                alt="Uploaded Product Image"
              />
            ) : (
              <UploadIconContainer>
                <FiUpload size={48} color="#a0a0a0" />
              </UploadIconContainer>
            )}
          </SidebarProductImage>

          <ProductInputGroup>
            <InlineInputGroup>
              <div style={{ flex: "1", position: "relative" }}>
                <SidebarLabel htmlFor="product-name">상품명:</SidebarLabel>
                <SidebarInput
                  id="product-name"
                  value={productName}
                  onChange={(e) => {
                    setProductName(e.target.value);
                    setProductCategory(categorizeProduct(e.target.value));
                  }}
                  placeholder="상품을 선택하거나 입력해주세요."
                />
              </div>
              <div style={{ width: "70px", position: "relative" }}>
                <SidebarLabel htmlFor="product-category">
                  카테고리:
                </SidebarLabel>
                <SidebarInput
                  id="product-category"
                  value={productCategory}
                  onChange={(e) => setProductCategory(e.target.value)}
                  readOnly
                  style={{ backgroundColor: "#f0f0f0" }}
                  placeholder="자동 분류"
                />
              </div>
            </InlineInputGroup>
          </ProductInputGroup>

          <InlineInputGroup className="split-row">
            <div>
              <SidebarLabel htmlFor="product-points">포인트:</SidebarLabel>
              <div style={{ position: "relative" }}>
                <SidebarInput
                  id="product-points"
                  type="number"
                  value={productPoints}
                  onChange={(e) => setProductPoints(e.target.value)}
                  placeholder="0"
                />
                <PointSuffix>P</PointSuffix>
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <SidebarLabel>유효기간:</SidebarLabel>
              <div
                style={{
                  padding: "8px",
                  border: "1px solid #e0e0e0",
                  borderRadius: "4px",
                  backgroundColor: "#f0f0f0",
                  fontSize: "14px",
                  color: "#333",
                  height: "36px",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                교환일로부터 12개월
              </div>
            </div>
          </InlineInputGroup>

          <InlineInputGroup className="split-row">
            <div>
              <SidebarLabel htmlFor="product-quantity">전체 수량:</SidebarLabel>
              <SidebarInput
                id="product-quantity"
                type="number"
                value={productQuantity}
                onChange={(e) => setProductQuantity(e.target.value)}
                placeholder="0"
              />
            </div>
            <div>
              <SidebarLabel htmlFor="product-stock">현재 재고:</SidebarLabel>
              <SidebarInput
                id="product-stock"
                type="number"
                value={productStock}
                onChange={(e) => setProductStock(e.target.value)}
                placeholder="0"
              />
            </div>
          </InlineInputGroup>

          <Button
            $primary
            style={{ width: "100%", marginTop: "auto" }}
            onClick={handleRegisterOrEdit}
          >
            {activeProductId ? "수정" : "등록"}
          </Button>
        </ProductSidebar>
      </MainContentArea>

      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />

      {showEditPopUp && (
        <PopUpOverlay>
          <PopUpContent>
            <PopUpMessage>수정 하시겠습니까?</PopUpMessage>
            <PopUpActions>
              <button onClick={confirmEdit}>예</button>
              <button onClick={handlePopUpClose}>아니오</button>
            </PopUpActions>
          </PopUpContent>
        </PopUpOverlay>
      )}

      {showDeletePopUp && (
        <PopUpOverlay>
          <PopUpContent>
            <PopUpMessage>삭제 하시겠습니까?</PopUpMessage>
            <PopUpActions>
              <button onClick={confirmDelete}>예</button>
              <button onClick={handlePopUpClose}>아니오</button>
            </PopUpActions>
          </PopUpContent>
        </PopUpOverlay>
      )}
    </>
  );
};

export default ProductManagement;

const ALERT_COLORS = {
  success: { background: "#4CAF50", color: "#FFFFFF" },
  error: { background: "#ff0000", color: "#FFFFFF" },
  warning: { background: "#FF9800", color: "#333333" },
  info: { background: "#2196F3", color: "#FFFFFF" },
};

const AlertContainer = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 2000;
  padding: 15px 25px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  min-width: 250px;
  background-color: ${(props) =>
    ALERT_COLORS[props.$type]?.background || ALERT_COLORS.info.background};
  color: ${(props) =>
    ALERT_COLORS[props.$type]?.color || ALERT_COLORS.info.color};
`;

const AlertMessage = styled.div`
  font-size: 14px;
  font-weight: 500;
`;

const Button = styled.button`
  padding: 8px 15px;
  margin: 0 4px;
  border: none;
  cursor: pointer;
  border-radius: 4px;
  font-size: 14px;
  transition: background-color 0.2s;
  font-weight: 500;
  ${(props) =>
    props.$primary &&
    css`
      background-color: #ffcc00;
      color: #333;
      &:hover {
        background-color: #e6b800;
      }
    `}
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 10px;
  padding: 10px;
  border-radius: 8px;
  ${(props) =>
    props.$dragOver &&
    css`
      box-shadow: 0 0 10px rgba(255, 0, 0, 0.5);
      background-color: #ffe0e0;
    `}
`;

const SidebarInput = styled.input`
  width: 100%;
  padding: 8px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  box-sizing: border-box;
  background-color: #fff;
  font-size: 14px;
  color: #191919;
  &:focus {
    outline: none;
    border-color: #191919;
  }
  ${(props) =>
    props.readOnly &&
    css`
      background-color: #f0f0f0 !important;
      color: #333;
    `}
`;

const PageTitle = styled.h2`
  font-size: 24px;
  font-weight: normal;
  margin-bottom: 20px;
  padding-bottom: 0;
`;

const MainContentArea = styled.div`
  display: flex;
  gap: 20px;
  position: relative;
`;

const ProductGrid = styled.div`
  flex: 1;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 20px;
  overflow-x: hidden;
  grid-auto-rows: 248px;
  min-height: 500px;
`;

const ProductCard = styled.div`
  border: 1px solid #e0e0e0;
  display: flex;
  gap: 12px;
  width: 410px;
  border-radius: 8px;
  padding: 15px;
  text-align: left;
  position: relative;
  cursor: pointer;
  transition: border-color 0.2s;
  ${(props) =>
    props.$selected &&
    css`
      border: 2px solid #1a73e8;
    `}
`;

const Checkbox = styled.input.attrs({ type: "checkbox" })`
  position: absolute;
  top: 15px;
  right: 15px;
  width: 18px;
  height: 18px;
  cursor: pointer;
  z-index: 10;
  accent-color: #303030;
`;

const ProductImage = styled.div`
  width: 206px;
  height: 206px;
  background-color: #f0f0f0;
  margin-bottom: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 12px;
  color: #a0a0a0;
  border-radius: 4px;
  overflow: hidden;
  &.dummy-img {
    background-color: #f0f0f0;
  }
`;

const ProductInfo = styled.div`
  font-size: 13px;
  line-height: 1.6;
  color: #333;
  & > p:first-child {
    font-size: 12px;
    color: #a0a0a0;
    margin-bottom: 5px;
  }
`;

const ProductSidebar = styled.div`
  min-width: 250px;
  width: 30%;
  max-width: 470px;
  padding: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background-color: #fff;
  flex-shrink: 0;
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
`;

const SidebarProductImage = styled.div`
  width: 100%;
  aspect-ratio: 1 / 1;
  background-color: #f0f0f0;
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 12px;
  color: #a0a0a0;
  border-radius: 4px;
  overflow: hidden;
  cursor: pointer;
  position: relative;
`;

const UploadIconContainer = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 10;
`;

const UploadedImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
`;

const ProductInputGroup = styled.div`
  margin-bottom: 10px;
  display: flex;
  flex-direction: column;
`;

const InlineInputGroup = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
  &.split-row {
    & > div {
      flex: 1;
      display: flex;
      flex-direction: column;
    }
  }
`;

const SidebarLabel = styled.label`
  font-size: 12px;
  margin-bottom: 5px;
  font-weight: 500;
  color: #a0a0a0;
`;

const PopUpOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const PopUpContent = styled.div`
  background-color: #fff;
  border-radius: 4px;
  text-align: center;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  width: 350px;
  overflow: hidden;
`;

const PopUpMessage = styled.div`
  padding: 40px 20px;
  font-size: 16px;
  font-weight: normal;
  color: #333;
`;

const PopUpActions = styled.div`
  display: flex;
  & button {
    flex: 1;
    padding: 15px;
    font-size: 14px;
    border: none;
    cursor: pointer;
    font-weight: 500;
    transition: background-color 0.1s;
  }
  & button:first-child {
    background-color: #303030;
    color: #fff;
    border-right: 1px solid #e0e0e0;
  }
  & button:last-child {
    background-color: #f0f0f0;
    color: #333;
  }
`;

const PointSuffix = styled.span`
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #a0a0a0;
  font-size: 14px;
`;

const NoResultsMessage = styled.div`
  grid-column: 1 / -1;
  text-align: center;
  padding: 50px 0;
  color: #a0a0a0;
  font-size: 16px;
`;

const SearchBarContainer = styled.div`
  margin-bottom: 1.25rem;
  display: flex;
  align-items: flex-start;
`;

const NameDropdown = styled.div`
  position: relative;
  display: inline-block;
  margin-right: 0.9375rem;
`;

const DropdownList = styled.div`
  position: absolute;
  top: calc(100% + 0.625rem);
  left: 0;
  background-color: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 0.5rem;
  z-index: 10;
  min-width: 11rem;
  box-shadow: 0 0.25rem 0.75rem rgba(0, 0, 0, 0.1);
  display: ${(props) => (props.$isOpen ? "block" : "none")};
`;

const DropdownItem = styled.div`
  padding: 0.625rem 1rem;
  cursor: pointer;
  color: #191919;
  font-size: 0.875rem;

  &:hover {
    background-color: #f7f7f7;
  }
`;

const DropdownToggle = styled.button`
  width: 11rem;
  height: 3.25rem;
  display: flex;
  justify-content: space-between;
  align-items: center;

  background-color: #ffffff;
  border: 1px solid #e0e0e0;
  padding: 0 1rem;
  border-radius: 0.5rem;
  cursor: pointer;
  color: #191919;
  font-size: 1rem;
  font-weight: 500;
`;

const DropdownIcon = styled(FaChevronRight)`
  margin-left: 0.5rem;
  transition: transform 0.3s ease-in-out;
  transform: rotate(${(props) => (props.$isOpen ? "90deg" : "0deg")});
`;

const SearchForm = styled.form`
  display: flex;
  flex-grow: 1;
  max-width: 26.875rem;
  margin-right: 20px;
`;

const SearchBar = styled.div`
  width: 100%;
  height: 3.25rem;
  display: flex;
  align-items: center;

  background-color: #ffffff;
  border: 1px solid #e0e0e0;
  padding: 0 0.5rem;
  border-radius: 0.5rem;
`;

const Input = styled.input`
  flex-grow: 1;
  padding: 0.5rem;
  border: none;
  background-color: transparent;
  color: #191919;
  font-size: 1rem;

  &:focus {
    outline: none;
  }

  &::placeholder {
    color: #191919;
    opacity: 0.5;
  }
`;

const SearchButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: #191919;
  display: flex;
  align-items: center;
  justify-content: center;
`;
