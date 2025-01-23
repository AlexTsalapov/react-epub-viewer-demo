import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Provider } from 'react-redux';
import { ReactEpubViewer } from 'react-epub-viewer';
import axios from 'axios';
import { useSwipeable } from 'react-swipeable';
// containers
import Header from 'containers/Header';
import Footer from 'containers/Footer';
import Nav from 'containers/menu/Nav';
import Option from 'containers/menu/Option';
import Learning from 'containers/menu/Note';
import ContextMenu from 'containers/commons/ContextMenu';
import Snackbar from 'containers/commons/Snackbar';
import MoveBtn from 'components/footer/MoveBtn'
import ViewerContent from 'components/commons/ViewerContent'
// components
import ViewerWrapper from 'components/commons/ViewerWrapper';
import LoadingView from 'LoadingView';
// slices
import store from 'slices';
import { updateBook, updateCurrentPage, updateToc } from 'slices/book';
// hooks
import useMenu from 'lib/hooks/useMenu';
import useHighlight from 'lib/hooks/useHighlight';
// styles
import 'lib/styles/readerStyle.css';
import viewerLayout from 'lib/styles/viewerLayout';
// types
import { RootState } from 'slices';
import { ViewerRef } from 'types';
import Book, { BookStyle, BookOption, BookFlow } from 'types/book';
import Page from 'types/page';
import Toc from 'types/toc';
import SwipeUpModal from './SwipeUpModal';
import Header_mob from './Header_mob';
import Footer_mob from './Footer_mob';
import { TextWrapper_mob } from 'components/header/Layout';
import BookmarkButton from 'components/note/BookmarkButton';

interface Props {
  url: string;
  loadingView?: React.ReactNode;
  
}

const Reader = ({ url, loadingView }: Props) => {
  const dispatch = useDispatch();
  const currentLocation = useSelector<RootState, Page>((state) => state.book.currentLocation);

  const viewerRef = useRef<ViewerRef | any>(null);
  const navRef = useRef<HTMLDivElement | null>(null);
  const optionRef = useRef<HTMLDivElement | null>(null);
  const learningRef = useRef<HTMLDivElement | null>(null);

  const [isContextMenu, setIsContextMenu] = useState<boolean>(false);
  const [loadingError, setLoadingError] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Новое состояние для отслеживания загрузки

  const [bookStyle, setBookStyle] = useState<BookStyle>({
    fontFamily: 'Origin',
    fontSize: 18,
    lineHeight: 1.4,
    marginHorizontal: 15,
    marginVertical: 5,
    brightness:100
  });

  const [bookOption, setBookOption] = useState<BookOption>({
    flow: 'paginated',
    resizeOnOrientationChange: true,
    spread: 'auto',
  });

  const [navControl, onNavToggle] = useMenu(navRef, 300);
  const [optionControl, onOptionToggle, emitEvent] = useMenu(optionRef, 300);
  const [learningControl, onLearningToggle] = useMenu(learningRef, 300);

  const {
    selection,
    onSelection,
    onClickHighlight,
    onAddHighlight,
    onRemoveHighlight,
    onUpdateHighlight,
  } = useHighlight(viewerRef, setIsContextMenu, bookStyle, bookOption.flow);

  // Получаем productId из wpData
  const productId = (window as any).wpData?.productId;

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
console.log(pageData.totalPage)
    try {
      // Выполняем запрос с заголовком Authorization
      const response = await axios.post(
        '/wp-json/myplugin/v1/update-reading-progress',
        {
          product_id: productId,
          page_number: pageData.currentPage,
          start_cfi: pageData.startCfi,
          end_cfi: pageData.endCfi,
          total_page:pageData.totalPage,
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

  // Загрузка последнего прогресса чтения
  const loadReadingProgress = async () => {
    if (!productId) {
      setLoadingError(true);
      setDefaultLocation();
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
          totalPage:number,
        };
      }
      const data = response.data as ReadingProgressResponse;

      if (data.status === 'success' && data.data.page_number > 0) {
        const lastPage = data.data.page_number;
        const startCfi = data.data.start_cfi;
        const endCfi = data.data.end_cfi;
        const totalPage = data.data.totalPage

        console.log('Last read page:', lastPage);
        console.log('Start CFI:', startCfi);
        console.log('End CFI:', endCfi);

        // Обновляем Redux состояние
        dispatch(updateCurrentPage({
          chapterName: '', // Если у вас есть способ определить название главы по CFI, добавьте здесь
          currentPage: lastPage,
          totalPage: totalPage, // Лучше динамически определять общее количество страниц
          startCfi: startCfi,
          endCfi: endCfi,
          base: '', // Можно определить на основе CFI
        }));

        // Устанавливаем местоположение читателя по CFI
        if (viewerRef.current && startCfi) {
          viewerRef.current.setLocation(startCfi);
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
    }
  };

  // Функция для установки начального положения
  const setDefaultLocation = () => {
    // Установите здесь логику для установки начальной страницы
    // Например, перейти к первой странице
    if (viewerRef.current) {
      viewerRef.current.setLocation('epubcfi(/6/2[cover]!/6)'); // Пример CFI для первой страницы
      dispatch(updateCurrentPage({
        chapterName: 'Introduction',
        currentPage: 1,
        totalPage: 7381, // Лучше динамически определять общее количество страниц
        startCfi: 'epubcfi(/6/2[cover]!/6)',
        endCfi: 'epubcfi(/6/2[cover]!/6)',
        base: '',
      }));
    }
  };

  const onBookInfoChange = (book: Book) => {
    dispatch(updateBook(book));
    loadReadingProgress(); // Вызовите loadReadingProgress после загрузки книги
  };

  const onLocationChange = (loc: string) => {
    if (!viewerRef.current) return;
    viewerRef.current.setLocation(loc);
  };

  const onPageMove = (type: 'PREV' | 'NEXT') => {
    const node = viewerRef.current;
    if (!node || !node.prevPage || !node.nextPage) return;

    type === 'PREV' && node.prevPage();
    type === 'NEXT' && node.nextPage();
  };

  const onTocChange = (toc: Toc[]) => dispatch(updateToc(toc));

  // Мемоизируем функцию обработчика для предотвращения пересоздания при каждом рендере
  const onBookStyleChange = useCallback((bookStyle_: BookStyle) => {
    console.log('onBookStyleChange called with:', bookStyle_); // Логирование
    setBookStyle((prevStyle) => {
      // Обновляем только изменённые поля
      if (
        prevStyle.fontFamily !== bookStyle_.fontFamily ||
        prevStyle.fontSize !== bookStyle_.fontSize ||
        prevStyle.lineHeight !== bookStyle_.lineHeight ||
        prevStyle.marginHorizontal !== bookStyle_.marginHorizontal ||
        prevStyle.marginVertical !== bookStyle_.marginVertical||
        prevStyle.brightness !== bookStyle_.brightness
      ) {
        return { ...prevStyle, ...bookStyle_ };
      }
      return prevStyle; // Не обновляем, если нет изменений
    });
  }, []);

  // Мемоизируем функцию обработчика для предотвращения пересоздания при каждом рендере
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

 

  const onContextMenu = (cfiRange: string) => {
    const result = onSelection(cfiRange);
    setIsContextMenu(result);
  };

  const onContextmMenuRemove = () => setIsContextMenu(false);

  // useEffect для загрузки прогресса чтения и задержки 2 секунды
  useEffect(() => {
    const loadWithDelay = async () => {
      await loadReadingProgress();
      await new Promise(resolve => setTimeout(resolve, 100)); // Задержка 2 секунды
      setIsLoading(false);
    };

    loadWithDelay();
  }, [productId]);

   // Вызывается при изменении страницы
   /*
   const onPageChangeHandler = (page: Page) => {
    dispatch(updateCurrentPage(page));
    // Логируем всю информацию о странице
    console.log('Текущий CFI:', page);
    // Отправляем прогресс чтения на сервер
    updateReadingProgress(page);
  };
  */
	/**
	 * Change current page
	 * @param page Epub page
	 */
	const onPageChange = (page: Page) => {
		console.log("onPageChange called with:", {
		  currentPage: page.currentPage,
		  totalPage: page.totalPage,
		  startCfi: page.startCfi,
		  endCfi: page.endCfi,
		});
    dispatch(updateCurrentPage(page));
    // Логируем всю информацию о странице
    console.log('Текущий CFI:', page);
    // Отправляем прогресс чтения на сервер
    updateReadingProgress(page);
		
	  };
    const bookFlow: BookFlow = 'paginated';
    const productName = (window as any).wpData?.productName || "Название книги";
    const [isFooterVisible, setIsFooterVisible] = useState(true); // Состояние видимости футера
  return (
    <>
  <ViewerWrapper>
    {/* Передача названия книги через проп */}
    <BookmarkButton viewerRef={viewerRef} bookStyle={bookStyle} bookFlow={bookFlow} />
    <Header
    
        onNavToggle={onNavToggle}
        onOptionToggle={onOptionToggle}
        onLearningToggle={onLearningToggle}
        productName={productName} // Новый проп
    />
<TextWrapper_mob>
  {productName}
 </TextWrapper_mob>
    {/* Обёртка для ReactEpubViewer и кнопок */}
    <ViewerContent>
        {/* Кнопка "Назад" */}
        <MoveBtn type="PREV" onClick={() => onPageMove("PREV")} />
        
        {/* Основной компонент чтения */}
        <ReactEpubViewer 
            url={url}
            viewerLayout={viewerLayout}
            viewerStyle={bookStyle}
            viewerOption={bookOption}
            onBookInfoChange={onBookInfoChange}
            onPageChange={onPageChange}
            onTocChange={onTocChange}
            onSelection={onContextMenu}
            loadingView={loadingView || <LoadingView />}
            ref={viewerRef}
        />
        
        {/* Кнопка "Вперёд" */}
        <MoveBtn type="NEXT" onClick={() => onPageMove("NEXT")} />
    </ViewerContent>

    <Footer
        title={currentLocation.chapterName}
        nowPage={currentLocation.currentPage}
        totalPage={currentLocation.totalPage}
    />
    {/* Модальное окно свайпа */}
{/* Модальное окно свайпа */}
<SwipeUpModal>
  {/* Контент внутри модального окна */}
  <Header_mob
   onNavToggle={onNavToggle}
   onOptionToggle={onOptionToggle}
   onLearningToggle={onLearningToggle}
   nowPage={currentLocation.currentPage}
   totalPage={currentLocation.totalPage}
   setIsFooterVisible={setIsFooterVisible} // Передаём управление
   bookStyle={bookStyle} // Передаем bookStyle
   onBookStyleChange={onBookStyleChange} // Передаем onBookStyleChange
   viewerRef={viewerRef} // Передаем viewerRef
   productName={productName}
  />
  <Footer_mob
   title={currentLocation.chapterName}
   nowPage={currentLocation.currentPage}
   totalPage={currentLocation.totalPage}
   isVisible={isFooterVisible} // Передаём состояние видимости
  />
 </SwipeUpModal>
</ViewerWrapper>


      <Nav control={navControl} onToggle={onNavToggle} onLocation={onLocationChange} ref={navRef} />

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

      <Learning
        control={learningControl}
        onToggle={onLearningToggle}
        onClickHighlight={onClickHighlight}
        emitEvent={emitEvent}
        viewerRef={viewerRef}
        ref={learningRef}
      />

      <ContextMenu
        active={isContextMenu}
        viewerRef={viewerRef}
        selection={selection}
        onAddHighlight={onAddHighlight}
        onRemoveHighlight={onRemoveHighlight}
        onUpdateHighlight={onUpdateHighlight}
        onContextmMenuRemove={onContextmMenuRemove}
      />

      <Snackbar />

 

     
    </>
  );
};

const ReaderWrapper = ({ url, loadingView }: Props) => {
  return (
    <Provider store={store}>
      <Reader url={url} loadingView={loadingView} />
    </Provider>
  );
};

export default ReaderWrapper;
