import styled from 'styled-components'
// lib
import * as styles from 'lib/styles/styles'
import palette from 'lib/styles/palette'
// icons
import { DownIcon } from 'lib/svg'

const DropdownValue = ({ value, isDropdown, onClick }: Props) => {
  return (
    <Container 
      onClick={onClick}
      isDropdown={isDropdown}
      title="Select font"
    >
      <Content>{value}</Content>
      <img src="/wp-content/uploads/2024/12/icon-down-arrow-reader.svg" alt="" />
      {/* <Icon isDropdown={isDropdown}>
        <DownIcon />
      </Icon> */}

    </Container>
  );
}

const Container = styled.button<{isDropdown: boolean}>`
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;

  width: 12.444vw;
  height: 2.222vw;
  border-bottom: 1px solid #333;
  padding: 0 0 0.556vw 0;
  box-sizing: border-box;
  cursor: pointer;
  z-index: 4;
  transition: .1s ${styles.transition};
  outline: none;

  &:hover, &:focus {
    & > div {
      opacity: 1;
      filter: invert(40%) sepia(85%) saturate(1256%) hue-rotate(210deg) brightness(113%) contrast(101%);
    }
  }

  @media (max-width: 768px) {
    width: 67.467vw;
    height: 8.533vw;
    border-bottom: 1px solid #fff;
    padding: 0 0 2.133vw 0;
  }
`;

const Content = styled.span`
  font-family: "Vela Sans";
  font-weight: 400;
  font-size: 16px;
  line-height: 130%;
  text-align: center;
  color: #333;

  @media (max-width: 768px) {
    color: #fff;
  }
`;

const Image = styled.img`
  width: auto;
  height: 100%;
  // max-width: 2.222vw;

  @media (max-width: 768px) {
    width: 6.4vw;
    content: url('/wp-content/uploads/2024/12/chit_nastroiki_ptichka_mob.svg');
  }
`;
interface Props {
  value: string;
  isDropdown: boolean;
  onClick: (e: any) => void;
}

export default DropdownValue