import styled from 'styled-components'
// lib
import palette from 'lib/styles/palette'

const Item = ({ text }: Props) => {
  return (
    <Container>
      <span>{text}</span>
    </Container>
  );
}

const Container = styled.div`
  // height: 100%;
  // flex-basis: 100%;
  // display: flex;
  // align-items: center;
  // justify-content: center;
  // overflow: hidden;
  // text-overflow: ellipsis;
  white-space: nowrap;

  & > span {
    font-family: "Vela Sans";
    font-weight: 400;
    font-size: 12px;
    line-height: 130%;
    color: #696969;
  }
    
  &:first-of-type {
    margin-right: auto;
    & > span {
      font-family: "Vela Sans";
      font-weight: 400;
      font-size: 16px;
      line-height: 134%;
      color: #696969;
    }
  }

  @media (max-width: 768px) {
    & > span {
      color: #cecece;
    }
    &:first-of-type {
      & > span {
        color: #fff;
      }
    }
  }
`;



interface Props {
  text: string;
}

export default Item;