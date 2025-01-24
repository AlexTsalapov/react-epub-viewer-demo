import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useSwipeable } from 'react-swipeable';

interface SwipeUpModalProps {
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  onOpen?: () => void;
}

const SwipeUpModal: React.FC<SwipeUpModalProps> = ({ children, isOpen, onClose, onOpen }) => {
  const modalRef = useRef<HTMLDivElement | null>(null);

  // Обработчик свайпа на родительском документе
  const swipeHandlers = useSwipeable({
    onSwipedUp: () => {
      console.log('Свайп вверх на родительском документе');
      if (!isOpen) {
        console.log('Открытие модального окна (родительский документ)');
        onOpen?.();
      }
    },
    onSwipedDown: () => {
      console.log('Свайп вниз на родительском документе');
      if (isOpen) {
        console.log('Закрытие модального окна (родительский документ)');
        onClose();
      }
    },
    preventScrollOnSwipe: true,
    trackTouch: true,
    trackMouse: false,
  });

  // Добавляем обработчики свайпов для содержимого iframe
  useEffect(() => {
    const iframe = document.querySelector('iframe');
    console.log('Поиск iframe:', iframe);

    if (!iframe) {
      console.warn('iframe не найден!');
      return;
    }

    try {
      const iframeDocument = iframe.contentDocument || iframe.contentWindow?.document;
      if (!iframeDocument) {
        console.warn('Не удалось получить contentDocument у iframe.');
        return;
      }

      let startY = 0;
      let endY = 0;

      const MIN_SWIPE_DISTANCE = 50; // Минимальная длина свайпа

      const handleTouchStart = (e: TouchEvent) => {
        startY = e.touches[0].clientY;
        console.log('touchstart в iframe, startY:', startY);
      };

      const handleTouchEnd = (e: TouchEvent) => {
        endY = e.changedTouches[0].clientY;
        console.log('touchend в iframe, endY:', endY);

        const deltaY = startY - endY;
        console.log('deltaY:', deltaY);

        if (deltaY > MIN_SWIPE_DISTANCE) {
          console.log('Распознан свайп вверх в iframe');
          if (!isOpen) {
            console.log('Открытие модального окна (iframe)');
            onOpen?.();
          }
        } else if (-deltaY > MIN_SWIPE_DISTANCE) {
          console.log('Распознан свайп вниз в iframe');
          if (isOpen) {
            console.log('Закрытие модального окна (iframe)');
            onClose();
          }
        }
      };

      // Добавляем обработчики для iframe
      iframeDocument.addEventListener('touchstart', handleTouchStart, { passive: true });
      iframeDocument.addEventListener('touchend', handleTouchEnd, { passive: true });

      return () => {
        iframeDocument.removeEventListener('touchstart', handleTouchStart);
        iframeDocument.removeEventListener('touchend', handleTouchEnd);
      };
    } catch (error) {
      console.error('Ошибка при доступе к iframe:', error);
    }
  }, [isOpen, onClose, onOpen]);

  return (
    <div {...swipeHandlers} style={{ touchAction: 'none' }}>
      {isOpen && <Backdrop onClick={onClose} />}
      <Container isOpen={isOpen} ref={modalRef}>
        {children}
      </Container>
    </div>
  );
};

const Backdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 10;
`;

const Container = styled.div<{ isOpen: boolean }>`
  position: fixed;
  bottom: ${({ isOpen }) => (isOpen ? '0' : '-100%')};
  left: 0;
  width: 100%;
  height: 50%;
  background-color: #1d1a1a;
  transition: bottom 0.3s ease-in-out;
  z-index: 200;
`;

export default SwipeUpModal;