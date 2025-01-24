import React from 'react';
import styled from 'styled-components';
// components
import CloseBtn from 'components/sideMenu/CloseBtn';
// lib
import * as styles from 'lib/styles/styles';
import palette from 'lib/styles/palette';

// Локально определяем zIndex
const zIndex = {
  menu: 1100,
  overlay: 1050, // Значение для оверлея
};

const Wrapper = ({ title, show, onClose, children }: Props, ref: any) => {
  return (
    <>
      <CloseBtn onClick={onClose} />
      <Overlay show={show} onClick={onClose} />
      <Container show={show} ref={ref}>
        <Header>
          <span>{title}</span>
          {/* <CloseBtn onClick={onClose} /> */}
        </Header>
        {children}
      </Container>
    </>
  );
};

const Overlay = styled.div<{ show: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5); // Полупрозрачный черный фон
  z-index: ${zIndex.overlay}; // Оверлей выше контента
  opacity: ${({ show }) => (show ? 1 : 0)};
  pointer-events: ${({ show }) => (show ? 'auto' : 'none')};
  transition: opacity 0.4s ${styles.transition};
`;

const Container = styled.div<{ show: boolean }>`
  display: flex;
  flex-direction: column;
  position: fixed;
  width: 26.111vw;
  max-width: 95vw;
  height: 100vh;
  top: 0;
  overflow:auto;
  left: 0;
  z-index: ${zIndex.menu}; // Меню выше оверлея
  box-shadow: -4px 0 8px 0 rgba(0, 0, 0, 0.16);
  background-color: ${palette.white};
  transform: ${({ show }) =>
    show ? 'translateX(0px) scale(1)' : 'translateX(-420px) scale(0.9)'};
  transition: 0.4s ${styles.transition};
  ${styles.scrollbar(0)};

  // Стили для мобильной версии
  @media (max-width: 768px) {
    width: 100%; /* Меню занимает всю ширину */
    max-width: 100vw;
    height: 120vw;
    bottom: 0px;
    top: unset;
    box-shadow: none; /* Убираем тень */
    transform: ${({ show }) =>
      show ? 'translateX(0px) scale(1)' : 'translateX(-100%) scale(0.95)'};
  }
`;

const Header = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 2.222vw;
  margin-bottom: 1.667vw;
  padding-bottom: 1.68vw;
  border-bottom: 1px solid #cecece;

  & > span {
    font-family: 'Brygada 1918';
    font-weight: 400;
    font-size: 22px;
    line-height: 120%;
    color: #333;
  }

  // Стили для мобильной версии
  @media (max-width: 768px) {
    width: auto;
    margin-top: 4.267vw;
    margin-bottom: 4.267vw;
    margin: 4.267vw 4vw 4.267vw 4.267vw; 
    padding-bottom: 2.133vw;
  }
`;

interface Props {
  title: string;
  show: boolean;
  onClose: () => void;
  children?: React.ReactNode;
}

export default React.forwardRef(Wrapper);
