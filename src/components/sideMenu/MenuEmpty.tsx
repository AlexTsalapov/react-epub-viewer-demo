import styled from 'styled-components'
// lib
import palette from 'lib/styles/palette'

const MenuEmpty = ({ text }: Props) => {
  return <Content>{text}</Content>;
}

const Content = styled.div`
  // flex-grow: 1;
  height: auto;
  display: flex;
  align-items: center;
  // justify-content: center;
  margin-left: 2.222vw;
  
  font-family: "Vela Sans";
  font-weight: 400;
  font-size: 16px;
  line-height: 134%;
  color: #989494;
  @media (max-width: 768px) {
    margin-left: 4.267vw;
    margin-top: 2.133vw;
  }
`;

interface Props {
  text: string;
}

export default MenuEmpty