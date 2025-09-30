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

// ... useAlert 및 CustomAlert 컴포넌트 (변경 없음) ...
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

// Custom Component: Alert UI 및 애니메이션
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
// ... 상품명 기반 카테고리 분류 (변경 없음) ...
const categorizeProduct = (productName) => {
  const name = productName.toUpperCase();
  if (
    name.includes("카페") ||
    name.includes("라떼") ||
    name.includes("아메리카노") ||
    name.includes("프라페")
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
  return "ETC";
};

// 🚨 [상수 정의] 한 페이지당 상품 개수
const PRODUCTS_PER_PAGE = 6;

// ProductManagement Component
const ProductManagement = () => {
  const [productItems, setProductItems] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);

  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1); // 🚨 [수정] totalPages 계산

  const [activeProductId, setActiveProductId] = useState(null);

  const [showDeletePopUp, setShowDeletePopUp] = useState(false);
  const [showEditPopUp, setShowEditPopUp] = useState(false);
  const [isDragOverDelete, setIsDragOverDelete] = useState(false);

  // 상품 등록/수정 상태
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [selectedSidebarImage, setSelectedSidebarImage] = useState(null); // 미리보기 URL

  const [productName, setProductName] = useState("");
  const [productCategory, setProductCategory] = useState("");
  const [productPoints, setProductPoints] = useState("");
  const [productExpiry, setProductExpiry] = useState("");
  const [productQuantity, setProductQuantity] = useState("");
  const [productStock, setProductStock] = useState("");

  const [alert, showAlert] = useAlert();

  const fileInputRef = useRef(null);

  // 무한 루프 방지 activeProduct는 useMemo로 계산 (productItems가 변경될 때만 재계산)
  const activeProduct = useMemo(() => {
    return productItems.find((p) => p.productId === activeProductId);
  }, [productItems, activeProductId]);

  // 상품 목록 로딩 로직 (useCallback 적용으로 함수 안정화)
  const fetchProducts = useCallback(async () => {
    console.log("-> [API CALL] GET /products 실행"); // 실행 확인을 위한 로그
    try {
      const response = await api.get("/products");
      const items = response.data;
      setProductItems(items);

      // 🚨 [페이지네이션 로직] 총 페이지 수 계산
      const totalPagesCount = Math.ceil(items.length / PRODUCTS_PER_PAGE);
      setTotalPages(totalPagesCount > 0 ? totalPagesCount : 1);
      // 현재 페이지가 새 총 페이지 수를 초과하지 않도록 보정
      if (currentPage > totalPagesCount && totalPagesCount > 0) {
        setCurrentPage(totalPagesCount);
      } else if (totalPagesCount === 0) {
        setCurrentPage(1);
      }
    } catch (error) {
      console.error("상품 목록 로딩 실패:", error);
      showAlert("상품 목록 로딩에 실패했습니다.", "error");
    }
  }, [showAlert, currentPage]); // currentPage를 의존성 배열에 추가하여 페이지 이동 후 로딩 시 보정 로직을 포함

  useEffect(() => {
    fetchProducts();
  }, []);

  // 사이드바 상태 초기화 함수 분리
  const resetSidebarState = useCallback(() => {
    setActiveProductId(null);
    setProductName("");
    setProductCategory("");
    setProductPoints("");
    setProductExpiry("");
    setProductQuantity("");
    setProductStock("");
    setSelectedSidebarImage(null);
    setSelectedImageFile(null);
  }, []);

  useEffect(() => {
    if (activeProduct) {
      setProductName(activeProduct.productName || "");
      setProductPoints(activeProduct.productPoints || "");

      const formattedExpiry = activeProduct.expirationDate
        ? String(activeProduct.expirationDate).split("T")[0]
        : "";
      setProductExpiry(formattedExpiry);

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
        // 선택 해제 시 초기화
        if (newSelected.length === 0) {
          resetSidebarState();
        } else if (activeProductId === productId) {
          // 체크 해제된 상품이 active 상품일 경우 다른 상품을 active로 설정하거나 null로 설정
          setActiveProductId(newSelected[0] || null);
        }
        return newSelected;
      } else {
        setActiveProductId(productId);
        return [...prevSelected, productId];
      }
    });
  };

  // 이미지 업로드 핸들러
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

  // 상품 등록 API 연동 로직 (FormData 및 Content-Type: undefined 유지)
  const handleRegisterOrEdit = () => {
    if (activeProductId) {
      setShowEditPopUp(true); // 수정 팝업 띄우기
    } else {
      confirmRegister(); // 등록 즉시 실행
    }
  };

  const confirmRegister = async () => {
    if (
      !productName ||
      !productPoints ||
      !productExpiry ||
      !productQuantity ||
      !productStock
    ) {
      showAlert(
        "필수 항목(상품명, 포인트, 유효기간, 수량, 재고)을 모두 입력하세요.",
        "warning",
      );
      return;
    }

    try {
      const productData = {
        productName: productName,
        productPoints: parseInt(productPoints),
        expirationDate: productExpiry, // YYYY-MM-DD 문자열 (백엔드 LocalDate와 매핑)
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

      const response = await api.post("/products", formData, {
        headers: {
          "Content-Type": undefined, // FormData 사용 시 Content-Type은 axios가 설정하도록 undefined로 둡니다.
        },
      });

      fetchProducts(); // 등록 성공 후 목록 새로고침
      resetSidebarState(); // 등록 성공 후 상태 초기화

      showAlert(
        `새 상품 "${response.data.productName}"이 등록되었습니다.`,
        "success",
      );
    } catch (error) {
      console.error("상품 등록 실패:", error);
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

  // 상품 삭제 API 연동 로직
  const confirmDelete = async () => {
    // 팝업 닫기
    setShowDeletePopUp(false);

    try {
      for (const id of selectedProducts) {
        await api.delete(`/products/${id}`);
      }

      fetchProducts(); // 삭제 성공 후 목록 새로고침

      showAlert(
        `${selectedProducts.length}개의 상품이 삭제되었습니다.`,
        "error",
      );
      setSelectedProducts([]);
      resetSidebarState(); // ⭐️ 삭제 성공 후 상태 초기화
    } catch (error) {
      console.error("상품 삭제 실패:", error);
      showAlert(
        `상품 삭제 실패: ${error.response?.data?.message || error.message}`,
        "error",
      );
    }
  };

  // 상품 수정 API 연동 로직
  const confirmEdit = async () => {
    if (!activeProductId) {
      setShowEditPopUp(false);
      return;
    }

    // 팝업 닫기
    setShowEditPopUp(false);

    try {
      const updatedProductData = {
        productName: productName,
        productPoints: parseInt(productPoints),
        expirationDate: productExpiry,
        totalQuantity: parseInt(productQuantity),
        stock: parseInt(productStock),
      };

      // 이미지 파일이 선택된 경우 FormData를 사용하여 이미지와 데이터를 함께 전송
      const formData = new FormData();
      formData.append(
        "product",
        new Blob([JSON.stringify(updatedProductData)], {
          type: "application/json",
        }),
      );

      // 파일 유무와 상관없이 FormData를 사용합니다. (백엔드 @RequestPart(required=false) 가정)
      if (selectedImageFile) {
        formData.append("file", selectedImageFile);
      }

      await api.put(`/products/${activeProductId}`, formData, {
        headers: {
          "Content-Type": undefined, // FormData 사용 시 undefined로 설정
        },
      });

      fetchProducts(); // 수정 성공 후 목록 새로고침

      // CustomAlert 호출
      showAlert(
        `상품 ID ${activeProductId}의 정보가 수정되었습니다.`,
        "success",
      );
    } catch (error) {
      console.error("상품 수정 실패:", error);
      showAlert(
        `상품 수정 실패: ${error.response?.data?.message || error.message}`,
        "error",
      );
    }
  };

  // 🚨 [핵심 수정] 현재 페이지에 해당하는 상품 목록만 필터링
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
    const endIndex = startIndex + PRODUCTS_PER_PAGE;
    return productItems.slice(startIndex, endIndex);
  }, [productItems, currentPage]);

  // 드래그 앤 드롭 핸들러 (기존 유지)
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
    console.log(`페이지 ${page}로 이동`);
  };

  return (
    <>
      <CustomAlert
        message={alert.message}
        type={alert.type}
        alertKey={alert.key}
      />
      <PageTitle>상품 정보</PageTitle>

      <SearchBarContainer>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <SearchInputBox style={{ width: "150px" }}>
            <Select>
              <option>상품명</option>
            </Select>
          </SearchInputBox>
          <SearchInputBox style={{ flexGrow: 1, width: "unset" }}>
            <Input placeholder="" />
            <SearchButton>🔍</SearchButton>
          </SearchInputBox>
        </div>

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
          {/* 🚨 [수정] productItems 대신 paginatedProducts 사용 */}
          {paginatedProducts.map((product) => (
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
                  {/* 🚨 [수정] YYYY-MM-DD 문자열을 그대로 사용하거나 Date() 처리 방식을 보정 */}
                  유효기간: {String(product.expirationDate).split("T")[0]}
                </p>
                <p>
                  {/* 🚨 [수정] YYYY-MM-DD 문자열을 그대로 사용하거나 Date() 처리 방식을 보정 */}
                  등록일자: {String(product.registrationDate).split("T")[0]}
                </p>
                <p>재고: {product.stock}</p>
              </ProductInfo>
            </ProductCard>
          ))}
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
            <div>
              <SidebarLabel htmlFor="product-expiry">유효기간:</SidebarLabel>
              <SidebarInput
                id="product-expiry"
                type="date"
                value={productExpiry}
                onChange={(e) => setProductExpiry(e.target.value)}
                placeholder="YYYY-MM-DD"
              />
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

      {/* 수정 팝업 */}
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

      {/* 삭제 팝업 */}
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

// ... (스타일 컴포넌트 코드는 변경 없음) ...
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

const SearchBarContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  justify-content: space-between;
`;

const SearchInputBox = styled.div`
  display: flex;
  align-items: center;
  border: 1px solid #e0e0e0;
  padding: 2px 5px;
  background-color: #fff;
  border-radius: 4px;
  width: 300px;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.05);
`;

const Select = styled.select`
  padding: 8px;
  border: none;
  background-color: transparent;
  margin-right: 5px;
  font-size: 14px;
  font-weight: 500;
`;

const Input = styled.input`
  flex-grow: 1;
  padding: 8px;
  border: none;
  background-color: transparent;
  font-size: 14px;
  &:focus {
    outline: none;
  }
`;

const SearchButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  color: #333;
  padding: 0 8px;
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
`;

const ProductCard = styled.div`
  border: 1px solid #e0e0e0;
  display: flex;
  gap: 12px;
  width: 100%;
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

const QuantityInfo = styled.div`
  font-size: 14px;
  text-align: right;
  margin-top: 5px;
  color: #d8383a;
  font-weight: bold;
`;

const PointSuffix = styled.span`
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #a0a0a0;
  font-size: 14px;
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
