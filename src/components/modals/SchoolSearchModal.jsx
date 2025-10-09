import React, { useState, useEffect } from "react";
import styled from "styled-components";
import api from "@/api";
import { MdSearch } from "react-icons/md";

const SchoolSearchModal = ({ isOpen, onClose, onSelect, schoolLevel }) => {
  const [schoolName, setSchoolName] = useState("");
  const [results, setResults] = useState([]);

  useEffect(() => {
    if (isOpen) {
      setSchoolName("");
      setResults([]);
    }
  }, [isOpen]);

  // 검색 실행 함수
  const handleSearch = async () => {
    if (!schoolLevel) {
      alert("먼저 학교급(초/중/고)을 선택해주세요.");
      return;
    }
    if (!schoolName.trim()) {
      alert("학교 이름을 입력해주세요.");
      return;
    }
    try {
      setResults([]);
      const response = await api.get("/school-search", {
        params: { schoolName, schoolLevel },
      });

      const processedResults = response.data.map((school) => ({
        ...school, // 원본 데이터는 그대로 유지하고,
        // 사용하기 편한 새 이름들을 추가해줍니다.
        schoolName: school.SCHUL_NM,
        schoolCode: school.SD_SCHUL_CODE,
        schoolType: school.HS_SC_NM, // '일반고' 등 학교 종류
        locationName: school.LCTN_SC_NM, // '경기도' 등 지역
      }));
      setResults(processedResults);
    } catch (error) {
      console.error("학교 검색 실패:", error);
      alert("학교 정보 조회 중 오류가 발생했습니다.");
    }
  };

  // 검색 결과에서 학교를 선택했을 때 실행되는 함수
  const handleSelect = (school) => {
    onSelect(school); // 부모 컴포넌트로 선택된 학교 정보 전달
    onClose(); // 모달 닫기
  };

  if (!isOpen) return null;

  return (
    <ModalBackground onClick={onClose}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <Title>학교 검색</Title>
        <SearchInputWrapper>
          <SearchInput
            type="text"
            value={schoolName}
            onChange={(e) => setSchoolName(e.target.value)}
            placeholder="학교 이름을 입력하세요"
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
          />
          <SearchButton type="button" onClick={handleSearch}>
            <MdSearch size={24} />
          </SearchButton>
        </SearchInputWrapper>
        <ResultList>
          {results.length > 0 ? (
            results.map((school) => (
              <ResultItem
                key={school.schoolCode}
                onClick={() => handleSelect(school)}
              >
                <strong>{school.SCHUL_NM}</strong>
                <span
                  style={{
                    fontSize: "0.9rem",
                    color: "#666",
                    marginTop: "4px",
                  }}
                >
                  {school.schoolType &&
                    school.schoolType.trim() !== "" &&
                    `(${school.schoolType}) `}
                  {school.locationName}
                </span>
              </ResultItem>
            ))
          ) : (
            <NoResult>검색 결과가 없습니다.</NoResult>
          )}
        </ResultList>
        <CloseButton type="button" onClick={onClose}>
          닫기
        </CloseButton>
      </ModalContainer>
    </ModalBackground>
  );
};
export default SchoolSearchModal;

// --- Styled Components ---

const ModalBackground = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContainer = styled.div`
  background-color: white;
  padding: 24px;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
`;

const Title = styled.h3`
  font-size: 1.5rem;
  margin: 0 0 16px 0;
  text-align: center;
`;

const SearchInputWrapper = styled.div`
  display: flex;
  margin-bottom: 16px;
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px 0 0 8px;
  outline: none;
  font-size: 1rem;
  color: #333;

  &::placeholder {
    color: #999;
  }

  &:focus {
    border-color: var(--primary-color);
  }
`;

const SearchButton = styled.button`
  padding: 0 12px;
  border: 1px solid var(--primary-color);
  background-color: var(--primary-color);
  color: white;
  border-radius: 0 8px 8px 0;
  cursor: pointer;
  display: flex;
  align-items: center;
`;

const ResultList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  overflow-y: auto;
  flex: 1;
`;

const ResultItem = styled.li`
  padding: 12px;
  cursor: pointer;
  border-bottom: 1px solid #eee;

  strong {
    display: block;
    font-weight: 500;
  }
  span {
    font-size: 0.875rem;
    color: #666;
  }

  &:hover {
    background-color: #f5f5f5;
  }
`;

const NoResult = styled.div`
  padding: 20px;
  text-align: center;
  color: #999;
`;

const CloseButton = styled.button`
  margin-top: 16px;
  padding: 12px;
  border: none;
  background-color: #666;
  color: white;
  border-radius: 8px;
  cursor: pointer;
`;
