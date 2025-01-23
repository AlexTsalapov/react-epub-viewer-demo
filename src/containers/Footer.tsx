// components
import Wrapper from 'components/footer/Wrapper';
import Item from 'components/footer/Item';
import MoveBtn from 'components/footer/MoveBtn';
import ProgressBar from 'components/footer/ProgressContainer';

interface Props {
  title: string;
  nowPage: number;
  totalPage: number;
}

let lastProgress = 0; // Храним последнее значение прогресса

const Footer = ({ title, nowPage, totalPage }: Props) => {
  // Сглаженный расчет прогресса
  const balancedProgress = (nowPage: number, totalPage: number) => {
    if (totalPage <= 0) return 0;

    const rawProgress = (nowPage / totalPage) * 100;

    // Ограничиваем резкий скачок прогресса
    const maxStep = 100; // Максимальный прирост за одно обновление (в %)
    const diff = rawProgress - lastProgress;

    // Плавно увеличиваем или уменьшаем прогресс
    if (Math.abs(diff) > maxStep) {
      lastProgress += diff > 0 ? maxStep : -maxStep;
    } else {
      lastProgress = rawProgress;
    }

    return lastProgress;
  };

  // Рассчитываем сглаженный прогресс
  const progressPercentage = balancedProgress(nowPage, totalPage);

  return (
    <Wrapper>
      <Item text={title} />
      
      {/* Прогресс-бар отображает сглаженный прогресс */}
      <ProgressBar progress={progressPercentage} />
      
      {/* Плавный процент прочитанного с двумя знаками после запятой */}
      <Item text={`Прочитано ${progressPercentage.toFixed(2)}%`} />
    </Wrapper>
  );
};

export default Footer;
