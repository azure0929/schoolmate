import React from "react";
import styled from "styled-components";
import MealSection from "@/components/mainpage/MealSection";
import SchoolSchedule from "@/components/schedule/SchoolSchedule";
import SchoolTimetable from "@/components/schedule/SchoolTimetable";
import TopMenu from "@/components/mainpage/TopMenu";

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

const PageTitle = styled.h1`
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 40px;
`;

const Schedule = () => {
  return (
    <AppContainer>
      <ContentWrapper>
      <TopMenu />

        <MealSection />

        <Separator />
        <SchoolSchedule />

        <Separator />
        <SchoolTimetable />
       
      </ContentWrapper>
    </AppContainer>
  )
}
export default Schedule