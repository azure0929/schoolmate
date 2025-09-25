import React from "react";
import styled from "styled-components";
import Header from "@/components/Header";
import DateSection from "@/components/mainpage/DateSection";
import TopMenu from "@/components/mainpage/TopMenu";
import ScheduleSection from "@/components/mainpage/ScheduleSection";
import IssueSection from "@/components/mainpage/IssueSection";
import MealSection from "@/components/mainpage/MealSection";
import ProductSection from "@/components/mainpage/ProductSection";

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
`;

const ContentWrapper = styled.div`
  width: 100%;
  max-width: 1200px;
  padding: 20px 0;
`;

const Separator = styled.div`
  height: 40px;
`;

function App() {
  return (
    <AppContainer>
      <ContentWrapper>
        <Header />
        <DateSection />
        <TopMenu />

        <Separator />

        <ScheduleSection />

        <Separator />

        <IssueSection />

        <Separator />

        <MealSection />

        <Separator />

        <ProductSection />
      </ContentWrapper>
    </AppContainer>
  );
}

export default App;
