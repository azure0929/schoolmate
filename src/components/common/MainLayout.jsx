import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';

// 로그인 이후의 모든 페이지를 감싸는 레이아웃 컴포넌트
const MainLayout = () => {
  return (
    <>
      <Header />
      <main>
        <Outlet />
      </main>
    </>
  );
};

export default MainLayout;