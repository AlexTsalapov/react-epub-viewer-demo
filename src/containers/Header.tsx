import React from 'react';
// components
import Wrapper from 'components/header/Wrapper';
import Layout, { AutoLayout, ControlButtons } from 'components/header/Layout';
import Logo from 'components/header/Logo';
import ControlBtn from 'components/header/ControlBtn';

const Header = ({
  onNavToggle,
  onOptionToggle,
  onLearningToggle,
  productName, // Новый проп
}: Props) => {
  /** Включить/выключить полноэкранный режим */
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      // Включить полноэкранный режим
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Ошибка при входе в полноэкранный режим: ${err.message}`);
      });
    } else {
      // Выключить полноэкранный режим
      document.exitFullscreen().catch((err) => {
        console.error(`Ошибка при выходе из полноэкранного режима: ${err.message}`);
      });
    }
  };
 
  return (
    <AutoLayout>
    <Logo productName={productName} /> {/* Передаем название товара в Logo */}
    <ControlButtons>
      <ControlBtn
        message={<img src="/wp-content/uploads/2024/12/Vector_berger.svg" alt="menu-icon" />}
        onClick={onNavToggle}
      />
      <ControlBtn
        message={<img src="/wp-content/uploads/2024/12/Vector_nastroiki.svg" alt="settings-icon" />}
        onClick={onOptionToggle}
      />
      <ControlBtn
        message={<img src="/wp-content/uploads/2024/12/zakladka_black.svg" alt="bookmark-icon" />}
        onClick={onLearningToggle}
      />
      <ControlBtn
        message={<img src="/wp-content/uploads/2024/12/vector_all_page.svg" alt="fullscreen-icon" />}
        onClick={toggleFullscreen} // Обработчик для полноэкранного режима
      />
    </ControlButtons>
  </AutoLayout>
  );
};

interface Props {
  onNavToggle: (value?: boolean) => void;
  onOptionToggle: (value?: boolean) => void;
  onLearningToggle: (value?: boolean) => void;
  productName: string; // Добавляем проп для названия товара
}

export default Header;
