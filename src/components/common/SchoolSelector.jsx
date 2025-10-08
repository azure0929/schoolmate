import React, { useState, useEffect, useMemo } from "react";
import styled from "styled-components";
import axios from "axios";
import SchoolSearchModal from "@/components/modals/SchoolSearchModal";
import { MdSearch, MdOutlineSchool } from "react-icons/md";

const api = axios.create({
  baseURL: 'http://localhost:9000/api',
});

const SchoolSelector = ({ schoolData, onSchoolChange }) => {
  const [majorList, setMajorList] = useState([]);
  const [classList, setClassList] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 학교 코드가 변경되면 학과 목록 조회
  useEffect(() => {
    if (!schoolData.schoolCode) {
      setMajorList([]);
      return;
    }
    const fetchMajors = async () => {
      try {
        const res = await api.get("/school-search/majors", {
          params: {
            educationOfficeCode: schoolData.scCode,
            schoolCode: schoolData.schoolCode,
          },
        });
        setMajorList(res.data);
      } catch (error) { console.error("학과 정보 조회 실패:", error); }
    };
    fetchMajors();
  }, [schoolData.schoolCode, schoolData.scCode]);

  // 학과와 학년이 모두 선택되면 반 목록 조회
  useEffect(() => {
    if (!schoolData.grade || (majorList.length > 0 && !schoolData.majorName)) {
        setClassList([]);
        return;
    }
    const fetchClasses = async () => {
      try {
        const res = await api.get("/school-search/class-info", {
          params: {
            educationOfficeCode: schoolData.scCode,
            schoolCode: schoolData.schoolCode,
            grade: schoolData.grade,
            majorName: schoolData.majorName || "일반과정", // 학과가 없는 학교(초, 중) 기본값
          },
        });
                // 1. API 응답(res.data)에서 반 이름(CLASS_NM)만 추출하여 새 배열 생성
        const classNames = res.data.map(c => c.CLASS_NM);

        // 2. 추출된 배열을 숫자 기준으로 오름차순 정렬
        const sortedClasses = classNames.sort((a, b) => Number(a) - Number(b));

        // 3. 올바르게 정렬된 배열을 상태(state)에 저장
        setClassList(sortedClasses);
      } catch (error) { console.error("반 조회 실패:", error); }
    };
    fetchClasses();
  }, [schoolData.schoolCode, schoolData.scCode, schoolData.grade, schoolData.majorName, majorList]);

  // --- 이벤트 핸들러 ---
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    onSchoolChange({ ...schoolData, [name]: value });
  };

  const handleSchoolLevelChange = (e) => {
    onSchoolChange({
        level: e.target.value,
        schoolCode: "", scCode: "", schoolName: "",
        majorName: "", grade: "", classNo: "",
    });
  };

  const handleGradeChange = (e) => {
    onSchoolChange({ ...schoolData, grade: e.target.value, classNo: "" });
  };

  const handleMajorChange = (e) => {
    onSchoolChange({ ...schoolData, majorName: e.target.value, grade: "", classNo: "" });
  };

  const handleSchoolSelect = (school) => {
    onSchoolChange({
      ...schoolData,
      schoolName: school.SCHUL_NM,
      schoolCode: school.SD_SCHUL_CODE,
      scCode: school.ATPT_OFCDC_SC_CODE,
      majorName: "",
      grade: "",
      classNo: "",
    });
    setIsModalOpen(false);
  };

  const gradeOptions = useMemo(() => {
    if (schoolData.level === "초등학교") return [1, 2, 3, 4, 5, 6];
    if (schoolData.level === "중학교" || schoolData.level === "고등학교") return [1, 2, 3];
    return [];
  }, [schoolData.level]);

  return (
    <>
      <InputGroup>
        <SchoolLevelWrapper>
          <SchoolLevelRadioGroup>
            {["초등학교", "중학교", "고등학교"].map((level) => (
              <RadioLabel key={level}>
                <RadioInput
                  type="radio"
                  name="level"
                  value={level}
                  checked={schoolData.level === level}
                  onChange={handleSchoolLevelChange}
                />
                {level}
              </RadioLabel>
            ))}
          </SchoolLevelRadioGroup>
        </SchoolLevelWrapper>
      </InputGroup>

      <InputGroup>
        <InputWrapper>
          <Icon><MdOutlineSchool /></Icon>
          <Input
            type="text"
            name="schoolName"
            placeholder="학교를 검색해주세요"
            value={schoolData.schoolName}
            readOnly
          />
          <CheckButton
            type="button"
            onClick={() => setIsModalOpen(true)}
            disabled={!schoolData.level}
          >
            <MdSearch /> 검색
          </CheckButton>
        </InputWrapper>
      </InputGroup>

      {majorList.length > 0 && (
        <InputGroup>
          <InputWrapper>
            <Icon><MdOutlineSchool /></Icon>
            <Select
              name="majorName"
              value={schoolData.majorName}
              onChange={handleMajorChange}
              disabled={!schoolData.schoolName}
            >
              <option value="">학과를 선택하세요</option>
              {majorList.map((major) => (
                <option key={major} value={major}>{major}</option>
              ))}
            </Select>
          </InputWrapper>
        </InputGroup>
      )}

      <InputGroup>
        <GradeClassWrapper>
          <SelectWrapper>
            <Select name="grade" value={schoolData.grade} onChange={handleGradeChange} disabled={!schoolData.schoolName || (majorList.length > 0 && !schoolData.majorName)}>
              <option value="">학년 선택</option>
              {gradeOptions.map((g) => (
                <option key={g} value={g}>{g}학년</option>
              ))}
            </Select>
          </SelectWrapper>
          <SelectWrapper>
            <Select name="classNo" value={schoolData.classNo} onChange={handleChange} disabled={!schoolData.grade}>
              <option value="">반 선택</option>
              {classList.map((c) => (
                <option key={c} value={c}>{c}반</option>
              ))}
            </Select>
          </SelectWrapper>
        </GradeClassWrapper>
      </InputGroup>

      <SchoolSearchModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelect={handleSchoolSelect}
        schoolLevel={schoolData.level}
      />
    </>
  );
};

export default SchoolSelector;

// --- Styled Components ---
const InputGroup = styled.div`
  margin-bottom: 20px;
`;

const InputWrapper = styled.div`
  display: flex;
  align-items: center;
  border: 1px solid #ddd;
  border-radius: 5px;
  padding: 10px;
  background-color: #f9f9f9;
`;

const Icon = styled.span`
  color: #999;
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Input = styled.input`
  border: none;
  outline: none;
  flex: 1;
  padding: 0 12px;
  font-size: 1rem;
  color: #333;
  background-color: transparent;
`;

const Select = styled.select`
  border: none;
  outline: none;
  flex: 1;
  padding: 0 12px;
  font-size: 1rem;
  color: var(--text-primary);
  background-color: transparent;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
`;

const CheckButton = styled.button`
  display: flex;
  align-items: center;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  white-space: nowrap;
  cursor: pointer;
  background-color: var(--primary-color);
`;

const SchoolLevelWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 10px 16px;
  margin-bottom: 15px;
`;

const SchoolLevelRadioGroup = styled.div`
  display: flex;
  gap: 54px;
`;

const RadioLabel = styled.label`
  display: flex;
  align-items: center;
  cursor: pointer;
`;

const RadioInput = styled.input`
  position: relative;
  margin-right: 8px;
  appearance: none;
  width: 20px;
  height: 20px;
  border: 1px solid #ddd;
  border-radius: 50%;
  &:checked {
    border-color: var(--primary-color);
  }
  &:checked::before {
    content: "";
    display: block;
    width: 10px;
    height: 10px;
    background-color: var(--primary-color);
    border-radius: 50%;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
`;

const GradeClassWrapper = styled.div`
  display: flex;
  gap: 8px;
`;

const SelectWrapper = styled(InputWrapper)`
  flex: 1;
  margin-bottom: 0;
  padding: 0; 
  select {
    padding: 10px;
    width: 100%;
  }
`;