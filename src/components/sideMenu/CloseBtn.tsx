import styled from 'styled-components'
// lib
import * as styles from 'lib/styles/styles'
// icons
import { CloseIcon } from 'lib/svg'

const CloseBtn = ({ onClick }: Props) => {
  return (
    <Btn onClick={onClick}>
      {/* <Icon /> */}
      <img src="/wp-content/uploads/2024/12/chit_icon-close.svg" alt="" />
    </Btn>
  );
}

const Btn = styled.button`
  z-index: 1200;
  right: 69vw;
  width: 4.167vw;
  height: 4.167vw;
  top: 0;
  position: absolute;
  // height: 100%;
  padding: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  // transition: 0.1s ${styles.transition};
  outline: none;

  &:focus,
  &:hover {
    // filter: invert(40%) sepia(85%) saturate(1256%) hue-rotate(210deg) brightness(113%) contrast(101%);
  }

  img {
    // filter: drop-shadow(0 0 5px rgba(0, 0, 0, 0.8)); /* Тень для иконки */
  }
    @media (max-width: 768px) {
    right: 3vw;
    width: 10.667vw;
    height: 10.667vw;
    top: 44vw;
    
  }
`;




const Icon = styled(CloseIcon)`
  width: 18px;
  height: 18px;
`;

interface Props {
  onClick: () => void;
}

export default CloseBtn;