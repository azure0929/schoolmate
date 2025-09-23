import React, { useState } from "react";
import styled, { css } from "styled-components";
import { FaRegUser } from "react-icons/fa";
import {
  MdOutlineEmail,
  MdLockOutline,
  MdOutlinePermContactCalendar,
  MdOutlinePhone,
  MdOutlineSchool,
  MdSearch,
} from "react-icons/md";

const SignUpContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 480px;
  margin: 0 auto;
  padding: 76px 0;
  min-height: 100vh;
  background-color: #ffffff;
`;

const FormBox = styled.div`
  max-width: 600px;
  width: 100%;
  text-align: center;
  .input-wrap {
    margin-bottom: 40px;
  }
`;

const Title = styled.h2`
  font-size: 2.5rem;
  font-weight: 600;
  margin-bottom: 8px;
`;

const Subtitle = styled.p`
  margin-bottom: 30px;
`;

const RequiredSection = styled.div`
  font-size: 1.875rem;
  margin-bottom: 20px;
  font-weight: 600;
`;

const InputWrapper = styled.div`
  display: flex;
  align-items: center;
  border: 1px solid #ddd;
  border-radius: 5px;
  margin-bottom: 12px;
  padding: 10px;
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
  color: var(--text-color);
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

const GenderButtonWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 12px;
`;

const GenderButton = styled.button`
  flex: 1;
  background-color: #fff;
  color: #555;
  border: 1px solid #ddd;
  padding: 15px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.2s;

  ${(props) =>
    props.selected &&
    css`
      background-color: var(--primary-color);
      color: white;
      border-color: var(--primary-color);
    `}
`;

const PhoneInputWrapper = styled.div`
  display: flex;
  align-items: center;
`;
const PhoneInputBox = styled(InputWrapper)`
  flex: 1;
  margin-bottom: 0;
`;
const NoPhoneRadio = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
  margin-left: 10px;
  padding: 8px 0;

  input {
    margin-right: 6px;
  }
  label {
    white-space: nowrap;
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
  gap: 16px;
  margin-bottom: 16px;
`;

const GradeClassInputBox = styled(InputWrapper)`
  flex: 1;
  margin-bottom: 0;
`;

const NextButton = styled.button`
  width: 100%;
  background-color: var(--primary-color);
  color: white;
  border: none;
  padding: 16px;
  font-weight: bold;
  border-radius: 8px;
  cursor: pointer;
`;

const SearchIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  color: #ffffff;
`;

const SignUpForm = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    birthdate: "",
    gender: "",
    phoneNumber: "",
    hasPhoneNumber: true,
    schoolLevel: "",
    school: "",
    grade: "",
    class: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleGenderChange = (gender) => {
    setFormData({ ...formData, gender });
  };

  const handleSchoolLevelChange = (e) => {
    setFormData({ ...formData, schoolLevel: e.target.value });
  };

  const handlePhoneNumberToggle = (hasPhoneNumber) => {
    setFormData({ ...formData, hasPhoneNumber, phoneNumber: "" });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form Data Submitted:", formData);
  };

  return (
    <SignUpContainer>
      <FormBox>
        <Title>회원가입</Title>
        <Subtitle>자세한 학교 정보를 알고 싶다면 입력해주세요!</Subtitle>
        <RequiredSection>필수 항목</RequiredSection>

        <form onSubmit={handleSubmit}>
          <div className="input-wrap">
            <InputWrapper>
              <Icon>
                <MdOutlineEmail />
              </Icon>
              <Input
                type="email"
                name="email"
                placeholder="이메일"
                value={formData.email}
                onChange={handleChange}
              />
              <CheckButton>중복확인</CheckButton>
            </InputWrapper>
            <InputWrapper>
              <Icon>
                <MdLockOutline />
              </Icon>
              <Input
                type="password"
                name="password"
                placeholder="비밀번호"
                value={formData.password}
                onChange={handleChange}
              />
            </InputWrapper>
            <InputWrapper>
              <Icon>
                <MdLockOutline />
              </Icon>
              <Input
                type="password"
                name="confirmPassword"
                placeholder="비밀번호 확인"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </InputWrapper>
          </div>
          <div className="input-wrap">
            <InputWrapper>
              <Icon>
                <FaRegUser />
              </Icon>
              <Input
                type="text"
                name="name"
                placeholder="이름"
                value={formData.name}
                onChange={handleChange}
              />
            </InputWrapper>
            <InputWrapper>
              <Icon>
                <MdOutlinePermContactCalendar />
              </Icon>
              <Input
                type="date"
                name="birthdate"
                placeholder="생년월일"
                value={formData.birthdate}
                onChange={handleChange}
              />
            </InputWrapper>

            <GenderButtonWrapper>
              <GenderButton
                type="button"
                selected={formData.gender === "남자"}
                onClick={() => handleGenderChange("남자")}
              >
                남자
              </GenderButton>
              <GenderButton
                type="button"
                selected={formData.gender === "여자"}
                onClick={() => handleGenderChange("여자")}
              >
                여자
              </GenderButton>
            </GenderButtonWrapper>

            <PhoneInputWrapper>
              <PhoneInputBox>
                <Icon>
                  <MdOutlinePhone />
                </Icon>
                <Input
                  type="tel"
                  name="phoneNumber"
                  placeholder="휴대전화번호"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  disabled={!formData.hasPhoneNumber}
                />
              </PhoneInputBox>
              <NoPhoneRadio
                onClick={() =>
                  handlePhoneNumberToggle(!formData.hasPhoneNumber)
                }
              >
                <input
                  type="radio"
                  checked={!formData.hasPhoneNumber}
                  onChange={() => {}}
                />
                <label>없음</label>
              </NoPhoneRadio>
            </PhoneInputWrapper>
          </div>

          <SchoolLevelWrapper>
            <SchoolLevelRadioGroup>
              <RadioLabel>
                <RadioInput
                  type="radio"
                  name="schoolLevel"
                  value="초등학교"
                  checked={formData.schoolLevel === "초등학교"}
                  onChange={handleSchoolLevelChange}
                />
                초등학교
              </RadioLabel>
              <RadioLabel>
                <RadioInput
                  type="radio"
                  name="schoolLevel"
                  value="중학교"
                  checked={formData.schoolLevel === "중학교"}
                  onChange={handleSchoolLevelChange}
                />
                중학교
              </RadioLabel>
              <RadioLabel>
                <RadioInput
                  type="radio"
                  name="schoolLevel"
                  value="고등학교"
                  checked={formData.schoolLevel === "고등학교"}
                  onChange={handleSchoolLevelChange}
                />
                고등학교
              </RadioLabel>
            </SchoolLevelRadioGroup>
          </SchoolLevelWrapper>

          <InputWrapper>
            <Icon>
              <MdOutlineSchool />
            </Icon>
            <Input
              type="text"
              name="school"
              placeholder="학교"
              value={formData.school}
              onChange={handleChange}
            />
            <CheckButton>
              <SearchIcon>
                <MdSearch />
              </SearchIcon>{" "}
              검색
            </CheckButton>
          </InputWrapper>

          <GradeClassWrapper>
            <GradeClassInputBox>
              <Input
                type="text"
                name="grade"
                placeholder="학년"
                value={formData.grade}
                onChange={handleChange}
              />
            </GradeClassInputBox>
            <GradeClassInputBox>
              <Input
                type="text"
                name="class"
                placeholder="반"
                value={formData.class}
                onChange={handleChange}
              />
            </GradeClassInputBox>
          </GradeClassWrapper>

          <NextButton type="submit">다음</NextButton>
        </form>
      </FormBox>
    </SignUpContainer>
  );
};

export default SignUpForm;
