import styled from 'styled-components'
// lib
import palette from 'lib/styles/palette'
import * as styles from 'lib/styles/styles'

const SliderValue = ({ 
  active, 
  minValue, 
  maxValue, 
  defaultValue, 
  step, 
  onChange 
}: Props) => {
  const percentage = Math.round((defaultValue - minValue) / (maxValue - minValue) * 100);

  return (<>
    {/* <Icon>-</Icon> */}
    <SliderWrapper>
      <SliderBackground />
      <SliderBar 
        active={active}
        percentage={percentage}
      />
      <Slider
        type="range" 
        min={minValue}
        max={maxValue}
        defaultValue={defaultValue}
        step={step}
        onChange={onChange}
        active={active}
        disabled={!active} />
    </SliderWrapper>
    {/* <Icon>+</Icon> */}
  </>);
}

const SliderWrapper = styled.div`
  flex-grow: 1;
  display: flex;
  position: relative;
  width: auto;
`;

const SliderBackground = styled.div`
  position: absolute;
  width: 100%;
  height: 1px;
  background-color: #cecece;
  border-radius: 6px;
  z-index: 0;
`;

const SliderBar = styled.div<{ percentage: number, active: boolean }>`
  position: absolute;
  top: 50%;
  left: 0;
  transform: translateY(-50%);
  width: ${({ percentage }) => percentage + '%'};
  height: 1px;
  border-radius: 6px 0 0 6px;
  background-color: ${props => props.active
    ? "#804030"
    : palette.gray2
  };
	z-index: 1;
`;

const Slider = styled.input<{ active: boolean }>`
  appearance: none;
  width: 100%;
  height: 1px;
  background-color: transparent;
  border-radius: 6px;
  margin: 0;
  z-index: 2;
  outline: none;
  
  &::-webkit-slider-thumb {
    appearance: none;
    width: 11px;
    height: 11px;
    border-radius: 100%;
    background-color: #804030;
    transition: .2s ${styles.transition};
    transition-property: box-shadow, background-color;
    
    cursor: ${props => props.active
        ? 'pointer'
        : ''
      };;
  }

  
`;

const Icon = styled.span`
  font-size: 12px;
  font-weight: 500;
  color: ${palette.gray4};
  margin: 0 8px;
  line-height: 20px;
`;

interface Props {
  active: boolean;
  minValue: number;
  maxValue: number;
  defaultValue: number;
  step: number;
  onChange: (e: any) => void;
}

export default SliderValue