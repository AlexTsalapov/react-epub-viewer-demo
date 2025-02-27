import { useDispatch } from 'react-redux'
// компоненты
import Wrapper from 'components/note/highlight/Wrapper'
import Title from 'components/note/highlight/Title'
import Post from 'components/note/highlight/Post'
// slices
import { updateHighlight } from 'slices/book'
// utils
import { cfiRangeSpliter } from 'lib/utils/commonUtil'
// types
import HighlightType from 'types/highlight'

const Highlight = ({ 
  highlight, 
  onClick, 
  emitEvent, 
  viewerRef, 
  onContextMenu  // Добавляем обработчик для контекстного меню
}: Props) => {
  const dispatch = useDispatch()

  /** Обработчик клика по выделению */
  const onClickHighlight = () => {
    if (!viewerRef.current) return;

    const now = new Date().toISOString();
    dispatch(updateHighlight({
      ...highlight,
      accessTime: now
    }));

    const splitCfi = cfiRangeSpliter(highlight.cfiRange);
    if (!splitCfi) return;

    const { startCfi } = splitCfi;

    viewerRef.current.setLocation(startCfi);
    emitEvent();

    const svgContainer = viewerRef.current.querySelector("svg");
    if (!svgContainer) return;

    const targetSvg = svgContainer.querySelector(`g[data-epubcfi="${highlight.cfiRange}"]`);
    if (!targetSvg) return;

    onClick(targetSvg.childNodes[0]);
  }

  return (
    <Wrapper onClick={onClickHighlight} onContextMenu={onContextMenu}>
      <div>
        <Title>{highlight.chapterName}</Title>
        <Post color={highlight.color}>{highlight.content}</Post>
      </div>
    </Wrapper>
  );
}

interface Props {
  highlight: HighlightType;
  onClick: (highlightNode: any) => void;
  emitEvent: () => void;
  viewerRef: any;
  onContextMenu?: () => void;  // Определяем обработчик для контекстного меню
}

export default Highlight
