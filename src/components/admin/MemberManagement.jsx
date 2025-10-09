import React, { useState, useEffect } from "react";
import styled, { css } from "styled-components";
import { BiSearch } from "react-icons/bi";
import { FaChevronRight } from "react-icons/fa6";
import { gsap } from "gsap";
import api from "@/api/index";
import PaginationControls from "@/components/common/PaginationControls";

const searchOptions = [
  { key: "name", label: "이름" },
  { key: "phone", label: "연락처" },
  { key: "school", label: "학교명" },
];

const formatPhoneNumber = (value) => {
  if (!value) return "";
  const cleaned = ("" + value).replace(/\D/g, "");
  const match = cleaned.match(/^(\d{3})(\d{4})(\d{4})$/);
  if (match) return `${match[1]}-${match[2]}-${match[3]}`;
  if (cleaned.length > 3 && cleaned.length <= 7)
    return cleaned.replace(/^(\d{3})(\d{1,4})$/, "$1-$2");
  if (cleaned.length > 7 && cleaned.length <= 11)
    return cleaned.replace(/^(\d{3})(\d{4})(\d{1,4})$/, "$1-$2-$3");
  return cleaned;
};

// 포인트 포맷팅 함수: 화면 표시에만 사용 (숫자 -> 문자열)
const formatPointsDisplay = (value) => {
  // value가 이미 문자열 ("1,000P")일 경우를 대비해 숫자 부분만 추출
  const cleaned = String(value).replace(/[,\sP]/g, "");

  if (cleaned === "" || isNaN(parseInt(cleaned, 10))) {
    return "0P";
  }

  return `${parseInt(cleaned, 10).toLocaleString()}P`;
};

// 포인트 입력 처리 함수: 입력값에서 숫자만 남기고 반환 (문자열)
const formatPointsInput = (value) => {
  // 쉼표, 'P', 공백을 제거하고 숫자와 '-'만 남김
  const cleaned = String(value).replace(/[,\sP]/g, "");

  // 비어있거나, 숫자가 아닌 문자가 포함되면 필터링
  if (cleaned === "") return "";

  // 숫자만 있는 경우에만 포맷팅하여 반환
  if (/^-?\d*$/.test(cleaned)) {
    // 입력 중 포맷팅을 위해 toLocaleString은 사용하지 않고, 숫자만 있는 문자열 반환
    return cleaned;
  }

  return cleaned.replace(/[^-?\d]/g, "");
};

const MemberManagement = () => {
  const [memberData, setMemberData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const ITEMS_PER_PAGE = 6; // 페이지당 6명 유지

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchBy, setSearchBy] = useState(searchOptions[0]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingMemberNo, setEditingMemberNo] = useState(null);

  // 검색 결과의 총 요소 수 상태 추가 (NO 계산을 위해 필요)
  const [totalElements, setTotalElements] = useState(0);

  // 수정: 페이지 변경 시 검색 조건 유지
  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchMembers(page, searchBy.key, searchTerm);
  };

  useEffect(() => {
    // 초기 로드시 현재 검색 조건(초기값)으로 1페이지 로드
    fetchMembers(currentPage, searchBy.key, searchTerm);
  }, []);

  // 수정: 검색 조건(searchKey, searchValue)을 인자로 받는 fetchMembers
  const fetchMembers = async (
    page,
    searchKey = searchBy.key,
    searchValue = searchTerm,
  ) => {
    setIsLoading(true);

    // totalPageCount 변수를 함수 스코프 최상단에 선언 및 초기화
    let totalPageCount = 1;
    let totalCount = 0; // totalElements 대신 totalCount를 사용하여 명확성 확보

    // 연락처 검색의 경우 하이픈 제거
    let finalSearchValue = searchValue.trim();
    if (searchKey === "phone") {
      finalSearchValue = finalSearchValue.replace(/-/g, "");
    }

    // 검색어가 있을 경우에만 검색 조건을 API 파라미터에 추가
    const searchParams =
      finalSearchValue && searchKey
        ? { [searchKey]: finalSearchValue } // 예: { name: "홍길동" }
        : {};

    try {
      const response = await api.get("/api/admin/students", {
        params: {
          page: page - 1, // 백엔드는 0부터 시작
          size: ITEMS_PER_PAGE, // 페이지당 6개 요청
          ...searchParams,
        },
      });

      const responseData = response.data;
      let memberList = [];

      if (responseData && Array.isArray(responseData.content)) {
        // 백엔드가 Page 객체를 반환하는 경우
        memberList = responseData.content;
        totalPageCount = responseData.totalPages || 1;
        totalCount = responseData.totalElements || 0;
      } else if (responseData && Array.isArray(responseData)) {
        // 백엔드가 List만 반환하는 경우 (이 경우 페이징 기능이 불안정함)
        memberList = responseData;
        totalPageCount = Math.ceil(memberList.length / ITEMS_PER_PAGE) || 1;
        totalCount = memberList.length;
      } else {
        console.warn(
          "API 응답이 예상한 Page 또는 List 구조가 아닙니다.",
          responseData,
        );
        memberList = [];
      }

      // ⭐️ 성공 시 페이지 정보 업데이트
      setTotalPages(totalPageCount);
      setTotalElements(totalCount);

      const formattedData = memberList.map((item) => ({
        no: item.studentId,
        name: item.name,
        school: item.schoolName,
        phone: formatPhoneNumber(item.phone),
        dob: item.birthDay,
        grade: item.grade,
        class: item.classNo,
        points: item.pointBalance,
        ref: null,
      }));

      setMemberData(formattedData);
    } catch (error) {
      console.error("학생 목록 조회 실패:", error);
      alert("학생 목록을 불러오는 중 오류가 발생했습니다.");
      setMemberData([]);

      // ⭐️ 오류 발생 시 페이지 정보 초기화
      setTotalPages(1);
      setTotalElements(0);
    } finally {
      setIsLoading(false);
    }
  };

  // 검색 실행 함수 구현
  const handleSearch = () => {
    // 검색 시 항상 1페이지로 돌아가도록 설정
    setCurrentPage(1);
    fetchMembers(1, searchBy.key, searchTerm);
  };

  const handleEdit = (memberNo) => {
    setEditingMemberNo(editingMemberNo === memberNo ? null : memberNo);
  };

  const handleInputChange = (memberNo, field, value) => {
    let newValue = value;
    const currentMember = memberData.find((m) => m.no === memberNo);

    if (!currentMember) return;

    // 수정된 학년 및 반 처리 로직
    if (field === "grade" || field === "class") {
      // 변수를 블록 내부에서 선언하고 사용합니다.
      const parsedValue = parseInt(value, 10); // 10진수로 파싱

      if (isNaN(parsedValue) || parsedValue < 1) {
        newValue = value === "" ? "" : 1;
      } else {
        let maxGrade = 10;

        if (field === "grade") {
          if (currentMember.school.includes("초등학교")) {
            maxGrade = 6;
          } else if (
            currentMember.school.includes("중학교") ||
            currentMember.school.includes("고등학교")
          ) {
            maxGrade = 3;
          }

          if (parsedValue > maxGrade) {
            newValue = maxGrade;
          } else {
            newValue = parsedValue;
          }
        } else {
          // class 필드
          newValue = parsedValue;
        }
      }
    } else if (field === "points") {
      newValue = formatPointsInput(value);
    } else if (field === "phone") {
      newValue = formatPhoneNumber(value);
    }

    setMemberData((prevData) =>
      prevData.map((member) =>
        member.no === memberNo ? { ...member, [field]: newValue } : member,
      ),
    );
  };

  const handleSave = async (memberNo) => {
    const memberToUpdate = memberData.find((m) => m.no === memberNo);
    if (!memberToUpdate) return;

    // 저장된 points 값(숫자 문자열)을 targetPoints(숫자)로 변환
    const targetPoints = parseInt(memberToUpdate.points, 10);
    const targetPointsValue = isNaN(targetPoints) ? 0 : targetPoints;

    const updatePayload = {
      // 이름, 연락처, 포인트는 수정 입력창이 없으므로 기존 데이터를 그대로 전송
      name: memberToUpdate.name,
      phone: memberToUpdate.phone.replace(/-/g, ""),
      points: targetPointsValue,

      // 학년, 반만 사용자 입력값으로 업데이트 (숫자 타입으로 전송)
      grade: parseInt(memberToUpdate.grade, 10),
      classNo: parseInt(memberToUpdate.class, 10),
    };

    try {
      const response = await api.put(
        `/api/admin/students/${memberNo}/profile`,
        updatePayload,
      );

      const updatedProfile = response.data;

      setMemberData((prevData) =>
        prevData.map((member) =>
          member.no === memberNo
            ? {
                ...member,
                name: updatedProfile.name,
                school: updatedProfile.schoolName,
                phone: formatPhoneNumber(updatedProfile.phone),
                dob: updatedProfile.birthDay,
                grade: updatedProfile.grade,
                class: updatedProfile.classNo,
                points: updatedProfile.pointBalance,
              }
            : member,
        ),
      );

      alert(`NO.${memberNo} 회원의 수정된 내용이 저장되었습니다.`);
      setEditingMemberNo(null);
    } catch (error) {
      console.error("회원 정보 저장 오류:", error);
      alert(
        `회원 정보 저장 중 오류가 발생했습니다: ${error.response?.data?.message || error.message}`,
      );
    }
  };

  // 수정: 취소 시 검색 조건 유지
  const handleCancel = () => {
    setEditingMemberNo(null);
    fetchMembers(currentPage, searchBy.key, searchTerm);
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
        fetchMembers(currentPage, searchBy.key, searchTerm); // 삭제 후 현재 페이지/검색어로 재로드
      },
    });
  };

  const handleSelectSearchBy = (option) => {
    setSearchBy(option);
    setIsDropdownOpen(false);
    setSearchTerm(""); // 검색 기준 변경 시 검색어 초기화
  };

  if (isLoading) {
    return <PageTitle>데이터 로딩 중...</PageTitle>;
  }

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
          {/* Input에 value와 onChange 연결 */}
          <Input
            placeholder={`${searchBy.label}을(를) 입력하세요`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleSearch(); // 엔터키로 검색 실행
              }
            }}
          />
          <SearchButton onClick={handleSearch}>
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
          {/* 임시 방편: 백엔드 응답이 잘못되었을 경우, 프론트에서 6개만 잘라 출력.
                근본적으로는 백엔드가 size=6에 맞춰 응답해야 합니다. */}
          {memberData.slice(0, ITEMS_PER_PAGE).map((member, index) => {
            const isEditing = editingMemberNo === member.no;
            // 순번 계산 로직: 현재 페이지의 시작 순번 + 테이블 내 현재 인덱스
            const displayNo = (currentPage - 1) * ITEMS_PER_PAGE + index + 1;

            return (
              <TrFade key={member.no} ref={(el) => (member.ref = el)}>
                <Td>{displayNo}</Td>

                <Td>{member.name}</Td>

                <Td>{member.school}</Td>

                <Td>{member.phone}</Td>

                <Td>{member.dob}</Td>

                {/* 학년: 수정 가능 필드 */}
                <EditableTd $isEditing={isEditing}>
                  {isEditing ? (
                    <EditInput
                      type="number"
                      min="1"
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

                {/* 반: 수정 가능 필드 */}
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

                <Td>{formatPointsDisplay(member.points)}</Td>

                <Td>
                  {isEditing ? (
                    <>
                      <Button $primary onClick={() => handleSave(member.no)}>
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

      {/* PaginationControls 컴포넌트 적용 */}
      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
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
