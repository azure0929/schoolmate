import React from "react";
import logo from "@/assets/images/logo.png";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";

const StyledHeader = styled.div`
  .inner {
    height: 130px;
    display: flex;
    align-items: center;
    .logo {
      width: 176px;
      height: 60px;
    }
  }
`;

const Header = () => {
  const navigate = useNavigate();

  const handleOnClick = () => {
    navigate("/");
  };

  return (
    <div className="wrap">
      <StyledHeader>
        <div className="inner">
          <div className="logo" onClick={() => handleOnClick()}>
            <img src={logo} alt="logo" />
          </div>
        </div>
      </StyledHeader>
    </div>
  );
};

export default Header;
