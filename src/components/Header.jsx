import React from "react";
import logo from "@/assets/images/logo.png";
import styled from "styled-components";

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
  return (
    <div className="wrap">
      <StyledHeader>
        <div className="inner">
          <div className="logo">
            <img src={logo} alt="logo" />
          </div>
        </div>
      </StyledHeader>
    </div>
  );
};

export default Header;
