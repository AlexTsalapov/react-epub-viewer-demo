import React from 'react';
// components
import Wrapper, { Wrapper_mob } from 'components/footer/Wrapper';
import Item from 'components/footer/Item';
import MoveBtn from 'components/footer/MoveBtn';
import ProgressBar from 'components/footer/ProgressContainer';

const Footer_mob = ({ title, nowPage, totalPage, isVisible }: Props) => {
  const progressPercentage = Math.min((nowPage / totalPage) * 100, 100);

  if (!isVisible) return null; // Скрываем футер, если он не должен отображаться

  return (
    <Wrapper_mob>
      <Item text={title} />
      {/* Прогресс-бар отображает прогресс только на основе переданных данных */}
      <ProgressBar progress={progressPercentage} />
      <Item text={`Прочитано ${progressPercentage.toFixed(2)}%`} />
    </Wrapper_mob>
  );
};

interface Props {
  title: string;
  nowPage: number;
  totalPage: number;
  isVisible: boolean;
}

export default Footer_mob;