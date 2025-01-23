import styled from 'styled-components';
import * as styles from 'lib/styles/styles'

const ViewerContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;

  /* Убедитесь, что компонент занимает нужное место */
  width: 92.222vw;
  height: 100%;
  margin: 0 auto;

  /* Кнопки вокруг */
  & > button {
    z-index: 10;
    // position: absolute;
    top: 50%;
    transform: translateY(-50%);
    cursor: pointer;
  }

  /* Левая кнопка "PREV" */
  & > button:first-of-type {
    // left: 16px;
  }

  /* Правая кнопка "NEXT" */
  & > button:last-of-type {
    // right: 16px;
  }
`;

export default ViewerContent;