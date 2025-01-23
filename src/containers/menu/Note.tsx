import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { popHighlight } from 'slices/book'; // Экшн для удаления выделения из Redux
// компоненты
import Highlight from 'containers/menu/commons/Highlight';
import Wrapper from 'components/sideMenu/Wrapper';
import LearningLayout from 'components/note/Layout';
import MenuEmpty from 'components/sideMenu/MenuEmpty';
// типы
import { RootState } from 'slices';
import HighlightType from 'types/highlight';
import { MenuControl } from 'lib/hooks/useMenu';
import Selection from 'types/selection'; // Тип для выделения
import useHighlight from 'lib/hooks/useHighlight'; // Хук для работы с выделениями
import { BookStyle, BookFlow } from 'types/book'; // Импорт типов BookStyle и BookFlow

// Дефолтные значения для BookStyle и BookFlow
const defaultBookStyle: BookStyle = {
  fontFamily: 'Roboto',  // Пример значения, можно заменить на ваш дефолтный
  fontSize: 16,          // Пример значения, можете подставить свой дефолт
  lineHeight: 1.5,       // Пример значения
  marginHorizontal: 10,  // Пример значения
  marginVertical: 10,     // Пример значения
  brightness:100,
};

const defaultBookFlow: BookFlow = 'paginated'; // Или 'scrolled-doc', в зависимости от вашего случая

const Note = ({ 
  control, 
  onToggle, 
  onClickHighlight, 
  emitEvent,
  viewerRef 
}: Props, ref: any) => {
  const dispatch = useDispatch();
  const highlights = useSelector<RootState, HighlightType[]>(state => state.book.highlights);
  const [highlightList, setHighlightList] = useState<any[]>([]);

  // Передаем дефолтные значения для bookStyle и bookFlow
  const { onRemoveHighlight } = useHighlight(viewerRef, () => {}, defaultBookStyle, defaultBookFlow); 

  /** Устанавливаем контент выделений */
  useEffect(() => {
    const Items = highlights.map(h => (
      <div style={{display: 'flex', alignItems: 'flex-start', marginRight: '4vw'}} key={h.key} data-highlight-key={h.key}>
        <Highlight
          highlight={h}
          onClick={onClickHighlight}
          emitEvent={emitEvent}
          viewerRef={viewerRef}
        />
        <button
          onClick={() => onRemoveHighlight(h.key, h.cfiRange)} // Используем onRemoveHighlight для удаления
          style={{  cursor: 'pointer', padding: '0' }}
        >
          <img src="/wp-content/uploads/2024/12/zacladka_icon-close.svg" alt="menu-icon" />
        </button>
      </div>
    ));
    setHighlightList(Items);
  }, [highlights, onClickHighlight, emitEvent, viewerRef, onRemoveHighlight]);

  return (
    <>
      {control.display && (
        <Wrapper title="Закладки"
                 show={control.open}
                 onClose={onToggle}
                 ref={ref}>
          <LearningLayout>
            {highlightList.length > 0 ? highlightList : <MenuEmpty text="Нет закладок" />}
          </LearningLayout>
        </Wrapper>
      )}
    </>
  );
};

interface Props {
  control: MenuControl;
  onToggle: () => void;
  onClickHighlight: (highlightNode: any) => void;
  emitEvent: () => void;
  viewerRef: any;
}

export default React.forwardRef(Note);
