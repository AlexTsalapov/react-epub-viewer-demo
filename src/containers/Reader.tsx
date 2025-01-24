/* Reader.tsx */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { ReactEpubViewer } from 'react-epub-viewer';
import axios from 'axios';
import { useSwipeable } from 'react-swipeable';

// Контейнеры/компоненты
import Header from 'containers/Header';
import Footer from 'containers/Footer';
import Nav from 'containers/menu/Nav';
import Option from 'containers/menu/Option';
import Learning from 'containers/menu/Note';
import ContextMenu from 'containers/commons/ContextMenu';
import Snackbar from 'containers/commons/Snackbar';
import MoveBtn from 'components/footer/MoveBtn';
import ViewerContent from 'components/commons/ViewerContent';
import ViewerWrapper from 'components/commons/ViewerWrapper';
import LoadingView from 'LoadingView';
import SwipeUpModal from './SwipeUpModal';
import Header_mob from './Header_mob';
import Footer_mob from './Footer_mob';
import { TextWrapper_mob } from 'components/header/Layout';
import BookmarkButton from 'components/note/BookmarkButton';

// Redux store и экшены
import store from 'slices';
import { RootState } from 'slices';
import { updateBook, updateCurrentPage, updateToc } from 'slices/book';

// Хуки
import useMenu from 'lib/hooks/useMenu';
import useHighlight from 'lib/hooks/useHighlight';

// Стили
import 'lib/styles/readerStyle.css';
import viewerLayout from 'lib/styles/viewerLayout';

// Типы
import { Book, BookStyle, BookOption, BookFlow } from 'types/book';
import Page from 'types/page';
import Toc from 'types/toc';

interface Props {
  url: string;
  loadingView?: React.ReactNode;
}

const Reader = ({ url, loadingView }: Props) => {
  const dispatch = useDispatch();
  const currentLocation = useSelector<RootState, Page>((state) => state.book.currentLocation);

  // Рефы для боковых меню и ридера
  const viewerRef = useRef<any>(null); // Используем any для избежания конфликтов типов
  const navRef = useRef<HTMLDivElement | null>(null);
  const optionRef = useRef<HTMLDivElement | null>(null);
  const learningRef = useRef<HTMLDivElement | null>(null);

  // Состояния
  const [isContextMenu, setIsContextMenu] = useState<boolean>(false);
  const [loadingError, setLoadingError] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Состояние загрузки

  // Стили и опции книги
  const [bookStyle, setBookStyle] = useState<BookStyle>({
    fontFamily: 'Origin',
    fontSize: 18,
    lineHeight: 1.4,
    marginHorizontal: 15,
    marginVertical: 5,
    brightness: 100,
  });

  const [bookOption, setBookOption] = useState<BookOption>({
    flow: 'paginated',
    resizeOnOrientationChange: true,
    spread: 'auto',
  });

  // Хуки для управления меню
  const [navControl, onNavToggle] = useMenu(navRef, 300);
  const [optionControl, onOptionToggle, emitEvent] = useMenu(optionRef, 300);
  const [learningControl, onLearningToggle] = useMenu(learningRef, 300);

  // Хук для работы с выделениями
  const {
    selection,
    onSelection,
    onClickHighlight,
    onAddHighlight,
    onRemoveHighlight,
    onUpdateHighlight,
    onAddBookmark,
  } = useHighlight(viewerRef, setIsContextMenu, bookStyle, bookOption.flow);

  // Получаем productId и productName из глобального объекта
  const productId = (window as any).wpData?.productId;
  const productName = (window as any).wpData?.productName || 'Название книги';

  // Функция для получения значения куки по имени
  const getCookie = (name: string): string | null => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
  };

  // Функция для отправки прогресса чтения на сервер с токеном
  const updateReadingProgress = async (pageData: Page) => {
    if (!productId || pageData.currentPage <= 0) return;

    // Извлекаем токен из куки
    const token = getCookie('jwt_token'); // Имя куки с токеном
    console.log(pageData.totalPage);

    try {
      // Выполняем запрос с заголовком Authorization
      const response = await axios.post(
        '/wp-json/myplugin/v1/update-reading-progress',
        {
          product_id: productId,
          page_number: pageData.currentPage,
          start_cfi: pageData.startCfi,
          end_cfi: pageData.endCfi,
          total_page: pageData.totalPage,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log('Reading progress updated:', response.data);
    } catch (error) {
      console.error('Error updating reading progress:', error);
    }
  };

  // Функция для установки начального положения
  const setDefaultLocation = () => {
    // Установите здесь логику для установки начальной страницы
    // Например, перейти к первой странице
    if (viewerRef.current) {
      if (typeof viewerRef.current.setLocation === 'function') {
        viewerRef.current.setLocation('epubcfi(/6/2[cover]!/6)'); // Пример CFI для первой страницы
      } else {
        console.warn('Метод setLocation не найден в viewerRef.current');
      }
      dispatch(
        updateCurrentPage({
          chapterName: 'Introduction',
          currentPage: 1,
          totalPage: 7381, // Лучше динамически определять общее количество страниц
          startCfi: 'epubcfi(/6/2[cover]!/6)',
          endCfi: 'epubcfi(/6/2[cover]!/6)',
          base: '',
        })
      );
    }
  };

  // Загрузка последнего прогресса чтения
  const loadReadingProgress = async () => {
    setIsLoading(true);
    if (!productId) {
      setLoadingError(true);
      setDefaultLocation();
      setIsLoading(false);
      return;
    }

    // Извлекаем токен из куки
    const token = getCookie('jwt_token');

    try {
      const response = await axios.get('/wp-json/myplugin/v1/get-reading-progress', {
        params: {
          product_id: productId, // Передаём параметр product_id
        },
        headers: {
          Authorization: `Bearer ${token}`, // Передаём токен
        },
      });

      interface ReadingProgressResponse {
        status: string;
        data: {
          user_id: number;
          product_id: number;
          page_number: number;
          start_cfi: string;
          end_cfi: string;
          totalPage: number;
        };
      }
      const data = response.data as ReadingProgressResponse;
      setIsLoading(true);
      if (data.status === 'success' && data.data.page_number > 0) {
        const lastPage = data.data.page_number;
        const startCfi = data.data.start_cfi;
        const endCfi = data.data.end_cfi;
        const totalPage = data.data.totalPage;

        console.log('Last read page:', lastPage);
        console.log('Start CFI:', startCfi);
        console.log('End CFI:', endCfi);

        // Обновляем Redux состояние
        dispatch(
          updateCurrentPage({
            chapterName: '', // Если у вас есть способ определить название главы по CFI, добавьте здесь
            currentPage: lastPage,
            totalPage: totalPage, // Лучше динамически определять общее количество страниц
            startCfi: startCfi,
            endCfi: endCfi,
            base: '', // Можно определить на основе CFI
          })
        );

        // Устанавливаем местоположение читателя по CFI
        if (viewerRef.current && typeof viewerRef.current.setLocation === 'function') {
          viewerRef.current.setLocation(startCfi);
        } else {
          console.warn('Метод setLocation не найден в viewerRef.current');
        }
      } else {
        console.log('No saved reading progress found.');
        setLoadingError(true); // Устанавливаем ошибку, если нет сохранённого прогресса
        setDefaultLocation(); // Устанавливаем начальное положение
      }
    } catch (error) {
      console.error('Error loading reading progress:', error);
      setLoadingError(true); // Устанавливаем ошибку при неуспешном запросе
      setDefaultLocation(); // Устанавливаем начальное положение
    } finally {
      setIsLoading(false); // Отключаем состояние загрузки
    }
  };

  // Функция обработчика смены книги
  const onBookInfoChange = (book: Book) => {
    dispatch(updateBook(book));
    loadReadingProgress(); // Вызовите loadReadingProgress после загрузки книги
  };

  // Функция обработчика смены TOC
  const onTocChange = (toc: Toc[]) => {
    dispatch(updateToc(toc));
  };

  // Функция обработчика смены страницы
  const onPageChange = (page: Page) => {
    setIsLoading(true);
    console.log('onPageChange called with:', {
      currentPage: page.currentPage,
      totalPage: page.totalPage,
      startCfi: page.startCfi,
      endCfi: page.endCfi,
    });
    dispatch(updateCurrentPage(page));
    console.log('Текущий CFI:', page);
    updateReadingProgress(page);
    setIsLoading(false); // Убираем LoadingView после смены страницы
  };

  // Управление стилями книги
  const onBookStyleChange = useCallback((bookStyle_: BookStyle) => {
    console.log('onBookStyleChange called with:', bookStyle_); // Логирование
    setBookStyle((prevStyle) => {
      // Обновляем только изменённые поля
      if (
        prevStyle.fontFamily !== bookStyle_.fontFamily ||
        prevStyle.fontSize !== bookStyle_.fontSize ||
        prevStyle.lineHeight !== bookStyle_.lineHeight ||
        prevStyle.marginHorizontal !== bookStyle_.marginHorizontal ||
        prevStyle.marginVertical !== bookStyle_.marginVertical ||
        prevStyle.brightness !== bookStyle_.brightness
      ) {
        return { ...prevStyle, ...bookStyle_ };
      }
      return prevStyle; // Не обновляем, если нет изменений
    });
  }, []);

  // Управление опциями книги
  const onBookOptionChange = useCallback((bookOption_: BookOption) => {
    setBookOption((prevOption) => {
      if (
        prevOption.flow !== bookOption_.flow ||
        prevOption.resizeOnOrientationChange !== bookOption_.resizeOnOrientationChange ||
        prevOption.spread !== bookOption_.spread
      ) {
        return { ...prevOption, ...bookOption_ };
      }
      return prevOption;
    });
  }, []);

  // Контекстное меню при выделении текста
  const onContextMenu = (cfiRange: string) => {
    const result = onSelection(cfiRange);
    setIsContextMenu(result);
  };
  const onContextmMenuRemove = () => setIsContextMenu(false);

  // Перелистывание страниц через кнопки
  const onPageMove = (type: 'PREV' | 'NEXT') => {
    if (!viewerRef.current) return;
    if (type === 'PREV') viewerRef.current.prevPage();
    if (type === 'NEXT') viewerRef.current.nextPage();
  };

  // Обработчик перехода на конкретную локацию
  const onLocationChange = (loc: string) => {
    if (!viewerRef.current) return;
    if (typeof viewerRef.current.setLocation === 'function') {
      viewerRef.current.setLocation(loc);
    }
  };

  // Закладка
  const handleAddBookmark = useCallback(() => {
    onAddBookmark();
  }, [onAddBookmark]);

  // Логика свайпов для мобильных устройств
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => onPageMove('NEXT'), // Свайп влево -> следующая страница
    onSwipedRight: () => onPageMove('PREV'), // Свайп вправо -> предыдущая страница
    preventScrollOnSwipe: true, // Предотвращает скроллинг при свайпе
    trackMouse: false, // Только для мобильных устройств
  });

  useEffect(() => {
    const iframe = viewerRef.current?.querySelector('iframe');
    if (!iframe) return;

    const iframeWin = iframe.contentWindow;
    if (!iframeWin) return;

    let startX = 0;
    let endX = 0;

    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      endX = e.changedTouches[0].clientX;
      if (startX - endX > 80) {
        onPageMove('NEXT'); // Свайп влево
      } else if (endX - startX > 80) {
        onPageMove('PREV'); // Свайп вправо
      }
    };

    iframeWin.addEventListener('touchstart', handleTouchStart);
    iframeWin.addEventListener('touchend', handleTouchEnd);

    return () => {
      iframeWin.removeEventListener('touchstart', handleTouchStart);
      iframeWin.removeEventListener('touchend', handleTouchEnd);
    };
  }, [viewerRef, onPageMove]);

  // Логика показа футера (десктоп)
  const [isFooterVisible, setIsFooterVisible] = useState(false);
  const [isFooterVisible_Mob, setIsFooterVisible_Mob] = useState(true);
  const showFooter = () => setIsFooterVisible(true);
  const hideFooter = () => setIsFooterVisible(false);

  // Модальное окно для мобильного интерфейса
  const [isModalOpen, setIsModalOpen] = useState(false); // Управление открытием модального окна

  // useEffect для логирования viewerRef
  useEffect(() => {
    if (viewerRef.current) {
      console.log('viewerRef.current:', viewerRef.current);
    } else {
      console.warn('viewerRef.current пока не инициализирован.');
    }
  }, [viewerRef]);

  // useEffect для загрузки прогресса при монтировании
  useEffect(() => {
    loadReadingProgress();
  }, [productId]);

  return (
    <ViewerWrapper>
      {/* Шапка (десктоп) */}
      <Header
        onNavToggle={onNavToggle}
        onOptionToggle={onOptionToggle}
        onLearningToggle={onLearningToggle}
        productName={productName} // Передаём название книги
      />

      {/* Заголовок (моб) */}
      <TextWrapper_mob>{productName}</TextWrapper_mob>

      {/* Обёртка для ReactEpubViewer и кнопок */}
      <ViewerContent {...swipeHandlers}>
        {/* Кнопка "Назад" */}
        <MoveBtn type="PREV" onClick={() => onPageMove('PREV')} />

        {/* Основной компонент чтения */}
        <div style={{ position: 'relative', flex: 1 }}>
          <ReactEpubViewer
            url={url}
            viewerLayout={viewerLayout}
            viewerStyle={bookStyle}
            viewerOption={bookOption}
            onBookInfoChange={onBookInfoChange}
            onPageChange={onPageChange}
            onTocChange={onTocChange}
            onSelection={onContextMenu}
            ref={viewerRef}
          />

          {/* Слой загрузки поверх ридера, пока isLoading=true */}
          {isLoading && (
            <div
              style={{
                position: 'absolute',
                zIndex: 9999,
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <LoadingView  />
            </div>
          )}
        </div>

        {/* Кнопка "Вперёд" */}
        <MoveBtn type="NEXT" onClick={() => onPageMove('NEXT')} />
      </ViewerContent>

      {/* Footer (десктоп) - появляется при наведении */}
      {isFooterVisible && (
        <Footer
          title={currentLocation.chapterName}
          nowPage={currentLocation.currentPage}
          totalPage={currentLocation.totalPage}
        />
      )}
      <div
        onMouseEnter={showFooter}
        onMouseLeave={hideFooter}
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          width: '100%',
          height: '50px',
          backgroundColor: 'transparent',
          zIndex: 10,
        }}
      />

      {/* Модальное окно свайпа (мобильная панель) */}
      <SwipeUpModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onOpen={() => setIsModalOpen(true)}
      >
        {/* Контент внутри модального окна */}
        <Header_mob
          onNavToggle={onNavToggle}
          onOptionToggle={onOptionToggle}
          onLearningToggle={onLearningToggle}
          onAddBookmark={handleAddBookmark}
          nowPage={currentLocation.currentPage}
          totalPage={currentLocation.totalPage}
          setIsFooterVisible={setIsFooterVisible_Mob}
          bookStyle={bookStyle}
          onBookStyleChange={onBookStyleChange}
          viewerRef={viewerRef}
          productName={productName}
          bookFlow={bookOption.flow}
        />
        <Footer_mob
          title={currentLocation.chapterName}
          nowPage={currentLocation.currentPage}
          totalPage={currentLocation.totalPage}
          isVisible={isFooterVisible_Mob}
        />
      </SwipeUpModal>

      {/* Боковое меню оглавления */}
      <Nav control={navControl} onToggle={onNavToggle} onLocation={onLocationChange} ref={navRef} />

      {/* Боковое меню "Option" */}
      <Option
        control={optionControl}
        bookStyle={bookStyle}
        bookOption={bookOption}
        bookFlow={bookOption.flow}
        onToggle={onOptionToggle}
        emitEvent={emitEvent}
        onBookStyleChange={onBookStyleChange}
        onBookOptionChange={onBookOptionChange}
        ref={optionRef}
        viewerRef={viewerRef} // Добавляем viewerRef
      />

      {/* Боковое меню "Learning" */}
      <Learning
        control={learningControl}
        onToggle={onLearningToggle}
        onClickHighlight={onClickHighlight}
        emitEvent={emitEvent}
        viewerRef={viewerRef}
        ref={learningRef}
      />

      {/* Контекстное меню выделенного текста */}
      <ContextMenu
        active={isContextMenu}
        viewerRef={viewerRef}
        selection={selection}
        onAddHighlight={onAddHighlight}
        onRemoveHighlight={onRemoveHighlight}
        onUpdateHighlight={onUpdateHighlight}
        onContextmMenuRemove={onContextmMenuRemove}
      />

      {/* Ваши уведомления */}
      <Snackbar />
    </ViewerWrapper>
  );
};

// Обёртка с Redux Provider
const ReaderWrapper = ({ url, loadingView }: Props) => {
  return (
    <Provider store={store}>
      <Reader url={url} loadingView={loadingView} />
    </Provider>
  );
};

export default ReaderWrapper;
