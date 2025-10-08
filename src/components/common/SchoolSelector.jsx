import React, { useState, useEffect, useMemo } from "react";
import styled from "styled-components";
import api from "@/api";
import SchoolSearchModal from "@/components/modals/SchoolSearchModal";
import { MdSearch, MdOutlineSchool } from "react-icons/md";

const SchoolSelector = ({ schoolData, onSchoolChange }) => {
  const [majorList, setMajorList] = useState([]);
  const [classList, setClassList] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [selectedSchool, setSelectedSchool] = useState(schoolData || {});

  useEffect(() => {
  setSelectedSchool(schoolData);
}, [schoolData]);

  const gradeOptions = useMemo(() => {
    if (schoolData.level === "초등학교") return [1, 2, 3, 4, 5, 6];
    if (schoolData.level === "중학교" || schoolData.level === "고등학교") return [1, 2, 3];
    return [];
  }, [schoolData.level]);

  useEffect(() => {
    if (!schoolData.schoolCode || schoolData.level !== "고등학교") {
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
  }, [schoolData.schoolCode, schoolData.scCode, schoolData.level]);

  useEffect(() => {
    if (!schoolData.schoolCode || !schoolData.grade) {
      setClassList([]);
      return;
    }
    const fetchClasses = async () => {
      const params = {
        educationOfficeCode: schoolData.scCode,
        schoolCode: schoolData.schoolCode,
        grade: schoolData.grade,
        schoolLevel: schoolData.level,
      };
      if (schoolData.level === "고등학교") {
        if (schoolData.majorName) {
          params.majorName = schoolData.majorName;
        } else {
          setClassList([]);
          return;
        }
      }
      try {
        const res = await api.get("/school-search/class-info", { params });

        // API 응답 데이터를 프론트엔드에서 사용하기 편한 이름으로 가공
        const processedClassList = res.data.map(cls => ({
          ...cls, // 백엔드 원본 데이터는 그대로 유지하고,
          // '반' 이름을 className 이라는 통일된 이름으로 추가해줍니다.
          className: cls.className || cls.CLASS_NM 
        }));
        setClassList(processedClassList);

      } catch (error) { console.error("반 정보 조회 실패:", error); }
    };
    fetchClasses();
  }, [schoolData]);

  const handleSchoolSelect = (school) => {
    const updated = {
      ...schoolData,
      scCode: school.ATPT_OFCDC_SC_CODE || school.scCode || "",
      schoolCode: school.SD_SCHUL_CODE || school.schoolCode || "",
      schoolName: school.SCHUL_NM || school.schoolName || "",
      grade: "",
      majorName: "",
      classNo: ""
    };

    setSelectedSchool(updated);
    onSchoolChange(updated);
    setIsModalOpen(false);
  };

  const handleSelectChange = (e) => {
    const { name, value } = e.target;
    const updatedData = { ...schoolData, [name]: value };
    if (name === 'grade') {
        updatedData.classNo = ""; // 학년이 바뀌면 반 초기화
    }
    onSchoolChange(updatedData);
  };

  // 학교급(초/중/고) 라디오 버튼을 클릭했을 때 실행됩니다.
  const handleSchoolLevelChange = (e) => {
    // 학교급이 바뀌면, 학교 이름부터 학년, 학과, 반까지 모두 초기화합니다.
    onSchoolChange({
        ...schoolData,
        level: e.target.value,
        scCode: "",
        schoolCode: "",
        schoolName: "",
        grade: "",
        majorName: "",
        classNo: "",
    });
  };
  
  return (
    <Container>
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
                    value={schoolData.schoolName || ""}
                    readOnly
                    onClick={() => setIsModalOpen(true)}
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

        {schoolData.level === "고등학교" && (
            <InputGroup>
                <InputWrapper>
                    <Icon><MdOutlineSchool /></Icon>
                    <Select
                        name="majorName"
                        value={schoolData.majorName || ""}
                        onChange={handleSelectChange}
                        disabled={!schoolData.schoolName}
                    >
                        <option value="">학과를 선택하세요</option>
                        {majorList.map(major => <option key={major} value={major}>{major}</option>)}
                    </Select>
                </InputWrapper>
            </InputGroup>
        )}

        <InputGroup>
            <GradeClassWrapper>
                <SelectWrapper>
                    <Select name="grade" value={schoolData.grade || ""} onChange={handleSelectChange} disabled={!schoolData.schoolName || (schoolData.level === "고등학교" && !schoolData.majorName)}>
                        <option value="">학년 선택</option>
                        {gradeOptions.map(g => <option key={g} value={g}>{g}학년</option>)}
                    </Select>
                </SelectWrapper>
                <SelectWrapper>
                    <Select name="classNo" value={schoolData.classNo || ""} onChange={handleSelectChange} disabled={!schoolData.grade}>
                        <option value="">반 선택</option>
                        {classList.map((cls, index) => {
                          const className = cls.className || cls.class_nm || cls.CLASS_NM;
                          return (
                            <option key={`${className}-${index}`} value={className}>
                              {className}반
                            </option>
                          );
                        })}
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
    </Container>
  );
};

export default SchoolSelector;

// --- Styled Components (전체) ---
const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

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
  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
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