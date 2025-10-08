import React from "react";
import styled from "styled-components";
import issue1 from "@/assets/images/issue1.png";
import issue2 from "@/assets/images/issue2.png";
import issue3 from "@/assets/images/issue3.png";
import issue4 from "@/assets/images/issue4.png";

function IssueSection() {
  const issues = [
    {
      title: "우리 학교 벚꽃 맛집",
      description: "우리 동네 벚꽃 명소 TOP 5",
      src: issue1,
      url: "https://www.youtube.com/watch?v=OzRdp7nztHc",
    },
    {
      title: "벼락치기 1등!",
      description: "시험 기간 갓성비 간식 모음",
      src: issue2,
      url: "https://www.youtube.com/shorts/BXFhY6j0j8Y",
    },
    {
      title: "슬럼프 극복!",
      description: "고3 선배의 멘탈 관리법",
      src: issue3,
      url: "https://www.youtube.com/shorts/UPYeQ5wKj-Q",
    },
    {
      title: "인생 네컷 찍을 때 필수!",
      description: "힙한 포즈 모음",
      src: issue4,
      url: "https://www.youtube.com/watch?v=T_pIL2pWm1c",
    },
  ];

  const handleOnClick = (url) => {
    window.open(url, "_blank");
  };

  return (
    <SectionWrapper>
      <SectionTitle>최근 인기 이슈</SectionTitle>
      <IssueGrid>
        {issues.map((issue, index) => (
          <IssueCard key={index}>
            <ImageContainer
              $src={issue.src}
              onClick={() => handleOnClick(issue.url)}
            ></ImageContainer>
            <div className="issue-info">
              <Title>{issue.title}</Title>
              <Description>{issue.description}</Description>
            </div>
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
  font-size: 1.5rem;
  font-weight: 500;
  margin: 0;
  margin-bottom: 20px;
`;

const IssueGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
`;

const IssueCard = styled.div`
  position: relative;
  cursor: pointer;
  transition: transform 0.2s ease-in-out;

  &:hover {
    transform: translateY(-10px);
  }

  .issue-info {
    margin-top: 16px;
  }
`;

const ImageContainer = styled.div`
  width: 100%;
  border-radius: 12px;
  background-image: url(${(props) => props.$src});
  background-size: cover;
  background-position: center;
  position: relative;
  display: flex;
  flex-direction: column;
  height: 400px;
`;

const Title = styled.div`
  font-size: 1.625rem;
  font-weight: 600;
  margin-bottom: 4px;
`;

const Description = styled.div`
  font-size: 1.25rem;
  font-weight: 500;
`;
