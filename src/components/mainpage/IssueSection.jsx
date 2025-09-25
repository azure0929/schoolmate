import React from "react";
import styled from "styled-components";

function IssueSection() {
  const issues = [
    {
      title: "우리 학교 벚꽃 맛집",
      description: "우리 동네 벚꽃 명소 TOP 5",
      src: "https://i.imgur.com/r0yD3XG.jpg",
    },
    {
      title: "배달치킨 1+1",
      description: "지금 시간 한정 선착순 모집",
      src: "https://i.imgur.com/gK2oM2L.jpg",
    },
    {
      title: "숨겨진 극복!",
      description: "고2 3학년 멤버 관리법",
      src: "https://i.imgur.com/tYtQ5nK.jpg",
    },
    {
      title: "인생네컷 찍을 때 필수",
      description: "인생샷 꿀팁 모음",
      src: "https://i.imgur.com/8Q9lK7r.jpg",
    },
  ];

  return (
    <SectionWrapper>
      <SectionTitle>최근 인기 이슈</SectionTitle>
      <IssueGrid>
        {issues.map((issue, index) => (
          <IssueCard key={index}>
            <ImageContainer $src={issue.src}>
              <GradientOverlay />
            </ImageContainer>
            <TitleOverlay>{issue.title}</TitleOverlay>
            <DescriptionOverlay>{issue.description}</DescriptionOverlay>
          </IssueCard>
        ))}
      </IssueGrid>
    </SectionWrapper>
  );
}

export default IssueSection;

const SectionWrapper = styled.section`
  padding: 20px 0;
`;

const SectionTitle = styled.h2`
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 20px;
  color: #333;
`;

const IssueGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr); /* 4열 그리드 */
  gap: 20px; /* 카드 간 간격 */
`;

const IssueCard = styled.div`
  position: relative;
  background-color: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: transform 0.2s ease-in-out;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
  }
`;

const ImageContainer = styled.div`
  width: 100%;
  background-image: url(${(props) => props.$src}); /* props로 이미지 URL 받기 */
  background-size: cover;
  background-position: center;
  position: relative; /* 오버레이를 위해 */
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  color: white;
  height: 400px;
  padding: 15px;
`;

const TitleOverlay = styled.div`
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 5px;
  z-index: 1; /* 텍스트가 그라디언트 위에 오도록 */
`;

const DescriptionOverlay = styled.div`
  font-size: 12px;
  font-weight: 400;
  opacity: 0.8;
  z-index: 1;
`;

const GradientOverlay = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 70%; /* 아래쪽 70%에 그라디언트 */
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0));
  z-index: 0;
`;
