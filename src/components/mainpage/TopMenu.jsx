import React from "react";
import styled from "styled-components";
import { CiShop } from "react-icons/ci";
import { FaStar } from "react-icons/fa";
import { IoCalendarNumberOutline } from "react-icons/io5";
import { FaHospitalUser } from "react-icons/fa6";
import { useNavigate, useLocation } from "react-router-dom";

function TopMenu() {
  const navigate = useNavigate();
  const location = useLocation();

  const menus = [
    { name: "포인트샵", icon: <CiShop size={32} />, path: "/pointshop" },
    { name: "포인트 현황", icon: <FaStar size={32} />, path: "/pointhistory" },
    {
      name: "일정 관리",
      icon: <IoCalendarNumberOutline size={32} />,
      path: "/schedule",
    },
  ];

  const handleClick = (path) => {
    // 메뉴 클릭 시 해당 경로로 이동만.
    navigate(path);
  };

  return (
    <MenuContainer>
      {menus.map((menu) => {
        // 현재 URL 경로($`location.pathname`$)와 메뉴의 경로($`menu.path`$)를 비교하여 활성 상태를 결정.
        const isActive = location.pathname === menu.path;

        return (
          <MenuItem
            key={menu.name}
            // activeMenuName 대신 isActive를 props로 전달.
            $active={isActive}
            // 메뉴의 name 대신 path를 handleClick에 전달.
            onClick={() => handleClick(menu.path)}
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
