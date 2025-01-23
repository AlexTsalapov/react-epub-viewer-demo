// BookmarkButton.tsx

import React from 'react';
import useHighlight from '../../lib/hooks/useHighlight'; // Путь к вашему хуку useHighlight
import { BookStyle, BookFlow } from 'types/book';

interface BookmarkButtonProps {
  viewerRef: React.RefObject<any>;
  bookStyle: BookStyle;
  bookFlow: BookFlow;
}

const BookmarkButton: React.FC<BookmarkButtonProps> = ({ viewerRef, bookStyle, bookFlow }) => {
  const [isContextMenu, setIsContextMenu] = React.useState(false);

  const {
    onAddBookmark,
    // Другие функции и состояния из хука, если необходимо
  } = useHighlight(viewerRef, setIsContextMenu, bookStyle, bookFlow);

  return (
    <button onClick={onAddBookmark} style={styles.button}>
      Добавить закладку
    </button>
  );
};

const styles = {
  button: {
    position: 'fixed' as 'fixed',
    bottom: '20px',
    right: '20px',
    padding: '10px 20px',
    backgroundColor: '#FFD700',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    zIndex: 1000,
  },
};

export default BookmarkButton;
