// Header_mob.tsx
import React, { useState } from 'react';
// components
import Wrapper from 'components/header/Wrapper';
import Layout, { AutoLayout, AutoLayout_mob, ControlButtons } from 'components/header/Layout';
import Logo from 'components/header/Logo';
import ControlBtn from 'components/header/ControlBtn';
import SettingsComponent from './SettingsComponent';
import { BookStyle, BookFlow } from 'types/book';

interface Props {
  onNavToggle: () => void;
  onOptionToggle: () => void;
  onLearningToggle: () => void;
  onAddBookmark: () => void; // Для добавления закладки
  nowPage: number;
  totalPage: number;
  setIsFooterVisible: (isVisible: boolean) => void;
  bookStyle: BookStyle;
  onBookStyleChange: (bookStyle: BookStyle) => void;
  viewerRef: React.RefObject<HTMLElement>;
  productName: string;
  bookFlow: BookFlow;
}

const Header_mob: React.FC<Props> = ({
  onNavToggle,
  onOptionToggle,
  onLearningToggle,
  onAddBookmark,
  nowPage,
  totalPage,
  setIsFooterVisible,
  bookStyle,
  onBookStyleChange,
  viewerRef,
  productName,
  bookFlow,
}) => {
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);
  const [isContextMenu, setIsContextMenu] = useState(false); // Перенесено из BookmarkButton, если нужно

  const handleSettingsClick = () => {
    const newVisibility = !isSettingsVisible;
    setIsSettingsVisible(newVisibility);
    setIsFooterVisible(!newVisibility);
  };

  const remainingPages = totalPage - nowPage;

  return (
    <AutoLayout_mob>
      {!isSettingsVisible && (
        <>
          <div
            style={{
              margin: '0 auto',
              marginTop: '1.067vw',
              fontFamily: 'Vela Sans',
              fontWeight: '400',
              lineHeight: '130%',
              fontSize: '14px',
              color: '#696969',
            }}
          >
            Осталось {remainingPages} стр.
          </div>
          <Logo productName={productName} /> {/* Передаём название товара в Logo */}
        </>
      )}
      {isSettingsVisible && (
        <SettingsComponent
          bookStyle={bookStyle}
          onBookStyleChange={onBookStyleChange}
          viewerRef={viewerRef}
        />
      )}
      <ControlButtons>
        {/* Кнопка меню навигации */}
        <ControlBtn
          message={<img src="/wp-content/uploads/2024/12/chit_berger_mob.svg" alt="menu-icon" />}
          onClick={onNavToggle}
        />
        {/* Кнопка добавления закладки */}
        <ControlBtn
          message={<img src="/wp-content/uploads/2025/01/mobilka_zakladka_vot-tak.svg" alt="bookmark-icon" />}
          onClick={onAddBookmark} // Привязываем к onAddBookmark
        />
        {/* Кнопка настроек */}
        <ControlBtn
          message={
            <img
              src={
                isSettingsVisible
                  ? '/wp-content/uploads/2024/12/chit_nastroiki_black_mob.svg'
                  : '/wp-content/uploads/2024/12/chit_nastroiki_mob.svg'
              }
              alt="settings-icon"
            />
          }
          onClick={handleSettingsClick}
        />
        {/* Ещё одна кнопка добавления закладки (если необходимо) */}
        <ControlBtn
          message={<img src="/wp-content/uploads/2024/12/chit_zakladki_mob.svg" alt="bookmark-icon" />}
          onClick={onLearningToggle}// Привязываем к onAddBookmark
        />
      </ControlButtons>
    </AutoLayout_mob>
  );
};

export default Header_mob;
