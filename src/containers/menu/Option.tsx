import React, { useState, useEffect } from 'react';
import axios from 'axios';
// компоненты
import Wrapper from 'components/sideMenu/Wrapper';
import OptionLayout from 'components/option/Layout';
import OptionDropdown from 'components/option/Dropdown';
import OptionSlider from 'components/option/Slider';
import ControlIconBtnWrapper from 'components/option/ControlIconBtnWrapper';
import ControlIconBtn from 'components/option/ControlIconBtn';
// типы
import { BookStyle, BookFontFamily, BookFlow } from 'types/book';
import { MenuControl } from 'lib/hooks/useMenu';
import { BookOption } from 'types/book';

declare const myPluginData: {
  rest_url: string;
  nonce: string;
};

interface Props {
  control: MenuControl;
  bookStyle: BookStyle;
  bookOption: BookOption;
  bookFlow: BookFlow;
  onToggle: () => void;
  emitEvent: () => void;
  onBookStyleChange: (bookStyle: BookStyle) => void;
  onBookOptionChange: (bookOption: BookOption) => void;
  viewerRef: React.RefObject<HTMLElement>; // Добавлено для работы с яркостью
}

interface ApiResponse {
  status: string;
  data: {
    user_id: number;
    settings: UserSettings;
  };
}

interface UserSettings {
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  marginHorizontal: number;
  marginVertical: number;
  brightness:number;
}

type SliderType = "FontSize" | "LineHeight" | "MarginHorizontal" | "MarginVertical" | "Brightness";
type ViewType = {
  active: boolean;
  spread: boolean;
};

const Option = React.forwardRef<HTMLDivElement, Props>(({
  control,
  bookStyle,
  bookOption,
  bookFlow,
  onToggle,
  emitEvent,
  onBookStyleChange,
  onBookOptionChange,
  viewerRef, // Добавлено для работы с яркостью
}, ref) => {
  const [fontFamily, setFontFamily] = useState<BookFontFamily>(bookStyle.fontFamily);
  const [fontSize, setFontSize] = useState<number>(bookStyle.fontSize);
  const [lineHeight, setLineHeight] = useState<number>(bookStyle.lineHeight);
  const [marginHorizontal, setMarginHorizontal] = useState<number>(bookStyle.marginHorizontal);
  const [marginVertical, setMarginVertical] = useState<number>(bookStyle.marginVertical);
  const [isScrollHorizontal, setIsScrollHorizontal] = useState<boolean>(bookOption.flow === 'paginated');
  const [brightness, setBrightness] = useState<number>(bookStyle.brightness);
  const [viewType, setViewType] = useState<ViewType>({
    active: true,
    spread: bookOption.spread === 'auto'
  });

  const [settingsLoaded, setSettingsLoaded] = useState<boolean>(false); // Флаг загрузки настроек

  // Helper function to get token from cookies
  const getCookie = (name: string): string | null => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
  };

  // Fetch user settings on component mount
  useEffect(() => {
    if (settingsLoaded) return; // Уже загружено

    const token = getCookie('jwt_token');

    if (!token) {
      console.error('Token not found');
      return;
    }

    axios
      .get(`${myPluginData.rest_url}myplugin/v1/get-user-settings`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        const data = response.data as ApiResponse;
        if (data.status === 'success' && data.data && data.data.settings) {
          const settings = data.data.settings;
          console.log(settings)
          let validatedFontFamily: BookFontFamily = 'Origin'; // Значение по умолчанию
          if (settings.fontFamily === 'Origin' || settings.fontFamily === 'Roboto') {
            validatedFontFamily = settings.fontFamily as BookFontFamily;
          }

          setFontFamily(validatedFontFamily);
          setFontSize(settings.fontSize || 12);
          setLineHeight(settings.lineHeight || 1.5);
          setMarginHorizontal(settings.marginHorizontal || 10);
          setMarginVertical(settings.marginVertical || 10);
          setBrightness(settings.brightness ); // Предполагается, что яркость сохраняется на сервере
console.log('setting:e'+settings.brightness)
          // Передаём валидированные настройки родителю без распространения `bookStyle`
          onBookStyleChange({
            fontFamily: validatedFontFamily,
            fontSize: settings.fontSize || 12,
            lineHeight: settings.lineHeight || 1.5,
            marginHorizontal: settings.marginHorizontal || 10,
            marginVertical: settings.marginVertical || 10,
            brightness:settings.brightness
          });

          setSettingsLoaded(true); // Устанавливаем флаг, что настройки загружены
        }
      })
      .catch((err) => console.error('Error fetching settings:', err));
  }, [onBookStyleChange, settingsLoaded]);

  // Save settings when user changes any option
  const saveSettings = () => {
    const token = getCookie('jwt_token');

    if (!token) {
      console.error('Token not found');
      return;
    }

    const settings = {
      fontFamily,
      fontSize,
      lineHeight,
      marginHorizontal,
      marginVertical,
      brightness, // Добавлено сохранение яркости
    };

    axios
      .post(
        `${myPluginData.rest_url}myplugin/v1/update-user-settings`,
        { settings },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((response) => {
        const data = response.data as ApiResponse;
        if (data.status === 'success') {
          console.log('Settings saved:', data.data);
        }
      })
      .catch((err) => console.error('Error saving settings:', err));
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      saveSettings();
    }, 250);

    return () => clearTimeout(timer);
  }, [fontFamily, fontSize, lineHeight, marginHorizontal, marginVertical, brightness]); // Добавлено brightness

  // Добавляем useEffect для передачи изменений родителю
  useEffect(() => {
    if (settingsLoaded) { // Избегаем вызова при инициализации
      onBookStyleChange({
        fontFamily,
        fontSize,
        lineHeight,
        marginHorizontal,
        marginVertical,
        brightness
      });
    }
  }, [fontFamily, fontSize, lineHeight, marginHorizontal, marginVertical, onBookStyleChange, settingsLoaded]);

  /** Change font family */
  const onSelectFontFamily = (font: BookFontFamily) => setFontFamily(font);

  /** Update EPUB font family */
  const updateEpubFont = (font: BookFontFamily) => {
    const viewerElement = viewerRef?.current;
    if (viewerElement) {
      const iframe = viewerElement.querySelector('iframe');
      if (iframe?.contentDocument?.documentElement) {
        iframe.contentDocument.documentElement.style.fontFamily = font;
      }
    }
  };

  /** Update EPUB font size */
  const updateEpubFontSize = (fontSize: number) => {
    const viewerElement = viewerRef?.current;
    if (viewerElement) {
      const iframe = viewerElement.querySelector('iframe');
      if (iframe?.contentDocument?.documentElement) {
        iframe.contentDocument.documentElement.style.fontSize = `${fontSize}px`;
      }
    }
  };

  /** Update EPUB background based on brightness */
  const updateEpubBackground = (brightness: number) => {
    const minColor = [245, 233, 215];
    const maxColor = [255, 255, 255];
    const color = minColor.map((min, i) =>
      Math.round(min + (maxColor[i] - min) * (brightness / 100))
    );
    const newBackgroundColor = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;

    document.documentElement.style.backgroundColor = newBackgroundColor;

    const viewerElement = viewerRef?.current;
    if (viewerElement) {
      const iframe = viewerElement.querySelector('iframe');
      if (iframe?.contentDocument?.documentElement) {
        iframe.contentDocument.documentElement.style.backgroundColor = newBackgroundColor;
      }
    }
  };

  /** Change styles via sliders */
  const onChangeSlider = (type: SliderType, e: any) => {
    if (!e || !e.target) return;
    const value = Number(e.target.value);
    switch (type) {
      case "FontSize":
        setFontSize(value);
        updateEpubFontSize(value); // Обновляем размер шрифта в EPUB
        break;
      case "LineHeight":
        setLineHeight(value);
        break;
      case "MarginHorizontal":
        setMarginHorizontal(value);
        break;
      case "MarginVertical":
        setMarginVertical(value);
        break;
      case "Brightness":
        setBrightness(value);
        updateEpubBackground(value); // Обновляем яркость в EPUB
        break;
      default:
        break;
    }
  };

  /** 
   * Select view direction
   * @param type Direction
   */
  const onClickDirection = (type: "Horizontal" | "Vertical") => {
    if (type === "Horizontal") {
      setIsScrollHorizontal(true);
      setViewType({ ...viewType, active: true });
      onBookOptionChange({
        ...bookOption,
        flow: "paginated"
      });
    } else {
      setIsScrollHorizontal(false);
      setViewType({ ...viewType, active: false });
      onBookOptionChange({
        ...bookOption,
        flow: "scrolled-doc"
      });
    }
  };

  /**
   * Select isSpread
   * @param isSpread Whether spread view 
   */
  const onClickViewType = (isSpread: boolean) => {
    if (isSpread) {
      setViewType({ ...viewType, spread: true });
      onBookOptionChange({
        ...bookOption,
        spread: "auto"
      });
    } else {
      setViewType({ ...viewType, spread: false });
      onBookOptionChange({
        ...bookOption,
        spread: "none"
      });
    }
  };

  // Обновляем шрифт, размер и яркость при изменении состояния
  useEffect(() => {
    if (settingsLoaded) {
      updateEpubFont(fontFamily);
      updateEpubFontSize(fontSize);
      updateEpubBackground(brightness);
    }
  }, [fontFamily, fontSize, brightness, settingsLoaded]);

  return (
    <>
      {control.display && (
        <Wrapper
          title="Настройки"
          show={control.open}
          onClose={onToggle}
          ref={ref}
        >
          <OptionLayout>
          <OptionSlider
              active={true}
              title="Яркость"
              minValue={0}
              maxValue={100}
              defaultValue={brightness}
              step={1}
              onChange={(e) => onChangeSlider("Brightness", e)}
            />
            {/* <ControlIconBtnWrapper title="View Direction">
              <ControlIconBtn
                type="ScrollHorizontal"
                alt="Horizontal View"
                active={true}
                isSelected={isScrollHorizontal}
                onClick={() => onClickDirection("Horizontal")}
              />
              <ControlIconBtn
                type="ScrollVertical"
                alt="Vertical View"
                active={true}
                isSelected={!isScrollHorizontal}
                onClick={() => onClickDirection("Vertical")}
              />
            </ControlIconBtnWrapper> */}
            {/* <ControlIconBtnWrapper title="View Spread">
              <ControlIconBtn
                type="BookOpen"
                alt="Two Page View"
                active={viewType.active}
                isSelected={viewType.spread}
                onClick={() => onClickViewType(true)}
              />
              <ControlIconBtn
                type="BookClose"
                alt="One Page View"
                active={viewType.active}
                isSelected={!viewType.spread}
                onClick={() => onClickViewType(false)}
              />
            </ControlIconBtnWrapper> */}
            <OptionDropdown
              title="Шрифт"
              defaultValue={fontFamily}
              valueList={["Origin", "Roboto"]}
              onSelect={onSelectFontFamily}
            />
            <OptionSlider
              active={true}
              title="Размер"
              minValue={8}
              maxValue={36}
              defaultValue={fontSize}
              step={1}
              onChange={(e) => onChangeSlider("FontSize", e)}
            />
            {/* <OptionSlider
              active={true}
              title="Line height"
              minValue={1}
              maxValue={3}
              defaultValue={lineHeight}
              step={0.1}
              onChange={(e) => onChangeSlider("LineHeight", e)}
            /> */}
            {/* <OptionSlider
              active={true}
              title="Horizontal margin"
              minValue={0}
              maxValue={100}
              defaultValue={marginHorizontal}
              step={1}
              onChange={(e) => onChangeSlider("MarginHorizontal", e)}
            />
            <OptionSlider
              active={true}
              title="Vertical margin"
              minValue={0}
              maxValue={100}
              defaultValue={marginVertical}
              step={1}
              onChange={(e) => onChangeSlider("MarginVertical", e)}
            /> */}
            {/* Добавляем ползунок для яркости */}
          
          </OptionLayout>
        </Wrapper>
      )}
    </>
  );
});

export default Option;
