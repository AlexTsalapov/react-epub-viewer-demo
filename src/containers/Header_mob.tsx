import React, { useState } from 'react';
// components
import Wrapper from 'components/header/Wrapper';
import Layout, { AutoLayout, AutoLayout_mob, ControlButtons } from 'components/header/Layout';
import Logo from 'components/header/Logo';
import ControlBtn from 'components/header/ControlBtn';
import { BookStyle } from 'types/book';
import SettingsComponent from './SettingsComponent';

const Header_mob = ({
  onNavToggle,
  onOptionToggle,
  onLearningToggle,
  nowPage,
  totalPage,
  setIsFooterVisible,
  bookStyle,
  onBookStyleChange,
  viewerRef,
  productName, // Новый проп
}: Props) => {
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);

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
          <Logo productName={productName} /> {/* Передаем название товара в Logo */}
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
        <ControlBtn
          message={<img src="/wp-content/uploads/2024/12/chit_berger_mob.svg" alt="menu-icon" />}
          onClick={onNavToggle}
        />
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
        <ControlBtn
          message={<img src="/wp-content/uploads/2024/12/chit_zakladki_mob.svg" alt="bookmark-icon" />}
          onClick={onLearningToggle}
        />
      </ControlButtons>
    </AutoLayout_mob>
  );
};


  
  interface Props {
    onNavToggle: (value?: boolean) => void;
    onOptionToggle: (value?: boolean) => void;
    onLearningToggle: (value?: boolean) => void;
    nowPage: number;
    totalPage: number;
    setIsFooterVisible: (isVisible: boolean) => void;
    bookStyle: BookStyle;
    onBookStyleChange: (bookStyle: BookStyle) => void;
    viewerRef: React.RefObject<HTMLElement>;
    productName:string;
  }
  
  export default Header_mob;