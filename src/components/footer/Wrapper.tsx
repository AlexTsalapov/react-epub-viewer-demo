import styled from 'styled-components'
// lib
import palette from 'lib/styles/palette'

const Wrapper = styled.div`
  position: fixed;
  left: 0;
  bottom: 0;
  width: 92.222vw;
  height: 60px;
  margin: 0 auto;
  margin-bottom: 1.25vw;
  margin-top: 1.667vw;
  margin-left: 3.889vw;
  margin-right: 3.889vw;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.486vw;
  
  @media (max-width: 768px) {
    display: none;
  }
`;

export const Wrapper_mob = styled.div`
  display: none !important;
  @media (max-width: 768px) {
    display: flex !important;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1.867vw;
  
    // position: fixed;
    left: 0;
    bottom: 0;
    width: 92.222vw;
    height: 60px;
    margin: 0 auto;
    margin-bottom: 8.533vw;
    margin-top: 14.133vw;
    // margin-left: 3.889vw;
    // margin-right: 3.889vw;
  }
`;


export default Wrapper