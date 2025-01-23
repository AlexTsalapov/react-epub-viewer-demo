import styled from 'styled-components'
// lib
import * as styles from 'lib/styles/styles'
import palette from 'lib/styles/palette'

const NavItem = ({ message, onClick }: Props) => {
  return (
    <Content onClick={onClick}>
      <span>{message}</span>
    </Content>
  );
}

const Content = styled.button`
  width: 100%;
  // height: 48px;
  box-sizing: border-box;
  padding: 0.556vw 1.597vw 0.556vw 3.889vw;
  display: flex;
  align-items: center;
  cursor: pointer;
  outline: none;
  
  & > span {
  text-align: left;
  font-family: "Vela Sans";
  font-weight: 400;
  font-size: 16px;
  line-height: 134%;
  color: #333;
  }

  &:last-child {
    margin-bottom: 32px;
  }

  @media (max-width: 768px) {
    padding: 2.133vw 4vw 2.133vw 4.267vw;
  }
`;

interface Props {
  message: string;
  onClick: () => void;
}

export default NavItem