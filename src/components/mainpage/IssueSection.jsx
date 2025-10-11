import React, { useRef, useEffect } from "react";
import styled from "styled-components";
import { gsap } from "gsap";
import { MdOpenInNew } from "react-icons/md";

import issue1 from "@/assets/images/issue1.png";
import issue2 from "@/assets/images/issue2.png";
import issue3 from "@/assets/images/issue3.png";
import issue4 from "@/assets/images/issue4.png";

function IssueSection() {
  const sectionRef = useRef(null); // 섹션 전체를 위한 Ref
  const titleRef = useRef(null); // 제목을 위한 Ref
  const cardRefs = useRef([]); // 각 카드를 위한 Ref 배열

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

  useEffect(() => {
    // 1. 섹션 등장 애니메이션
    const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

    // 초기 상태 설정
    gsap.set(sectionRef.current, { opacity: 0, y: 50 });
    gsap.set(titleRef.current, { opacity: 0, y: -20 });
    cardRefs.current.forEach((card) => {
      gsap.set(card, {
        opacity: 0,
        y: 30,
        rotationX: -10,
        transformOrigin: "top center",
      });
    });

    // 섹션 전체 및 제목 등장
    tl.to(sectionRef.current, { opacity: 1, y: 0, duration: 0.8 }, 0).to(
      titleRef.current,
      { opacity: 1, y: 0, duration: 0.6 },
      0.2,
    );

    // 카드들 순차적으로 등장 (stagger)
    tl.to(
      cardRefs.current,
      {
        opacity: 1,
        y: 0,
        rotationX: 0,
        duration: 0.7,
        stagger: 0.15,
      },
      0.5,
    ); // 제목 애니메이션 후 시작

    // 2. 배경 그라디언트 애니메이션
    gsap.to(sectionRef.current, {
      backgroundPosition: "200% 0%", // 배경 위치를 애니메이션하여 그라디언트 흐름 효과
      duration: 10,
      ease: "none",
      repeat: -1, // 무한 반복
      yoyo: true, // 역방향 재생
    });

    // 3. 카드 호버/클릭 효과 (GSAP)
    cardRefs.current.forEach((card, index) => {
      const cardTween = gsap.to(card, {
        y: -15, // 약간 위로
        rotationZ: (index % 2 === 0 ? 1 : -1) * 1, // 살짝 회전
        boxShadow: "0 10px 30px rgba(0,0,0,0.2), 0 0 0 1px rgba(0,0,0,0.05)", // 입체적인 그림자
        scale: 1.02,
        duration: 0.3,
        paused: true, // 처음에는 멈춤
        ease: "power1.out",
      });

      card.addEventListener("mouseenter", () => cardTween.play());
      card.addEventListener("mouseleave", () => cardTween.reverse());

      // 클릭 시 일시적인 스케일업 효과
      card.addEventListener("click", () => {
        gsap.to(card, {
          scale: 1.05,
          duration: 0.1,
          ease: "power2.out",
          yoyo: true,
          repeat: 1,
          onComplete: () => {
            // GSAP 애니메이션이 완료된 후 링크 이동
            handleOnClick(issues[index].url);
          },
        });
      });
    });
  }, []); // 컴포넌트 마운트 시 한 번만 실행

  return (
    <SectionWrapper ref={sectionRef}>
      <InnerWrapper>
        {" "}
        {/* 반응형을 위한 inner wrapper 추가 */}
        <SectionTitle ref={titleRef}>최근 인기 이슈</SectionTitle>
        <IssueGrid>
          {issues.map((issue, index) => (
            <IssueCard
              key={index}
              ref={(el) => (cardRefs.current[index] = el)} // Ref 배열에 추가
            >
              <ImageContainer
                $src={issue.src}
                // 클릭 핸들러는 GSAP의 click 이벤트 리스너에서 처리
              >
                <Overlay>
                  <OverlayText>지금 보러가기!</OverlayText>
                  <MdOpenInNew size="24" color="white" />
                </Overlay>
                <LinkIcon>
                  <MdOpenInNew size="20" color="#fff" />
                </LinkIcon>
              </ImageContainer>
              <div className="issue-info">
                <Title>{issue.title}</Title>
                <Description>{issue.description}</Description>
              </div>
            </IssueCard>
          ))}
        </IssueGrid>
      </InnerWrapper>
    </SectionWrapper>
  );
}

export default IssueSection;

const SectionWrapper = styled.section`
  padding: 80px 0;
  overflow: hidden;
  @media (max-width: 768px) {
    padding: 40px 0;
  }
`;

const InnerWrapper = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 40px;

  @media (max-width: 768px) {
    padding: 0 20px;
  }
`;

const SectionTitle = styled.h2`
  font-size: 2.2rem;
  font-weight: 700;
  margin: 0;
  margin-bottom: 40px;
  text-align: center;
  color: #333;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    font-size: 1.8rem;
    margin-bottom: 30px;
  }
  @media (max-width: 480px) {
    font-size: 1.5rem;
    margin-bottom: 20px;
  }
`;

const IssueGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr); /* 데스크톱: 4열 */
  gap: 30px;

  /* 태블릿 및 모바일 (1024px 이하) */
  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr); /* 2열 */
    gap: 25px;
  }

  /* 모바일 (768px 이하): 2열 유지 */
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr); /* 👈 2열 유지 */
    gap: 15px; /* 모바일 간격 축소 */
  }

  /* 더 작은 모바일 (480px 이하) - 선택적으로 1열 전환 가능 */
  @media (max-width: 480px) {
    grid-template-columns: 1fr; /* 👈 480px 이하에서는 1열로 전환하여 카드 크기 확보 */
    gap: 20px;
  }
`;

const IssueCard = styled.div`
  position: relative;
  cursor: pointer;
  background-color: white;
  border-radius: 16px;
  overflow: hidden; /* 이미지 오버레이 넘치지 않도록 */
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08); /* 기본 그림자 */
  /* transform, box-shadow 등은 GSAP가 제어할 것이므로 CSS transition 제거 */

  .issue-info {
    padding: 20px;
    margin-top: 0; /* ImageContainer와 분리 */
  }

  @media (max-width: 768px) {
    .issue-info {
      padding: 15px;
    }
  }
`;

const ImageContainer = styled.div`
  width: 100%;
  height: 250px; /* 데스크톱 기본 높이 */
  border-radius: 12px 12px 0 0; /* 상단만 둥글게 */
  background-image: url(${(props) => props.$src});
  background-size: cover;
  background-position: center;
  position: relative;
  display: flex;
  flex-direction: column;
  overflow: hidden; /* 오버레이 내부 요소 숨김 방지 */

  @media (max-width: 768px) {
    height: 200px; /* 모바일 높이 축소 */
  }
`;

const Overlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: white;
  opacity: 0; /* 기본적으로 숨김 */
  transition: opacity 0.3s ease;

  ${IssueCard}:hover & {
    opacity: 1; /* 호버 시 나타남 */
  }
`;

const OverlayText = styled.div`
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 10px;

  @media (max-width: 768px) {
    font-size: 1.2rem;
  }
`;

const LinkIcon = styled.div`
  position: absolute;
  top: 15px;
  right: 15px;
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  justify-content: center;
  align-items: center;
  backdrop-filter: blur(2px);
  transition: background-color 0.2s;

  ${IssueCard}:hover & {
    background-color: var(--primary-color); /* 호버 시 색상 변경 */
  }
`;

const Title = styled.div`
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 4px;
  color: #333;

  @media (max-width: 768px) {
    font-size: 1rem;
  }
  @media (max-width: 480px) {
    font-size: 0.875rem;
  }
`;

const Description = styled.div`
  font-size: 1.1rem;
  font-weight: 500;
  color: #666;

  @media (max-width: 768px) {
    font-size: 0.875rem;
  }
  @media (max-width: 480px) {
    font-size: 0.875rem;
  }
`;
