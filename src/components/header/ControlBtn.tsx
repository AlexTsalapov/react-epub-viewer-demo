import styled from 'styled-components';
// lib
import * as styles from 'lib/styles/styles';
import palette from 'lib/styles/palette';

const ControlBtn = ({ message, onClick }: Props) => {
  return <Btn onClick={() => onClick()}>{message}</Btn>;
};

const Btn = styled.button`
  height: 100%;
  padding: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: 0.1s ${styles.transition};
  outline: none;

  &:focus,
  &:hover {
    color: ${palette.blue3};
  }

 

  img {
    max-height: 100%;
    max-width: 100%;
  }
`;

interface Props {
  message: string | JSX.Element; // Поддержка строки или React-элемента
  onClick: (value?: boolean) => void;
}

export default ControlBtn;

// import styled from 'styled-components'
// // lib
// import * as styles from 'lib/styles/styles'
// import palette from 'lib/styles/palette'

// const ControlBtn = ({ message, onClick }: Props) => {
//   return <Btn onClick={() => onClick()}>{message}</Btn>;
// }

// const Btn = styled.button`
//   height: 100%;
//   padding: 0 16px;
//   cursor: pointer;
//   display: flex;
//   align-items: center;
//   justify-content: center;
//   transition: .1s ${styles.transition};
//   outline: none;

//   &:focus, &:hover {
//     color: ${palette.blue3};
//   }

//   &:first-child {
//     margin-left: 8px;
//   }
// `;

// interface Props {
//   message: string;
//   onClick: (value?: boolean) => void;
// }

// export default ControlBtn