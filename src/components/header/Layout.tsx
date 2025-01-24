import styled from 'styled-components'
// lib
import palette from 'lib/styles/palette'
import zIndex from 'lib/styles/zIndex'

const Layout = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 92.222vw;
  height: 64px;
  z-index: ${zIndex.header};
`;

export const AutoLayout = styled.div`
  width: 92.222vw;
  flex-grow: 1;
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid #cecece;
  padding-bottom: 2.222vw;
  margin: 0 auto;
  margin: 1vw  3.889vw 1vw 3.889vw;

  // & > div {
  //   display: flex;
  //   gap: 1.667vw;
  //   align-items: center;
  //   justify-content: flex-start;
  // }

  @media (max-width: 768px) {
    display: none;
  }
`;

export const ControlButtons = styled.div`
  display: flex;
  gap: 1.667vw;
  align-items: center;
  justify-content: flex-start;
  // margin: 0 auto;
  @media (max-width: 768px) {
    gap: 18.488vw;
    margin: 0 auto;
    margin-top: 6.4vw;
    // margin-bottom: 13.867vw;
  }
`;

export const AutoLayout_mob = styled.div`
  display: none !important;
  @media (max-width: 768px) {
    flex-direction: column-reverse;
    display: flex !important;
    justify-content: space-between;
    margin: 0 auto;
  }
`;

export const TextWrapper_mob = styled.div`
  display: none !important;
  @media (max-width: 768px) {
    display: flex !important;
    justify-content: center;
    width: 91.733vw;
    margin: 0 auto;
    margin-top: 8.667vw;
    margin-bottom: 6.4vw;
    padding-bottom: 4.267vw;
    border-bottom: 1px solid #cecece;

    font-family: "Brygada 1918";
    font-weight: 400;
    font-size: 32px;
    line-height: 120%;
    color: #333;
  }
`;





export default Layout