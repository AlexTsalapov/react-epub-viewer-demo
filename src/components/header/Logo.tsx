import React from 'react';
import styled from 'styled-components';
// lib
import palette from 'lib/styles/palette';

interface LogoProps {
  productName: string; // Добавляем проп для названия товара
}

const Logo: React.FC<LogoProps> = ({ productName }) => {
  return <TextWrapper>{productName}</TextWrapper>;
};

const TextWrapper = styled.div`
 display: flex;
    align-items: center;
    justify-content: flex-start;
 font-family: "Brygada 1918";
 font-weight: 400;
 font-size: 22px;
 line-height: 120%;
 color: #333;

 /* Адаптивность: скрываем текст на экранах меньше 700px */
 @media (max-width: 768px) {
  margin: 0 auto;
  margin-top: 13.867vw;
  font-family: "Brygada 1918";
  font-weight: 400;
  font-size: 32px;
  line-height: 120%;
  color: #fff;
 }
`;

export default Logo;
