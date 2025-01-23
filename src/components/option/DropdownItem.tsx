import styled from 'styled-components'
// lib
import * as styles from 'lib/styles/styles'

const DropdownItem = ({ value, onClick }: Props) => {
const text = value === "Origin" ? "Original" : value;

  return <Container onClick={onClick}>{text}</Container>;
}

const Container = styled.button`
  width: 12.444vw;
  // height: 2.222vw;
  box-sizing: border-box;
  border-bottom: 1px solid #333;
  margin-top: 2vw;
  padding: 0 0 0.556vw 0;

  transition: .1s ${styles.transition};
  font-family: "Vela Sans";
  font-weight: 400;
  font-size: 16px;
  line-height: 130%;
  text-align: center;
  color: #333;
  outline: none;
  
  &:focus, &:hover {
    background-color: rgba(0,0,0,.05);
  }
  
  @media (max-width: 768px) {
    width: 67.467vw;
    height: 8.533vw;
    border-bottom: 1px solid #fff;
    padding: 0 0 2.133vw 0;
    color: #fff;


    &:focus, &:hover {
    background-color: #333;
   }
  }
`;


interface Props {
  value: string;
  onClick: () => void;
}

export default DropdownItem