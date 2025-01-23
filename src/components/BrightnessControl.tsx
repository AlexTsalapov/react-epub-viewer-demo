import React, { useState, useEffect } from 'react';

interface Props {
  viewerRef: React.RefObject<HTMLElement>; // Updated type for viewerRef
}

const BrightnessControl = ({ viewerRef }: Props) => {
  const [brightness, setBrightness] = useState<number>(100);
  const [backgroundColor, setBackgroundColor] = useState<string>('#ffffff');
  const [isVisible, setIsVisible] = useState<boolean>(false); // Control visibility

  const updateEpubBackground = (brightness: number) => {
    const minColor = [245, 233, 215];
    const maxColor = [255, 255, 255];
    const color = minColor.map((min, i) =>
      Math.round(min + (maxColor[i] - min) * (brightness / 100))
    );
    const newBackgroundColor = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;

    document.documentElement.style.backgroundColor = newBackgroundColor;

    const viewerElement = viewerRef.current;
    if (viewerElement) {
      const iframe = viewerElement.querySelector('iframe'); // Find iframe
      if (iframe?.contentDocument?.documentElement) {
        iframe.contentDocument.documentElement.style.backgroundColor = newBackgroundColor;
      }
    }

    setBackgroundColor(newBackgroundColor);
  };

  const handleBrightnessChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    setBrightness(value);
    updateEpubBackground(value);
  };

  useEffect(() => {
    updateEpubBackground(brightness);
  }, []);

  return (
    <div
      className="brightness-control"
      style={{
        display: isVisible ? 'block' : 'none', // Toggle visibility based on state
        backgroundColor: backgroundColor, // Apply dynamic background color
        padding: '10px',
        borderRadius: '5px',
      }}
    >
      <label htmlFor="brightness">Яркость:</label>
      <input
        id="brightness"
        type="range"
        min="0"
        max="100"
        value={brightness}
        onChange={handleBrightnessChange}
      />
      <div>Текущий цвет: {backgroundColor}</div>
    </div>
  );
};

export default BrightnessControl;
