import React, {
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
  useState,
} from "react";
import styled from "styled-components";
import { gsap } from "gsap";

/**
 * Toast 알림 컴포넌트
 * @param {object} ref - showToast 함수를 외부에 노출하기 위한 ref
 */
const ToastNotification = forwardRef((props, ref) => {
  const [toast, setToast] = useState(null);
  const toastRef = useRef(null);
  const timerRef = useRef(null);

  // showToast 함수를 외부 (AttendanceConfirmModal)에서 호출 가능하도록 노출
  useImperativeHandle(ref, () => ({
    showToast: (message, type = "success") => {
      // 이미 타이머가 있다면 초기화
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        // GSAP 트윈이 완료되기 전에 새로운 토스트가 호출되면 기존 애니메이션을 중단합니다.
        gsap.killTweensOf(toastRef.current);
      }

      setToast({ message, type });
    },
  }));

  // toast 상태가 변경될 때마다 애니메이션 실행
  useEffect(() => {
    if (!toast) return;

    const toastElement = toastRef.current;

    // x: 100은 토스트가 오른쪽으로 100px 밀려난 위치에서 시작한다는 의미입니다.
    gsap.fromTo(
      toastElement,
      { opacity: 0, x: 100 },
      { opacity: 1, x: 0, duration: 0.5, ease: "power2.out" },
    );

    // 2. 3초 후 사라지는 애니메이션 설정
    timerRef.current = setTimeout(() => {
      // 사라지는 애니메이션 (다시 오른쪽으로 사라짐)
      gsap.to(toastElement, {
        opacity: 0,
        x: 100,
        duration: 0.5,
        ease: "power2.in",
        onComplete: () => setToast(null), // 애니메이션 완료 후 DOM에서 제거
      });
    }, 3000); // 3초 유지

    // 클린업 함수: 컴포넌트 언마운트 또는 새 토스트 발생 시 타이머 초기화
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [toast]);

  if (!toast) return null;

  return (
    <ToastWrapper ref={toastRef} type={toast.type}>
      <ToastText>{toast.message}</ToastText>
    </ToastWrapper>
  );
});

export default ToastNotification;

const ToastWrapper = styled.div`
  /* 위치: 화면 오른쪽 위에 고정 */
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 15px 20px;
  border-radius: 8px;
  color: white;
  z-index: 9000;
  min-width: 250px;
  max-width: 90%;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);

  // 타입별 배경색 설정
  background-color: ${(props) =>
    props.type === "success" ? "#4caf50" : "#f44336"};

  /* 반응형: 모바일에서 위치와 크기 조정 */
  @media (max-width: 600px) {
    top: 10px;
    right: 10px;
    padding: 12px 15px;
    font-size: 14px;
    min-width: unset;
    max-width: 80%;
  }
`;

const ToastText = styled.p`
  margin: 0;
  font-weight: 500;
`;
