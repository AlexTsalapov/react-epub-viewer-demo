import styled from 'styled-components';

interface ProgressBarProps {
  progress: number; // Текущее значение прогресса (в процентах)
}

const ProgressBar = ({ progress }: ProgressBarProps) => {
  return (
    <ProgressContainer>
      <Progress style={{ width: `${progress}% `}} />
      <Slider style={{ left: `${progress}% `}}>
        <img
          src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='11' height='11' viewBox='0 0 11 11'%3E%3Ccircle cx='5.5' cy='5.5' r='5.5' fill='%23333333'/%3E%3C/svg%3E"
          alt="circle"
        />
      </Slider>
    </ProgressContainer>
  );
};

const ProgressContainer = styled.div`
  width: 87.778vw; /* Ширина полоски */
  height: 1px; /* Высота полоски */
  background: #cecece; /* Цвет полоски */
  position: relative;
  overflow: visible; /* Разрешить выход элементов за пределы */
`;

const Progress = styled.div`
  height: 100%; /* Высота совпадает с полоской */
  background-color: #333333; /* Цвет текущего прогресса */
  transition: width 0.3s ease;
`;

const Slider = styled.div`
  width: 11px; /* Размер круга */
  height: 11px; /* Размер круга */
  position: absolute;
  top: 0; /* Начало позиции круга */
  transform: translate(-50%, -50%); /* Центровка по горизонтали и вертикали относительно полоски */
  user-select: none; /* Отключение выделения */

  & > img {
    width: 11px; /* Размер круга */
    height: 11px; /* Размер круга */
    display: block;
    user-select: none; /* Отключение выделения */
    pointer-events: none; /* Отключение кликов */
    draggable: false; /* Отключение перетаскивания */
  }
     @media (max-width: 768px) { /* Определяем мобильные устройства */
    & > img {
      filter: invert(1); /* Инвертируем черный цвет в белый */
    }
  }
`;

export default ProgressBar;