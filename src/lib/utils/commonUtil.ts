import { EpubCFI } from 'epubjs'
// types
import { BookStyle, BookFlow } from 'types/book'


/**
 * DateTime to `yyyy-mm-dd`
 * @param {Date} time 
 */
 export const timeFormatter = (time: Date): string => {
	const yyyy = time.getFullYear();
	const mm = time.getMonth() + 1;
	const dd = time.getDate();
	const msg = `${yyyy}-${mm}-${dd}`;

	return msg;
}
/**
 * Получение CFI начала текущей страницы
 * @param viewerRef Реф на Viewer-компонент
 * @returns CFI начала страницы или null
 */
export const getPageStartCfi = (viewerRef: React.RefObject<any>): string | null => {
	if (!viewerRef.current || typeof viewerRef.current.getPageStartCfi !== 'function') {
	  console.warn('[getPageStartCfi] viewerRef.current.getPageStartCfi не определён или не является функцией');
	  return null;
	}
	return viewerRef.current.getPageStartCfi();
  };
  
  /**
   * Получение CFI конца текущей страницы
   * @param viewerRef Реф на Viewer-компонент
   * @returns CFI конца страницы или null
   */
  export const getPageEndCfi = (viewerRef: React.RefObject<any>): string | null => {
	if (!viewerRef.current || typeof viewerRef.current.getPageEndCfi !== 'function') {
	  console.warn('[getPageEndCfi] viewerRef.current.getPageEndCfi не определён или не является функцией');
	  return null;
	}
	return viewerRef.current.getPageEndCfi();
  };

/**
 * Comparison of two CFI sizes
 * - -1 : CFI 1 < CFI 2
 * - 0 : CFI 1 == CFI 2
 * - 1 : CFI 1 > CFI 2
 * @param cfi_1 CFI 1
 * @param cfi_2 CFI 2
 */
export const compareCfi = (cfi_1: string, cfi_2: string): number => {
	const epubcfi = new EpubCFI();
	return epubcfi.compare(cfi_1, cfi_2);
};


/**
 * Split CFI range into startCfi and endCfi.
 * If cfiRange is a single CFI, startCfi and endCfi will be the same.
 * @param cfiRange CFIRange или одиночный CFI
 * @returns { startCfi: string, endCfi: string } | null
 */
export const cfiRangeSpliter = (cfiRange: string): { startCfi: string; endCfi: string } | null => {
	// Удаляем лишние оборачивания epubcfi
	while (cfiRange.startsWith('epubcfi(epubcfi(') && cfiRange.endsWith('))')) {
	  cfiRange = cfiRange.slice(8, -1); // Убираем внешние 'epubcfi(' и ')'
	}
  
	if (!cfiRange.startsWith('epubcfi(') || !cfiRange.endsWith(')')) {
	  console.warn(`Invalid CFI format: ${cfiRange}`);
	  return null;
	}
  
	const content = cfiRange.slice(8, -1); // Убираем 'epubcfi(' и ')'
  
	// Проверяем, содержит ли cfiRange запятую (т.е., является диапазоном)
	if (content.includes(',')) {
	  const [origin, start, end] = content.split(',');
  
	  if (!origin || !start || !end) {
		console.warn(`Invalid CFI range content: ${content}`);
		return null;
	  }
  
	  const startCfi = `epubcfi(${origin}${start})`;
	  const endCfi = `epubcfi(${origin}${end})`;
	  return { startCfi, endCfi };
	} else {
	  // Одиночный CFI, используем его как startCfi и endCfi
	  const singleCfi = `epubcfi(${content})`;
	  return { startCfi: singleCfi, endCfi: singleCfi };
	}
  };


/**
 * Whether the two CFI ranges nested
 * - true : Nested
 * - false : Not nested
 * - null : Invalid CFIRange
 * @param cfiRange1 First CFIRange
 * @param cfiRange2 Second CFIRange
 */
export const clashCfiRange = (baseCfiRange: string, targetCfiRange: string) => {
	const splitCfi1 = cfiRangeSpliter(baseCfiRange);
	const splitCfi2 = cfiRangeSpliter(targetCfiRange);

	if (!splitCfi1 || !splitCfi2) return null;

	const { startCfi: s1, endCfi: e1 } = splitCfi1;
	const { startCfi: s2, endCfi: e2 } = splitCfi2;

	if ((compareCfi(s2, s1) <= 0 && compareCfi(s1, e2) <= 0)
		||(compareCfi(s2, e1) <= 0 && compareCfi(e1, e2) <= 0)
		||(compareCfi(s1, s2) <= 0 && compareCfi(e2, e1) <= 0)) {
		return true;
	}
	return false;
}

/**
 * Получение CFI текущей страницы
 * @param viewerRef Ссылка на компонент Viewer
 * @returns CFI текущей страницы или null, если не удалось получить
 */
export const getPageCfi = (viewerRef: React.RefObject<any>): string | null => {
	if (!viewerRef.current || typeof viewerRef.current.getCurrentCfi !== 'function') {
	  console.warn('[getPageCfi] viewerRef.current.getCurrentCfi не определён или не является функцией');
	  return null;
	}
  
	const cfi = viewerRef.current.getCurrentCfi();
	return cfi || null;
  };
/**
 * Extract paragraph CFI from CFIRange
 * - null : Invalid CFIRange
 * @param cfiRange CFIRange
 */
export const getParagraphCfi = (cfiRange: string) => {
	if (!cfiRange) return;

	const content = cfiRange.slice(8, -1);
	const [origin, start, end] = content.split(',');
	
	if (!origin || !start || !end) return null;

	const cfi = `epubcfi(${origin})`;
	return cfi;
}


/**
 * Получение DOM-узла по CFI с задержкой на загрузку содержимого
 * @param cfi CFI
 * @returns HTML Element или null
 */
export const getNodefromCfi = (cfi: string): HTMLElement | null => {
	try {
	  const iframe = document.querySelector('iframe');
	  if (!iframe || !iframe.contentDocument) {
		console.warn('Iframe или его содержимое не загружено.');
		return null;
	  }
  
	  const epubcfi = new EpubCFI(cfi);
	  const range = epubcfi.toRange(iframe.contentDocument);
  
	  if (!range) {
		console.warn(`Не удалось создать range для CFI: ${cfi}`);
		return null;
	  }
  
	  const node = range.startContainer?.parentElement as HTMLElement;
	  if (!node) {
		console.warn(`Не удалось найти элемент по CFI: ${cfi}`);
		return null;
	  }
  
	  return node;
	} catch (error) {
	  console.error(`Ошибка при получении узла по CFI: ${cfi}`, error);
	  return null;
	}
  };
  
/**
 * Selection absolute location
 * @param viewer viewerRef.current
 * @param bookStyle bookStyle
 * @param bookFlow book-flow
 * @param MIN_VIEWER_WIDTH min viewer width
 * @param MIN_VIEWER_HEIGHT min viewer height
 * @param VIEWER_HEADER_HEIGHT viewer header height
 * @param CONTEXTMENU_WIDTH contextmenu width
 * @returns Contextmenu location
 */
export const getSelectionPosition = (
	viewer: any,
	bookStyle: BookStyle,
	bookFlow: BookFlow,
	MIN_VIEWER_WIDTH: number,
	MIN_VIEWER_HEIGHT: number,
	VIEWER_HEADER_HEIGHT: number,
	CONTEXTMENU_WIDTH: number
): { x: number, y: number, height: number, width: number } | null => {
	const { 
		innerWidth: windowWidth,
		innerHeight: windowHeight 
	} = window;

	const iframeWidth = viewer.offsetWidth;

	const scrollTop = viewer.querySelector('div').scrollTop;

	const iframe = viewer.querySelector('iframe');
	const selection_ = iframe && iframe.contentWindow && iframe.contentWindow.getSelection();
	if (!selection_ || selection_.rangeCount === 0) return null;

	const range = selection_.getRangeAt(0);
	const {
		x: selectionX,
		y: selectionY,
		height: selectionHeight,
		width: selectionWidth
	} = range.getBoundingClientRect();

	const marginLeft = ~~((windowWidth - MIN_VIEWER_WIDTH) / 100 * bookStyle.marginHorizontal / 2);
	const marginTop = bookFlow === "scrolled-doc"
		? 0
		: ~~((windowHeight - VIEWER_HEADER_HEIGHT - MIN_VIEWER_HEIGHT) / 100 * bookStyle.marginVertical / 2);

	const x = ~~(selectionX % iframeWidth + marginLeft + ( selectionWidth / 2 - CONTEXTMENU_WIDTH / 2));
	const y = ~~(selectionY + selectionHeight + VIEWER_HEADER_HEIGHT + marginTop - scrollTop);

	return { 
		x, 
		y, 
		height: selectionHeight, 
		width: selectionWidth 
	};
}

/**
 * Debounce
 * @param func Target function
 * @param timeout delay
 */
 export function debounce<Params extends any[]>(
  timeout: number,
  func: (...args: Params) => any,
): (...args: Params) => void {
  let timer: NodeJS.Timeout
  return (...args: Params) => {
    clearTimeout(timer)
    timer = setTimeout(() => {
      func(...args)
    }, timeout)
  }
}