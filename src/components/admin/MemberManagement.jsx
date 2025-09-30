import React, { useState } from "react";
import styled, { css } from "styled-components";
import { BiSearch } from "react-icons/bi";
import { FaChevronRight } from "react-icons/fa6";
import { gsap } from "gsap";

// --- 더미 데이터 (생략) ---
const initialMemberData = [
  {
    no: 1,
    name: "홍길동",
    school: "이화여자대학교사범대학부속이화금란고등학교", // 고등학교
    phone: "010-1234-1234",
    dob: "2008.12.12",
    grade: 1,
    class: 2,
    points: "15,000P",
  },
  {
    no: 2,
    name: "김철수",
    school: "서울대학교사범대학부속고등학교", // 고등학교
    phone: "010-5678-5678",
    dob: "2008.01.01",
    grade: 1,
    class: 3,
    points: "12,000P",
  },
  {
    no: 3,
    name: "이영희",
    school: "고려대학교사범대학부속고등학교", // 고등학교
    phone: "010-9012-9012",
    dob: "2007.05.20",
    grade: 2,
    class: 1,
    points: "20,000P",
  },
  {
    no: 4,
    name: "박민수",
    school: "연세대학교사범대학부속중학교", // ⭐️ 중학교 추가 예시
    phone: "010-3456-3456",
    dob: "2007.11.30",
    grade: 2,
    class: 4,
    points: "18,000P",
  },
  {
    no: 5,
    name: "최지은",
    school: "성균관대학교사범대학부속초등학교", // ⭐️ 초등학교 추가 예시
    phone: "010-7890-7890",
    dob: "2006.03.15",
    grade: 3,
    class: 2,
    points: "25,000P",
  },
  {
    no: 6,
    name: "정우진",
    school: "한양대학교사범대학부속고등학교", // 고등학교
    phone: "010-2109-2109",
    dob: "2006.09.25",
    grade: 3,
    class: 3,
    points: "16,000P",
  },
];

const searchOptions = [
  { key: "name", label: "이름" },
  { key: "email", label: "이메일" },
  { key: "school", label: "학교명" },
];

const formatPhoneNumber = (value) => {
  if (!value) return "";

  // 숫자만 남기고 '-' 제거
  const cleaned = ("" + value).replace(/\D/g, "");

  // 010-XXXX-XXXX 형식으로 포맷팅
  const match = cleaned.match(/^(\d{3})(\d{4})(\d{4})$/);
  if (match) {
    return `${match[1]}-${match[2]}-${match[3]}`;
  }

  // 입력 중일 때 (예: 010-1234) 부분적으로 포맷팅
  if (cleaned.length > 3 && cleaned.length <= 7) {
    return cleaned.replace(/^(\d{3})(\d{1,4})$/, "$1-$2");
  }
  if (cleaned.length > 7 && cleaned.length <= 11) {
    return cleaned.replace(/^(\d{3})(\d{4})(\d{1,4})$/, "$1-$2-$3");
  }

  return cleaned;
};

const MemberManagement = () => {
  const [memberData, setMemberData] = useState(initialMemberData);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchBy, setSearchBy] = useState(searchOptions[0]);
  const [editingMemberNo, setEditingMemberNo] = useState(null);

  const handleEdit = (memberNo) => {
    setEditingMemberNo(editingMemberNo === memberNo ? null : memberNo);
  };

  // phone 필드 최대 길이 및 grade 필드 학교별 제한 추가
  const handleInputChange = (memberNo, field, value) => {
    let newValue = value;
    const currentMember = memberData.find((m) => m.no === memberNo);

    if (!currentMember) return;

    if (field === "phone") {
      const cleaned = ("" + value).replace(/\D/g, "");

      if (cleaned.length > 11) {
        newValue = formatPhoneNumber(value.slice(0, 13));
      } else {
        newValue = formatPhoneNumber(value);
      }
    } else if (field === "grade" || field === "class") {
      const parsedValue = parseInt(value);

      // 입력값이 숫자가 아니거나 1 미만이면 무시하거나 빈 값으로 설정
      if (isNaN(parsedValue) || parsedValue < 1) {
        newValue = value === "" ? "" : 1; // 빈 문자열 허용 (입력 중)
      } else {
        let maxGrade = 10; // 기본값 (반에 대한 제한은 없음)

        if (field === "grade") {
          // 학교명에 따른 학년 최대값 설정
          if (currentMember.school.includes("초등학교")) {
            maxGrade = 6;
          } else if (
            currentMember.school.includes("중학교") ||
            currentMember.school.includes("고등학교")
          ) {
            maxGrade = 3;
          }

          // 최대값 초과 시 입력 제한
          if (parsedValue > maxGrade) {
            newValue = maxGrade;
          } else {
            newValue = parsedValue;
          }
        } else {
          // 'class' 필드 처리
          newValue = parsedValue;
        }
      }
    }

    setMemberData((prevData) =>
      prevData.map((member) =>
        member.no === memberNo ? { ...member, [field]: newValue } : member,
      ),
    );
  };

  const handleSave = () => {
    alert("수정된 내용이 저장되었습니다.");
    setEditingMemberNo(null);
  };

  const handleCancel = () => {
    // 실제로는 취소 시 이전 상태로 memberData를 롤백.
    setEditingMemberNo(null);
  };

  const handleDelete = (memberNo, targetRef) => {
    if (!window.confirm(`NO.${memberNo} 회원을 정말 삭제하시겠습니까?`)) {
      return;
    }

    gsap.to(targetRef, {
      opacity: 0,
      height: 0,
      paddingTop: 0,
      paddingBottom: 0,
      marginTop: 0,
      marginBottom: 0,
      duration: 0.5,
      ease: "power2.inOut",
      onComplete: () => {
        setMemberData((prev) =>
          prev.filter((member) => member.no !== memberNo),
        );
      },
    });
  };

  const handleSelectSearchBy = (option) => {
    setSearchBy(option);
    setIsDropdownOpen(false);
  };

  return (
    <>
      <PageTitle>학생 정보</PageTitle>
      <SearchBarContainer>
        <NameDropdown>
          <DropdownToggle onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
            {searchBy.label}
            <DropdownIcon $isOpen={isDropdownOpen} size="0.75rem" />
          </DropdownToggle>
          <DropdownList $isOpen={isDropdownOpen}>
            {searchOptions.map((option) => (
              <DropdownItem
                key={option.key}
                onClick={() => handleSelectSearchBy(option)}
              >
                {option.label}
              </DropdownItem>
            ))}
          </DropdownList>
        </NameDropdown>

        <SearchBar>
          <Input placeholder={`${searchBy.label}을(를) 입력하세요`} />
          <SearchButton>
            <BiSearch size="1.75rem" />
          </SearchButton>
        </SearchBar>
      </SearchBarContainer>

      <Table>
        <thead>
          <tr>
            <Th>NO</Th>
            <Th>이름</Th>
            <Th>학교</Th>
            <Th>연락처</Th>
            <Th>생년월일</Th>
            <Th>학년</Th>
            <Th>반</Th>
            <Th>보유 포인트</Th>
            <Th></Th>
          </tr>
        </thead>
        <tbody>
          {memberData.map((member) => {
            const isEditing = editingMemberNo === member.no;
            return (
              <TrFade key={member.no} ref={(el) => el && (member.ref = el)}>
                <Td>{member.no}</Td>
                <Td>{member.name}</Td>
                <Td>{member.school}</Td>

                {/* 연락처 수정 필드 */}
                <EditableTd $isEditing={isEditing}>
                  {isEditing ? (
                    <EditInput
                      type="tel"
                      value={member.phone}
                      onChange={(e) =>
                        handleInputChange(member.no, "phone", e.target.value)
                      }
                      $isPhone
                    />
                  ) : (
                    member.phone
                  )}
                </EditableTd>

                <Td>{member.dob}</Td>

                {/* 학년 수정 필드 */}
                <EditableTd $isEditing={isEditing}>
                  {isEditing ? (
                    <EditInput
                      type="number"
                      min="1"
                      // max 속성은 동적 유효성 검사 로직으로 대체되었음
                      value={member.grade}
                      onChange={(e) =>
                        handleInputChange(member.no, "grade", e.target.value)
                      }
                      $isNumber
                    />
                  ) : (
                    member.grade
                  )}
                </EditableTd>

                {/* 반 수정 필드 */}
                <EditableTd $isEditing={isEditing}>
                  {isEditing ? (
                    <EditInput
                      type="number"
                      min="1"
                      max="10"
                      value={member.class}
                      onChange={(e) =>
                        handleInputChange(member.no, "class", e.target.value)
                      }
                      $isNumber
                    />
                  ) : (
                    member.class
                  )}
                </EditableTd>

                <Td>{member.points}</Td>
                <Td>
                  {isEditing ? (
                    <>
                      <Button $primary onClick={handleSave}>
                        저장
                      </Button>
                      <Button $delete onClick={handleCancel}>
                        취소
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button $primary onClick={() => handleEdit(member.no)}>
                        수정
                      </Button>
                      <Button
                        $delete
                        onClick={() => handleDelete(member.no, member.ref)}
                      >
                        삭제
                      </Button>
                    </>
                  )}
                </Td>
              </TrFade>
            );
          })}
        </tbody>
      </Table>
      <Pagination>
        <PageNumber $active>1</PageNumber>
        <PageNumber>2</PageNumber>
        <PageNumber>3</PageNumber>
        <PageNumber>4</PageNumber>
        <PageNumber>5</PageNumber>
        <PageNumber>▶</PageNumber>
      </Pagination>
    </>
  );
};

export default MemberManagement;

const Button = styled.button`
  padding: 0.3125rem 0.625rem;
  margin: 0 0.125rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  cursor: pointer;
  transition:
    background-color 0.2s,
    border-color 0.2s;

  border: none;

  ${(props) =>
    props.$primary &&
    css`
      background-color: #ffcc00;
      color: #191919;
      border: none;
      &:hover {
        background-color: #e6b800;
      }
    `}

  ${(props) =>
    props.$delete &&
    css`
      background-color: #ffffff;
      color: #191919;
      border: 1px solid #ffcc00;
      &:hover {
        background-color: #f7f7f7;
      }
    `}
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 1.875rem;
`;

const PageNumber = styled.span`
  display: inline-block;
  padding: 0.3125rem 0.625rem;
  margin: 0 0.3125rem;
  border: 1px solid #e0e0e0;
  border-radius: 0.25rem;
  cursor: pointer;

  ${(props) =>
    props.$active &&
    css`
      background-color: #303030;
      color: #fff;
      border-color: #303030;
    `}
`;

const SearchBarContainer = styled.div`
  margin-bottom: 1.25rem;
  display: flex;
  align-items: flex-start;
`;

const NameDropdown = styled.div`
  position: relative;
  display: inline-block;
  margin-right: 0.9375rem;
`;

const DropdownList = styled.div`
  position: absolute;
  top: calc(100% + 0.625rem);
  left: 0;
  background-color: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 0.5rem;
  z-index: 10;
  min-width: 11rem;
  box-shadow: 0 0.25rem 0.75rem rgba(0, 0, 0, 0.1);
  display: ${(props) => (props.$isOpen ? "block" : "none")};
`;

const DropdownItem = styled.div`
  padding: 0.625rem 1rem;
  cursor: pointer;
  color: #191919;
  font-size: 0.875rem;

  &:hover {
    background-color: #f7f7f7;
  }
`;

const DropdownToggle = styled.button`
  width: 11rem;
  height: 3.25rem;
  display: flex;
  justify-content: space-between;
  align-items: center;

  background-color: #ffffff;
  border: 1px solid #e0e0e0;
  padding: 0 1rem;
  border-radius: 0.5rem;
  cursor: pointer;
  color: #191919;
  font-size: 1rem;
  font-weight: 500;
`;

const DropdownIcon = styled(FaChevronRight)`
  margin-left: 0.5rem;
  transition: transform 0.3s ease-in-out;
  transform: rotate(${(props) => (props.$isOpen ? "90deg" : "0deg")});
`;

const SearchBar = styled.div`
  width: 26.875rem;
  height: 3.25rem;
  display: flex;
  align-items: center;

  background-color: #ffffff;
  border: 1px solid #e0e0e0;
  padding: 0 0.5rem;
  border-radius: 0.5rem;
  margin-bottom: 0.625rem;
`;

const Input = styled.input`
  flex-grow: 1;
  padding: 0.5rem;
  border: none;
  background-color: transparent;
  color: #191919;
  font-size: 1rem;

  &:focus {
    outline: none;
  }

  &::placeholder {
    color: #191919;
    opacity: 0.5;
  }
`;

const SearchButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: #191919;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 1.25rem;
  font-size: 0.875rem;
`;

const Th = styled.th`
  background-color: #f7f7f7;
  border: 1px solid #e0e0e0;
  padding: 0.625rem;
  text-align: center;
`;

const Td = styled.td`
  border: 1px solid #e0e0e0;
  padding: 0.625rem;
  text-align: center;
  vertical-align: middle;
`;

const EditableTd = styled(Td)`
  ${(props) =>
    props.$isEditing &&
    css`
      display: table-cell;
      padding: 0.3125rem;
    `}
`;

const EditInput = styled.input`
  width: auto;
  min-width: 3rem;
  max-width: 100%;

  height: 2rem;
  padding: 0.25rem 0.5rem;
  border: 1px solid #e0e0e0;
  border-radius: 0.25rem;
  font-size: 0.875rem;
  text-align: center;
  box-sizing: border-box;
  color: #191919;

  &:focus {
    border-color: #ffcc00;
    outline: none;
  }

  ${(props) =>
    props.$isNumber &&
    css`
      width: 2.5rem;
      min-width: 2.5rem;
      max-width: 3.5rem;
    `}

  ${(props) =>
    props.$isPhone &&
    css`
      width: 9.375rem;
      min-width: 9.375rem;
    `}
`;

const PageTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: normal;
  margin-bottom: 1.25rem;
`;

const TrFade = styled.tr``;
