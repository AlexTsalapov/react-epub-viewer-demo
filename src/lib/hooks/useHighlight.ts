// useHighlight.ts

import React, { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';

// Импортируем нужные экшены из слайса
import {
  pushHighlight,
  popHighlight,
  updateHighlight, // thunk для обновления выделения
  addHighlight,
  deleteHighlight,
  fetchHighlights,
 // clearAllHighlights, // Добавлен экшен для очистки всех выделений
} from 'slices/book';

import { newSnackbar } from 'slices/snackbar';

// Утилиты
import {
  getParagraphCfi,
  clashCfiRange,
  getSelectionPosition,
  compareCfi,
  cfiRangeSpliter,
  getNodefromCfi,
  getPageCfi, // Предполагается, что эта функция существует
  getPageStartCfi, // Добавлены функции для получения начала страницы
  getPageEndCfi, // и конца страницы
} from 'lib/utils/commonUtil';

// Стили и константы
import viewerLayout, { contextmenuWidth } from 'lib/styles/viewerLayout';

// Типы
import { RootState } from 'slices';
import { BookStyle, BookFlow } from 'types/book';
import Page from 'types/page';
import Selection from 'types/selection';
import Highlight from 'types/highlight';

interface UseHighlightResult {
  selection: Selection;
  onSelection: (cfiRange: string) => boolean;
  onClickHighlight: (highlightNode: HTMLElement) => void;
  onAddHighlight: (color: string) => void;
  onRemoveHighlight: (key: string, cfiRange: string) => void;
  onUpdateHighlight: (highlight: Highlight | null, color: string) => void;
  onAddBookmark: () => void; // Новая функция для добавления закладки всей страницы
  loading: boolean;
}

/**
 * Хук для работы с выделениями (highlight) в Epub Reader.
 * @param viewerRef Реф на элемент (Viewer), содержащий iframe с книгой.
 * @param setIsContextMenu setState для управления видимостью контекстного меню.
 * @param bookStyle Визуальный стиль книги (размер шрифта, поля и т.п.).
 * @param bookFlow Направление потока книги (ltr/rtl).
 */
const useHighlight = (
  viewerRef: any,
  setIsContextMenu: React.Dispatch<React.SetStateAction<boolean>>,
  bookStyle: BookStyle,
  bookFlow: BookFlow
): UseHighlightResult => {
  const dispatch = useDispatch();

  // Текущая страница/локация (из Redux)
  const currentLocation = useSelector<RootState, Page>((state) => state.book.currentLocation);

  // Все выделения (из Redux)
  const highlights = useSelector<RootState, Highlight[]>((state) => state.book.highlights);

  // Состояние загрузки (pending) из Redux
  const loading = useSelector<RootState, boolean>((state) => state.book.loading);

  // Локальное состояние для текущего выделения
  const [selection, setSelection] = useState<Selection>({
    update: false,
    x: 0,
    y: 0,
    height: 0,
    cfiRange: '',
    content: '',
  });

  /**
   * При первом монтировании (или смене dispatch) загружаем выделения с сервера.
   */
  useEffect(() => {
    dispatch(fetchHighlights());
  }, [dispatch]);

  /**
   * Обработчик удаления всех выделений (пример через прямой вызов axios).
   * Задача: при ошибке "No startContainer found..." автоматически удалить все выделения пользователя/книги.
   *
   * В реальном проекте лучше использовать Redux-thunk, если у вас для этого есть готовый экшен.
   * Здесь для наглядности приведён пример через axios:
   */
  /*const onRemoveAllHighlights = useCallback(async () => {
    try {
      const bookId = (window as any).wpData?.productId;

      if (!bookId) {
        console.warn('Не найден bookId, невозможно удалить выделения для книги.');
        return;
      }

      const token = localStorage.getItem('jwt_token');
      if (!token) {
        console.warn('Не найден JWT-токен. Пользователь не авторизован.');
        dispatch(
          newSnackbar({
            text: 'Необходима авторизация для удаления выделений.',
            type: 'ERROR',
          })
        );
        return;
      }

      const response = await axios.post(
        '/wp-json/myplugin/v1/delete-all-highlights',
        { book_id: bookId },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.data.status === 'success') {
        console.log('Все выделения успешно удалены на сервере.');
     //   dispatch(clearAllHighlights()); // Разкомментируйте, если экшен существует

        dispatch(
          newSnackbar({
            text: 'Все выделения удалены из-за ошибки.',
            type: 'INFO',
          })
        );
      } else {
        console.error('Ошибка при удалении выделений:', response.data.message);
        dispatch(
          newSnackbar({
            text: `Ошибка при удалении выделений: ${response.data.message}`,
            type: 'ERROR',
          })
        );
      }
    } catch (error) {
      console.error('Ошибка при вызове API для удаления всех выделений:', error);
      dispatch(
        newSnackbar({
          text: 'Произошла ошибка при удалении всех выделений.',
          type: 'ERROR',
        })
      );
    }
  }, [dispatch, currentLocation]);
*/
  /**
   * Обработка события выделения текста пользователем (выделение + контекстное меню).
   */
  const onSelection = useCallback(
    (cfiRange: string): boolean => {
      if (!viewerRef.current) return false;
      const iframe = viewerRef.current.querySelector('iframe');
      if (!iframe) return false;
      const iframeWin = iframe.contentWindow;
      if (!iframeWin) return false;

      // Проверяем, нет ли пересечений с уже сохранёнными выделениями
      const filtered = highlights.filter((h) => clashCfiRange(h.cfiRange, cfiRange));
      if (filtered.length > 0) {
        dispatch(
          newSnackbar({
            text: 'Закладка уже сохранена.',
            type: 'WARNING',
          })
        );
        iframeWin.getSelection().removeAllRanges();
        return false;
      }

      // Получаем позицию для контекстного меню
      const position = getSelectionPosition(
        viewerRef.current,
        bookStyle,
        bookFlow,
        viewerLayout.MIN_VIEWER_WIDTH,
        viewerLayout.MIN_VIEWER_HEIGHT,
        viewerLayout.VIEWER_HEADER_HEIGHT,
        contextmenuWidth
      );
      if (!position) return false;

      const { x, y, height } = position;
      const content = iframeWin.getSelection().toString().trim();
      if (content.length === 0) return false;

      setSelection({
        update: false,
        x,
        y,
        height,
        cfiRange,
        content,
      });

      return true;
    },
    [dispatch, viewerRef, highlights, bookFlow, bookStyle]
  );

  /**
   * При клике на уже существующее выделение
   */
  const onClickHighlight = useCallback(
    (highlightNode: HTMLElement) => {
      const targetNode = highlightNode.parentElement;
      if (!targetNode) return;

      const cfiRange = targetNode.dataset.epubcfi;
      if (!cfiRange) return;

      const { x, y, width, height } = targetNode.getBoundingClientRect();

      setSelection({
        update: true,
        x: x + width / 2 - contextmenuWidth / 2,
        y: y + height,
        height,
        cfiRange,
        content: '',
      });
    },
    [setSelection]
  );

  /**
   * Создание нового выделения
   */
  const onAddHighlight = useCallback(
    (color: string) => {
      const paragraphCfi = getParagraphCfi(selection.cfiRange);
      if (!paragraphCfi) return;

      const highlight: Highlight = {
        key: paragraphCfi + selection.cfiRange,
        accessTime: new Date().toISOString(),
        createTime: new Date().toISOString(),
        color,
        paragraphCfi,
        cfiRange: selection.cfiRange,
        chapterName: currentLocation.chapterName,
        pageNum: currentLocation.currentPage,
        content: selection.content,
      };

      // Добавляем локально и сохраняем на сервер (addHighlight внутри себя вызывает pushHighlight -> saveHighlight)
      dispatch(addHighlight(highlight));

      // Переводим в режим update, чтобы сразу открыть контекстное меню (на ваше усмотрение)
      setSelection({ ...selection, update: true });
    },
    [dispatch, selection, currentLocation]
  );

  /**
   * Обновление (изменение цвета) существующего выделения
   * updateHighlight - это thunk, который сам сделает и локальное обновление, и запрос на сервер.
   */
  const onUpdateHighlight = useCallback(
    (highlight: Highlight | null, color: string) => {
      if (!highlight) return;
      dispatch(
        updateHighlight({
          ...highlight,
          color,
        })
      );
    },
    [dispatch]
  );

  /**
   * Удаление одного конкретного выделения
   */
  const onRemoveHighlight = useCallback(
    (key: string, cfiRange: string) => {
      if (!viewerRef.current || !key) return;

      // Удаляем на сервере (deleteHighlight - thunk), а также локально (popHighlight)
      dispatch(deleteHighlight(key));
      dispatch(popHighlight(key));

      dispatch(
        newSnackbar({
          text: 'Закладка успешно удалена!',
          type: 'INFO',
        })
      );

      // Снимаем с экрана
      if (viewerRef.current.offHighlight) {
        viewerRef.current.offHighlight(cfiRange);
      }
    },
    [dispatch, viewerRef]
  );

  /**
   * Добавление закладки, охватывающей всю текущую страницу
   */
  const onAddBookmark = useCallback(() => {
    if (!viewerRef.current) {
      console.warn('viewerRef.current не определен.');
      return;
    }
  
    const { startCfi, endCfi, chapterName, currentPage } = currentLocation;
  
    if (!startCfi || !endCfi) {
      console.warn('Не удалось получить CFI начала или конца текущей страницы.');
      dispatch(
        newSnackbar({
          text: 'Не удалось создать закладку: не найден CFI начала или конца страницы.',
          type: 'ERROR',
        })
      );
      return;
    }
  
    // Формируем диапазон CFI
    const pageCfiRange = `${startCfi}${endCfi}`;
    console.log('Формированный диапазон CFI:', pageCfiRange);
  
    // Проверяем, нет ли уже закладки для этой страницы
    const existingBookmark = highlights.find((h) => h.cfiRange === pageCfiRange);
    if (existingBookmark) {
      dispatch(
        newSnackbar({
          text: 'Закладка для этой страницы уже существует.',
          type: 'WARNING',
        })
      );
      return;
    }
  
    // Получаем DOM-узел по стартовому CFI
    const node = getNodefromCfi(startCfi);
    if (!node) {
      console.warn(`Не удалось найти узел по CFI: ${startCfi}`);
      dispatch(
        newSnackbar({
          text: 'Не удалось создать закладку: не найден узел начала страницы.',
          type: 'ERROR',
        })
      );
      return;
    }
  
    // Извлекаем текст и берем первые 100 символов
    const textContent = node.textContent || '';
    const snippet = textContent.substring(0, 100);
  
    // Создаем новую закладку
    const bookmark: Highlight = {
      key: `${pageCfiRange}`,
      accessTime: new Date().toISOString(),
      createTime: new Date().toISOString(),
      color: '#FFD700', // Желтый цвет для закладки
      paragraphCfi: startCfi, // Начальный CFI страницы
      cfiRange: pageCfiRange, // Диапазон всей страницы
      chapterName: chapterName,
      pageNum: currentPage,
      content: snippet, // Устанавливаем реальный текст начала страницы
    };
  
    // Добавляем закладку
    dispatch(addHighlight(bookmark));
  
    dispatch(
      newSnackbar({
        text: 'Закладка добавлена.',
        type: 'SUCCESS',
      })
    );
  }, [dispatch, viewerRef, highlights, currentLocation]);
  

  /**
   * При изменении страницы (или при загрузке страницы) заново отображаем все выделения на видимой части
   */
  useEffect(() => {
    if (!viewerRef.current) {
      console.warn('viewerRef.current не определен.');
      return;
    }

    const iframe = viewerRef.current.querySelector('iframe');
    if (!iframe) {
      console.warn('iframe не найден внутри viewerRef.current.');
      return;
    }

    const iframeWin = iframe.contentWindow;
    if (!iframeWin) {
      console.warn('contentWindow iframe не доступен.');
      return;
    }

    highlights.forEach((highlight) => {
      try {
        // Разделяем cfiRange на startCfi/endCfi
        const cfiRangeObj = cfiRangeSpliter(highlight.cfiRange);
        if (!cfiRangeObj) {
          console.warn(`Не удалось разделить cfiRange: ${highlight.cfiRange}`);
          return;
        }

        const { startCfi, endCfi } = cfiRangeObj;

        // Проверяем, попадает ли highlight в текущую видимую страницу
        if (
          compareCfi(currentLocation.startCfi, startCfi) < 1 &&
          compareCfi(currentLocation.endCfi, startCfi) > -1
        ) {
          // Пытаемся найти абзац
          const node = getNodefromCfi(highlight.paragraphCfi);
          if (!node) {
            console.warn(`No startContainer found for epubcfi(${highlight.paragraphCfi})`);
            /**
             * -------------- ГЛАВНОЕ ИЗМЕНЕНИЕ --------------
             * Если не найден контейнер, удаляем ВСЕ выделения (пример).
             */
     //       onRemoveAllHighlights(); // <-- вызываем нашу функцию, которая уберёт все выделения с сервера и локально
            return;
          }

          // Проверяем, есть ли метод onHighlight
          if (
            viewerRef.current.onHighlight &&
            typeof viewerRef.current.onHighlight === 'function'
          ) {
            viewerRef.current.onHighlight(
              highlight.cfiRange,
              (e: any) => {
                try {
                  onClickHighlight(e.target);
                  setIsContextMenu(true);
                } catch (handlerError) {
                  console.error('Ошибка в обработчике клика по выделению:', handlerError);
                }
              },
              highlight.color
            );
          } else {
            console.warn('viewerRef.current.onHighlight не определен или не является функцией.');
          }

          // Убираем стандартное "синее" выделение
          if (iframeWin.getSelection && typeof iframeWin.getSelection === 'function') {
            try {
              const selection = iframeWin.getSelection();
              if (selection) {
                selection.removeAllRanges();
              } else {
                console.warn('getSelection вернул null.');
              }
            } catch (selectionError) {
              console.error('Ошибка при снятии выделения:', selectionError);
            }
          } else {
            console.warn('iframeWin.getSelection не определен или не является функцией.');
          }
        }
      } catch (error) {
        console.error(`Ошибка при обработке highlight с CFI ${highlight.cfiRange}:`, error);
      }
    });
  }, [
    dispatch,
    viewerRef,
    currentLocation,
    highlights,
 //   onRemoveAllHighlights,
    onClickHighlight,
    setIsContextMenu,
  ]);

  return {
    selection,
    onSelection,
    onClickHighlight,
    onAddHighlight,
    onRemoveHighlight,
    onUpdateHighlight,
    onAddBookmark, // Возвращаем новую функцию
    loading,
  };
};

export default useHighlight;
