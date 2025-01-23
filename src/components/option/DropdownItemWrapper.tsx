import styled from 'styled-components'
// lib
import * as styles from 'lib/styles/styles'
import palette from 'lib/styles/palette'

const DropdownItemWrapper = ({ show, children }: Props) => {
  return <Container show={show}>{children}</Container>
}

const Container = styled.div<{show: boolean}>`
  position: absolute;
  top: 100%;
  left: 0;
  width: 12.444vw;
  // overflow-y: auto;
  overflow-x: clip;
  box-sizing: border-box;
  // padding: 0 0 16px 0;
  background-color: ${palette.white};
  // border-bottom: 1px solid #333;
  z-index: 3;
  
  transition: .4s ${styles.transition};
  opacity: ${({show}) => show
    ? '1'
    : '0'
  };
  transform-origin: top;
  transform: ${({show}) => show
    ? 'translateY(-2px) scaleY(1);'
    : 'translateY(-40px) scaleY(0);'
  };
  ${styles.scrollbar(6)}
  ${({show}) => show
    ? ''
    : styles.noselect
  };

  @media (max-width: 768px) {
    width: 67.467vw;
    background-color: #333;
  }
`;

interface Props {
  show: boolean;
  children: React.ReactElement[];
}

export default DropdownItemWrapper