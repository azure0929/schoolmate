import React from "react";
import styled from "styled-components";

function TopMenu() {
  const menus = [
    { name: "홈으로", active: true, icon: "🏠" },
    { name: "포인트 충전", active: false, icon: "💰" },
    { name: "상품 쇼핑", active: false, icon: "🛍️" },
    { name: "마이 페이지", active: false, icon: "👤" },
  ];

  return (
    <MenuContainer>
      {menus.map((menu) => (
        <MenuItem key={menu.name} active={menu.active}>
          <IconPlaceholder>{menu.icon}</IconPlaceholder>
          {menu.name}
        </MenuItem>
      ))}
    </MenuContainer>
  );
}

export default TopMenu;

const MenuContainer = styled.nav`
  display: flex;
  justify-content: center;
  padding: 20px 0;
  border-top: 1px solid #eee; /* 이미지에 있는 얇은 선 */
  border-bottom: 1px solid #eee;
  background-color: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
  border-radius: 8px; /* 약간 둥근 모서리 */
`;

const MenuItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0 30px; /* 메뉴 간 간격 */
  font-size: 14px;
  cursor: pointer;
  color: ${(props) => (props.active ? "#333" : "#999")};
  font-weight: ${(props) => (props.active ? "600" : "400")};

  &:hover {
    color: #555;
  }
`;

const IconPlaceholder = styled.div`
  width: 40px;
  height: 40px;
  background-color: #f0f0f0; /* 아이콘 배경색 */
  border-radius: 50%;
  margin-bottom: 8px; /* 텍스트와 간격 */
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: #888;
`;
