import React, { useState } from 'react';
import styled from 'styled-components';
import { useDrag } from '@use-gesture/react';

interface SwipeUpModalProps {
  children: React.ReactNode;
}

const SwipeUpModal: React.FC<SwipeUpModalProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [offsetY, setOffsetY] = useState(0);

  // Логика для свайпа вверх/вниз
  const bind = useDrag(({ last, movement: [, my], cancel }) => {
    if (last) {
      // Если свайп вверх (my < -100), открываем модальное окно
      if (my < -100) {
        setIsOpen(true);
      } 
      // Если свайп вниз (my > 100), закрываем модальное окно
      else if (my > 100) {
        setIsOpen(false);
      } else {
        cancel?.();
      }
      setOffsetY(0); // Сбрасываем смещение
    } else {
      setOffsetY(my); // Устанавливаем текущее смещение для плавного движения
    }
  });

  return (
    <>
      {isOpen && <Backdrop onClick={() => setIsOpen(false)} />}
      <Container
        isOpen={isOpen}
        offsetY={offsetY}
        onClick={(e) => e.stopPropagation()} // Предотвращаем всплытие кликов
        {...bind()} // Логика свайпа
      >
        {children}
      </Container>
    </>
  );
};

// Стили

const Backdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 10;
`;

const Container = styled.div<{ isOpen: boolean; offsetY: number }>`
  position: fixed;
  // bottom: ${({ offsetY, isOpen }) => (isOpen ? 0 : Math.max(offsetY, 0))}px;
  bottom:10px;
  left: 0;
  width: 100%;
  height: 54%;
  background-color: #1d1a1a;
  transform: translateY(${({ isOpen }) => (isOpen ? '0%' : '100%')});
  transition: transform 0.3s ease-in-out;
  z-index: 200;
  touch-action: none;

  ${({ offsetY }) => offsetY !== 0 && 'transition: none;'}
`;

export default SwipeUpModal;