import styled from 'styled-components'

const Post = styled.div<{ color: string }>`
  position: relative;
  margin-top: 0.417vw;
  padding: 8px;
  box-sizing: border-box;

  font-family: "Vela Sans";
  font-weight: 400;
  font-size: 14px;
  line-height: 130%;
  color: #696969;

  &::before {
    content: '';
    position: absolute;
    width: 100%;
    height: 100%;
    left: 0;
    top: 0;
    background-color: ${({ color }) => color};
    opacity: .3;
    border-radius: 8px;
    mix-blend-mode: multiply;
  }
    @media (max-width: 768px) {
    margin-top: 1.6vw;
  }
`;

export default Post