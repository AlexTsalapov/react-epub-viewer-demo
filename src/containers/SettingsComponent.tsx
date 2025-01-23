import React, { useState, useEffect } from 'react';
import axios from 'axios';
// components
import OptionSlider from 'components/option/Slider';
import OptionDropdown from 'components/option/Dropdown';
// types
import { BookStyle, BookFontFamily } from 'types/book';

declare const myPluginData: {
  rest_url: string;
  nonce: string;
};

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
  brightness: number;
  // Если нужно, добавляйте остальные поля (lineHeight, marginHorizontal, и т.п.)
}

interface Props {
  bookStyle: BookStyle;
  onBookStyleChange: (bookStyle: BookStyle) => void;
  viewerRef: React.RefObject<HTMLElement>;
}

type SliderType = 'FontSize' | 'Brightness';

/**
 * Компонент настроек с сохранением/загрузкой из БД
 */
const SettingsComponent = ({ bookStyle, onBookStyleChange, viewerRef }: Props) => {
  // =====================================
  // Локальные состояния
  // =====================================
  const [brightness, setBrightness] = useState<number>(bookStyle.brightness ); 
  // При желании можете деструктурировать bookStyle, если там уже есть brightness:
  // const { brightness = 100, fontFamily = 'Roboto', fontSize = 16 } = bookStyle;

  // Флаг, чтобы не вызывать сохранение до тех пор, пока настройки не будут загружены
  const [settingsLoaded, setSettingsLoaded] = useState<boolean>(false);

  // =====================================
  // Вспомогательные функции
  // =====================================

  /**
   * Получить cookie по имени
   */
  const getCookie = (name: string): string | null => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return parts.pop()?.split(';').shift() || null;
    }
    return null;
  };

  /**
   * Загрузить настройки с бэкенда
   */
  const fetchUserSettings = async () => {
    const token = getCookie('jwt_token');
    if (!token) {
      console.error('JWT-токен не найден');
      return;
    }

    try {
      const response = await axios.get(`${myPluginData.rest_url}myplugin/v1/get-user-settings`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = response.data as ApiResponse;

      if (data.status === 'success' && data.data && data.data.settings) {
        const { fontFamily, fontSize, brightness } = data.data.settings;
        
        // Обновляем локальное состояние и bookStyle
        onBookStyleChange({
          ...bookStyle,
          fontFamily: fontFamily || 'Roboto',
          fontSize: fontSize || 16,
          brightness: brightness ,
        });

        setBrightness(brightness );
        setSettingsLoaded(true);
      }
    } catch (err) {
      console.error('Ошибка при загрузке настроек:', err);
    }
  };

  /**
   * Сохранить настройки на бэкенд
   */
  const saveUserSettings = async () => {
    const token = getCookie('jwt_token');
    if (!token) {
      console.error('JWT-токен не найден');
      return;
    }

    // Готовим структуру для отправки
    const settingsToSave = {
      fontFamily: bookStyle.fontFamily,
      fontSize: bookStyle.fontSize,
      brightness: bookStyle.brightness,
      // Если есть иные поля (lineHeight и т.п.), тоже можно сюда добавить
    };

    try {
      const response = await axios.post(
        `${myPluginData.rest_url}myplugin/v1/update-user-settings`,
        { settings: settingsToSave },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = response.data as ApiResponse;
      if (data.status === 'success') {
        console.log('Настройки успешно сохранены', data.data);
      }
    } catch (err) {
      console.error('Ошибка при сохранении настроек:', err);
    }
  };

  // =====================================
  // Хуки и эффекты
  // =====================================

  /**
   * При первом рендере загружаем настройки, если они еще не были загружены
   */
  useEffect(() => {
    if (!settingsLoaded) {
      fetchUserSettings();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settingsLoaded]);

  /**
   * Делаем «debounce» сохранения настроек,
   * когда меняется bookStyle или локальный brightness
   */
  useEffect(() => {
    if (!settingsLoaded) return; 
    // Ждём 300мс после последнего изменения, перед отправкой на сервер
    const timer = setTimeout(() => {
      saveUserSettings();
    }, 300);

    return () => clearTimeout(timer);
    // Нужно учитывать те поля, которые вы хотите отслеживать
  }, [bookStyle.fontFamily, bookStyle.fontSize, bookStyle.brightness, settingsLoaded]);

  /**
   * Каждый раз, когда изменяем brightness в локальном стейте (или fontSize / fontFamily),
   * мы вызываем onBookStyleChange, чтобы обновить глобальное состояние bookStyle.
   * Также меняем стили в iframe.
   */
  useEffect(() => {
    updateEpubBackground(brightness);
  }, [brightness]);

  useEffect(() => {
    // При изменении fontFamily/fontSize в bookStyle — обновляем iframe
    updateEpubFont(bookStyle.fontFamily);
    updateEpubFontSize(bookStyle.fontSize);
  }, [bookStyle.fontFamily, bookStyle.fontSize]);

  // =====================================
  // Вспомогательные методы обновления iframe
  // =====================================

  /** Обновить шрифт в EPUB через iframe */
  const updateEpubFont = (font: BookFontFamily) => {
    const viewerElement = viewerRef?.current;
    if (viewerElement) {
      const iframe = viewerElement.querySelector('iframe');
      if (iframe?.contentDocument?.documentElement) {
        iframe.contentDocument.documentElement.style.fontFamily = font;
      }
    }
  };

  /** Обновить размер шрифта в EPUB через iframe */
  const updateEpubFontSize = (size: number) => {
    const viewerElement = viewerRef?.current;
    if (viewerElement) {
      const iframe = viewerElement.querySelector('iframe');
      if (iframe?.contentDocument?.documentElement) {
        iframe.contentDocument.documentElement.style.fontSize = `${size}px`;
      }
    }
  };

  /** Обновить фон (яркость) в EPUB через iframe */
  const updateEpubBackground = (brightness: number) => {
    const minColor = [245, 233, 215];
    const maxColor = [255, 255, 255];
    const color = minColor.map((min, i) =>
      Math.round(min + (maxColor[i] - min) * (brightness / 100))
    );
    const newBackgroundColor = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;

    // Обновляем фон документа (если нужно на весь документ)
    document.documentElement.style.backgroundColor = newBackgroundColor;

    // Обновляем фон в iframe
    const viewerElement = viewerRef?.current;
    if (viewerElement) {
      const iframe = viewerElement.querySelector('iframe');
      if (iframe?.contentDocument?.documentElement) {
        iframe.contentDocument.documentElement.style.backgroundColor = newBackgroundColor;
      }
    }
  };

  // =====================================
  // Handlers
  // =====================================

  /** Обработчик изменения значения на слайдере */
  const onChangeSlider = (type: SliderType, e: any) => {
    const value = Number(e.target.value);

    switch (type) {
      case 'FontSize': {
        // При изменении размера шрифта — обновляем глобальный bookStyle
        onBookStyleChange({ ...bookStyle, fontSize: value });
        // iframe обновится благодаря useEffect
        break;
      }
      case 'Brightness': {
        setBrightness(value);
        // Дополнительно, чтобы в bookStyle тоже попадало это значение
        onBookStyleChange({ ...bookStyle, brightness: value });
        // iframe фон обновится в useEffect
        break;
      }
      default:
        break;
    }
  };

  /** Обработчик смены шрифта (Dropdown) */
  const onSelectFont = (font: BookFontFamily) => {
    onBookStyleChange({ ...bookStyle, fontFamily: font });
    // iframe обновится благодаря useEffect
  };

  // =====================================
  // JSX рендер
  // =====================================
  return (
    <div
      style={{
        margin: '0 auto',
        marginTop: '6.4vw',
        display: 'flex',
        flexDirection: 'column',
        gap: '8.533vw',
      }}
    >
      <h3
        style={{
          width: '91.733vw',
          paddingBottom: '2.133vw',
          borderBottom: '1px solid #cecece',
          margin: '0',
          fontFamily: 'Brygada 1918',
          fontWeight: '400',
          fontSize: '22px',
          lineHeight: '120%',
          textAlign: 'center',
          color: '#fff',
        }}
      >
        Настройки
      </h3>
      
      {/* Слайдер для яркости */}
      <OptionSlider
        active={true}
        title="Яркость"
        minValue={0}
        maxValue={100}
        defaultValue={brightness}
        step={1}
        onChange={(e) => onChangeSlider('Brightness', e)}
      />

      {/* Выбор шрифта */}
      <OptionDropdown
        title="Шрифт"
        defaultValue={bookStyle.fontFamily}
        valueList={['Roboto', 'Arial']}
        onSelect={onSelectFont}
      />

      {/* Слайдер для размера шрифта */}
      <OptionSlider
        active={true}
        title="Размер"
        minValue={8}
        maxValue={36}
        defaultValue={bookStyle.fontSize}
        step={1}
        onChange={(e) => onChangeSlider('FontSize', e)}
      />
    </div>
  );
};

export default SettingsComponent;
