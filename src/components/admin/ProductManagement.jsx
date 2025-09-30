import React, { useState, useRef, useEffect } from "react";
import styled, { css } from "styled-components";
import { gsap } from "gsap";
import { FiUpload } from "react-icons/fi";
import PaginationControls from "@/components/common/PaginationControls";

// Custom Hook: Alert 관리
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

// 더미 데이터
const initialProductItems = [
  {
    id: 1,
    name: "스타벅스 아메리카노(Ice)",
    code: "P001",
    points: "1,300P",
    expiry: "2026.12.31",
    regDate: "2025.09.01",
    category: "CO",
    quantity: 100,
  },
  {
    id: 2,
    name: "교촌 허니콤보",
    code: "P002",
    points: "1,300P",
    expiry: "2026.12.31",
    regDate: "2025.09.01",
    category: "CH",
    quantity: 50,
  },
  {
    id: 3,
    name: "CGV 영화 관람권",
    code: "P003",
    points: "12,000P",
    expiry: "2026.12.31",
    regDate: "2025.09.01",
    category: "MO",
    quantity: 200,
  },
  {
    id: 4,
    name: "GS25 모바일 상품권",
    code: "P004",
    points: "5,000P",
    expiry: "2026.12.31",
    regDate: "2025.09.01",
    category: "CS",
    quantity: 70,
  },
  {
    id: 5,
    name: "배달의 민족 1만원",
    code: "P005",
    points: "10,000P",
    expiry: "2026.12.31",
    regDate: "2025.09.01",
    category: "BM",
    quantity: 400,
  },
  {
    id: 6,
    name: "맥도날드 빅맥 세트",
    code: "P006",
    points: "1,300P",
    expiry: "2025.09.01",
    regDate: "2025.09.01",
    category: "HA",
    quantity: 30,
  },
];

const categorizeProduct = (productName) => {
  const name = productName.toUpperCase();
  if (
    name.includes("카페") ||
    name.includes("라떼") ||
    name.includes("아메리카노") ||
    name.includes("프라페")
  )
    return "커피";
  if (
    name.includes("CU") ||
    name.includes("세븐일레븐") ||
    name.includes("GS25") ||
    name.includes("상품권")
  )
    return "편의점";
  if (
    name.includes("배달의 민족") ||
    name.includes("쿠팡이츠") ||
    name.includes("요기요")
  )
    return "배달음식";
  if (
    name.includes("CGV") ||
    name.includes("롯데시네마") ||
    name.includes("메가박스") ||
    name.includes("영화")
  )
    return "영화";
  return "기타";
};

// ProductManagement Component
const ProductManagement = () => {
  const [productItems, setProductItems] = useState(initialProductItems);
  const [selectedProducts, setSelectedProducts] = useState([]);

  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 5; // 임시 전체 페이지 수

  const [activeProductId, setActiveProductId] = useState(null);

  const [showDeletePopUp, setShowDeletePopUp] = useState(false);
  const [showEditPopUp, setShowEditPopUp] = useState(false);
  const [isDragOverDelete, setIsDragOverDelete] = useState(false);
  const [selectedSidebarImage, setSelectedSidebarImage] = useState(null);

  const [productName, setProductName] = useState("");
  const [productCategory, setProductCategory] = useState("");
  const [productPoints, setProductPoints] = useState("");
  const [productExpiry, setProductExpiry] = useState("");
  const [productQuantity, setProductQuantity] = useState("");

  const [alert, showAlert] = useAlert();

  const gridRef = useRef(null);
  const fileInputRef = useRef(null);
  const deleteButtonRef = useRef(null);

  const activeProduct =
    productItems.find((p) => p.id === activeProductId) || {};

  useEffect(() => {
    if (activeProductId !== null) {
      setProductName(activeProduct.name || "");
      setProductPoints(
        activeProduct.points?.replace("P", "").replace(",", "") || "",
      );
      setProductExpiry(activeProduct.expiry || "");
      setProductQuantity(activeProduct.quantity || "");

      const categoryName = categorizeProduct(activeProduct.name || "");
      setProductCategory(categoryName);

      setSelectedSidebarImage(null);
    } else {
      setProductName("");
      setProductCategory("");
      setProductPoints("");
      setProductExpiry("");
      setProductQuantity("");
      setSelectedSidebarImage(null);
    }
  }, [activeProductId, productItems]);

  const handleProductInfoClick = (product) => {
    setActiveProductId(product.id);
  };

  const handleProductCheck = (productId) => {
    setSelectedProducts((prevSelected) => {
      const isSelected = prevSelected.includes(productId);

      if (isSelected) {
        const newSelected = prevSelected.filter((id) => id !== productId);
        setActiveProductId(null);
        return newSelected;
      } else {
        setActiveProductId(productId);
        return [...prevSelected, productId];
      }
    });
  };

  const handleRegisterOrEdit = () => {
    if (selectedProducts.length > 0) {
      setShowEditPopUp(true);
    } else {
      showAlert(
        `새 상품 "${productName || "상품"}"이 등록되었습니다.`,
        "success",
      );
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedSidebarImage(reader.result);
      };
      reader.readAsDataURL(file);
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

  const confirmDelete = () => {
    setShowDeletePopUp(false);

    const elementsToDelete = selectedProducts
      .map((id) => gridRef.current?.querySelector(`.product-card-${id}`))
      .filter((el) => el);

    if (elementsToDelete.length > 0) {
      gsap.to(elementsToDelete, {
        duration: 0.4,
        opacity: 0,
        scale: 0.8,
        y: -10,
        stagger: 0.05,
        onComplete: () => {
          setProductItems((prevItems) => {
            const deletedCount = prevItems.filter((p) =>
              selectedProducts.includes(p.id),
            ).length;

            showAlert(`${deletedCount}개의 상품이 삭제되었습니다.`, "error");

            return prevItems.filter((p) => !selectedProducts.includes(p.id));
          });
          setSelectedProducts([]);
          setActiveProductId(null);
        },
      });
    } else {
      setProductItems((prevItems) =>
        prevItems.filter((p) => !selectedProducts.includes(p.id)),
      );
      setSelectedProducts([]);
      setActiveProductId(null);
      showAlert(`상품이 삭제되었습니다.`, "error");
    }
  };

  const confirmEdit = () => {
    if (!activeProductId) {
      setShowEditPopUp(false);
      return;
    }

    const updatedProductItems = productItems.map((product) => {
      if (product.id === activeProductId) {
        const updatedProduct = {
          ...product,
          name: productName,
          points: `${new Intl.NumberFormat().format(productPoints)}P`,
          expiry: productExpiry,
          quantity: parseInt(productQuantity) || 0,
          category: categorizeProduct(productName),
        };
        return updatedProduct;
      }
      return product;
    });

    setProductItems(updatedProductItems);

    setShowEditPopUp(false);

    showAlert(`상품 ID ${activeProductId}의 정보가 수정되었습니다.`, "success");
  };

  // 드래그 앤 드롭 핸들러
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

  // 페이지 이동 핸들러
  const handlePageChange = (page) => {
    setCurrentPage(page);
    // TODO: 실제 API 호출 또는 상품 목록 필터링 로직 추가
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
          <Button $primary ref={deleteButtonRef} onClick={handleDeleteClick}>
            선택 삭제
          </Button>
          <Button $primary>전체 삭제</Button>
        </ActionButtons>
      </SearchBarContainer>

      <MainContentArea>
        <ProductGrid ref={gridRef}>
          {productItems.map((product) => (
            <ProductCard
              key={product.id}
              className={`product-card-${product.id}`}
              onClick={() => handleProductInfoClick(product)}
              $selected={
                selectedProducts.includes(product.id) ||
                activeProductId === product.id
              }
              draggable="true"
              onDragStart={(e) => handleDragStart(e, product.id)}
            >
              <Checkbox
                checked={selectedProducts.includes(product.id)}
                onChange={() => handleProductCheck(product.id)}
                onClick={(e) => e.stopPropagation()}
              />
              <ProductImage className="dummy-img">
                {/* 이미지 배치 */}
              </ProductImage>
              <ProductInfo>
                <p>상품번호: {product.code}</p>
                <p>상품명: {product.name}</p>
                <p>포인트: {product.points}</p>
                <p>유효기간: {product.expiry}</p>
                <p>등록일자: {product.regDate}</p>
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
                  placeholder="상품을 선택해주세요."
                />
              </div>
              <div style={{ width: "70px", position: "relative" }}>
                <SidebarLabel htmlFor="product-category">
                  상품 카테고리:
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
                value={productExpiry}
                onChange={(e) => setProductExpiry(e.target.value)}
                placeholder="YYYY.MM.DD"
              />
            </div>
          </InlineInputGroup>

          <ProductInputGroup>
            <SidebarLabel htmlFor="product-quantity">전체 수량:</SidebarLabel>
            <SidebarInput
              id="product-quantity"
              value={productQuantity}
              onChange={(e) => setProductQuantity(e.target.value)}
              placeholder="0"
            />
            <QuantityInfo>
              {productQuantity || 0}/{productQuantity || 0}
            </QuantityInfo>
          </ProductInputGroup>

          <Button
            $primary
            style={{ width: "100%", marginTop: "auto" }}
            onClick={handleRegisterOrEdit}
          >
            {selectedProducts.length > 0 ? "수정" : "등록"}
          </Button>
        </ProductSidebar>
      </MainContentArea>

      {/* 분리된 PaginationControls 컴포넌트 사용 */}
      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />

      {/* 팝업 코드 유지 */}
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

// Alert 컬러 커스텀
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
