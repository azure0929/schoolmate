import React, { useState } from "react";
import styled from "styled-components";

const EatPhotoModal = ({ isOpen, onClose }) => {
  // isOpen과 onClose props를 받도록 수정
  // 1. 선택된 파일의 URL을 저장할 state를 추가.
  const [selectedImage, setSelectedImage] = useState(null);

  // 2. 파일 입력 변경을 처리하는 함수.
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // FileReader를 사용하여 파일을 읽고 Data URL을 생성.
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result); // 이미지 URL을 state에 저장.
      };
      reader.readAsDataURL(file); // 파일을 Data URL로 읽는다.
    } else {
      setSelectedImage(null); // 파일이 선택되지 않았다면 이미지 URL을 초기화.
    }
  };

  // 모달이 열려있지 않으면 아무것도 렌더링하지 않는다.
  if (!isOpen) return null;

  return (
    <div>
      <ModalOverlay onClick={onClose} />
      <ModalContent>
        {/*
          파일 입력 필드에 onChange 핸들러를 추가하여 파일 선택 시 handleFileChange 함수가 호출되도록 함.
        */}
        <input
          type="file"
          name="eatphoto"
          id="eatphoto"
          style={{ display: "none" }}
          onChange={handleFileChange}
          accept="image/*" // 이미지 파일만 선택하도록 제한
        />

        <div className="eatphoto-upload">
          <FileSelectLabel htmlFor="eatphoto">파일 선택</FileSelectLabel>
        </div>

        {/* 3. selectedImage가 있을 때만 이미지를 렌더링. */}
        <EatPhotoWrap>
          {selectedImage && <img src={selectedImage} alt="Uploaded meal" />}
        </EatPhotoWrap>

        <button className="eatphotosubmit" type="submit">
          제출
        </button>
      </ModalContent>
    </div>
  );
};

export default EatPhotoModal;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 9;
`;

const ModalContent = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 30px;
  border-radius: 36px;
  width: 554px;
  background-color: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;

  .eatphoto-upload {
    display: flex;
    justify-content: flex-end;
    width: 100%;
    padding-right: 20px;
    margin-bottom: 20px;
  }
  .eatphotosubmit {
    display: block;
    margin-top: 40px;
    width: 364px;
    height: 56px;
    border-radius: 12px;
    font-size: 1.375rem;
    color: #f1f1f1;
    background-color: #191919;
    border: none;
    cursor: pointer;
    &:hover {
      background-color: #333;
    }
  }
`;

const FileSelectLabel = styled.label`
  display: inline-block;
  text-align: center;
  line-height: 32px;
  width: 104px;
  height: 32px;
  border-radius: 8px;
  background-color: #d5d5d5;
  color: #000;
  cursor: pointer;
  user-select: none;
  &:hover {
    background-color: #c0c0c0;
  }
`;

const EatPhotoWrap = styled.div`
  margin: 40px auto 0;
  width: 364px;
  height: 278px;
  border: 1px solid #ccc;
  background-color: #eeeeee;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
`;
