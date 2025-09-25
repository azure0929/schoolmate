import React, { useState } from "react";
import styled from "styled-components";
import { CiShop } from "react-icons/ci";
import { FaStar } from "react-icons/fa";
import { IoCalendarNumberOutline } from "react-icons/io5";
import { FaHospitalUser } from "react-icons/fa6";

function TopMenu() {
  const menus = [
    { name: "포인트샵", icon: <CiShop size={32} /> },
    { name: "포인트 충전", icon: <FaStar size={32} /> },
    { name: "상품 쇼핑", icon: <IoCalendarNumberOutline size={32} /> },
    { name: "마이 페이지", icon: <FaHospitalUser size={32} /> },
  ];

  const [activeMenuName, setActiveMenuName] = useState("");

  const handleClick = (menuName) => {
    setActiveMenuName(menuName);
  };

  return (
    <MenuContainer>
      {menus.map((menu) => {
        const isActive = menu.name === activeMenuName;

        return (
          <MenuItem
            key={menu.name}
            $active={isActive}
            onClick={() => handleClick(menu.name)}
          >
            <IconPlaceholder $active={isActive}>{menu.icon}</IconPlaceholder>
            {menu.name}
          </MenuItem>
        );
      })}
    </MenuContainer>
  );
}

export default TopMenu;

const MenuContainer = styled.nav`
  display: flex;
  justify-content: center;
  margin-top: 74px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
`;

const MenuItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0 30px;
  cursor: pointer;
  color: ${(props) => (props.$active ? "#f86166" : "#191919")};
  font-weight: ${(props) => (props.$active ? "bold" : "medium")};
`;

const IconPlaceholder = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  margin-bottom: 4px;

  & > svg {
    color: ${(props) => (props.$active ? "#f86166" : "#999")};
  }
`;
