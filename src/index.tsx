import React from 'react';
import ReactDOM from 'react-dom';
import Reader from 'containers/Reader';

// Проверяем наличие wpData и epubUrl
const EPUB_URL = window.wpData && window.wpData.epubUrl ? window.wpData.epubUrl : "http://demetrius-ru.n94413.hostde19.fornex.host/wp-content/uploads/2024/12/Alices-Adventures-in-Wonderland.epub";

console.log('EPUB URL:', EPUB_URL); // Для отладки

ReactDOM.render(<Reader url={EPUB_URL} />, document.getElementById('root'));
