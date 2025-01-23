// bookSlice.ts
import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { Book } from 'types/book';
import { Page } from 'types/page';
import { Toc } from 'types/toc';
import { Highlight, Color } from 'types/highlight';
import palette from 'lib/styles/palette';

/* 
    Initial State
*/
// Функция для получения значения куки по имени
const getCookie = (name: string): string | null => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
};

// Получаем bookId из wpData
const bookId: number | null = (window as any).wpData?.productId;

if (!bookId) {
    console.warn('bookId не найден в wpData');
}

/** Начальное состояние книги */
const initialBook: Book = {
    coverURL: '',
    title: '',
    description: '',
    published_date: '',
    modified_date: '',
    author: '',
    publisher: '',
    language: ''
};

/** Начальное состояние текущей страницы */
const initialCurrentLocation: Page = {
    chapterName: "-",
    currentPage: 127,
    totalPage: 2,
    startCfi: '',
    endCfi: '',
    base: ''
};

/** Начальное состояние списка цветов */
const initialColorList: Color[] = [
    { name: 'Красный', code: palette.red4 },
    { name: 'Оранжевый', code: palette.orange4 },
    { name: 'Желтый', code: palette.yellow4 },
    { name: 'Зеленый', code: palette.green4 },
    { name: 'Синий', code: palette.blue4 },
    { name: 'Фиолетовый', code: palette.purple4 }
];

/** Интерфейс состояния книги */
export interface BookState {
    book: Book;
    currentLocation: Page;
    toc: Toc[];
    highlights: Highlight[];
    colorList: Color[];
    loading: boolean;
    error: string | null;
}

/** Начальное состояние всего слайса */
const initialState: BookState = {
    book: initialBook,
    currentLocation: initialCurrentLocation,
    toc: [],
    highlights: [],
    colorList: initialColorList,
    loading: false,
    error: null,
};

/* 
    Async Thunks
*/
const API_BASE_URL = `${window.location.origin}/wp-json/myplugin/v1`;

/**
 * Получение всех выделений
 */
export const fetchHighlights = createAsyncThunk<Highlight[]>(
    'book/fetchHighlights',
    async (_, { rejectWithValue }) => {
        try {
            if (!bookId) throw new Error('bookId не найден');
            const token = getCookie('jwt_token');
            if (!token) throw new Error('Токен аутентификации не найден');

            const response = await axios.get(`${API_BASE_URL}/highlights`, {
                withCredentials: true,
                headers: { Authorization: `Bearer ${token}` },
                params: { book_id: bookId },
            });

            if (response.data.status === 'success') {
                return response.data.data;
            } else {
                return rejectWithValue(response.data.message);
            }
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

/**
 * Сохранение нового выделения
 */
export const saveHighlight = createAsyncThunk<Highlight, Highlight>(
    'book/saveHighlight',
    async (highlight, { rejectWithValue }) => {
        try {
            if (!bookId) throw new Error('bookId не найден');
            const token = getCookie('jwt_token');
            if (!token) throw new Error('Токен аутентификации не найден');
            console.log(highlight)
            const response = await axios.post(`${API_BASE_URL}/save-highlight`,
                { highlight },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    withCredentials: true,
                    params: { book_id: bookId },
                }
            );
            console.log(response)
            if (response.data.status === 'success') {
                return highlight;
            } else {
                return rejectWithValue(response.data.message);
            }
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

/**
 * Удаление выделения
 */
export const deleteHighlight = createAsyncThunk<string, string>(
    'book/deleteHighlight',
    async (key, { rejectWithValue }) => {
        try {
            if (!bookId) throw new Error('bookId не найден');
            const token = getCookie('jwt_token');
            if (!token) throw new Error('Токен аутентификации не найден');

            const response = await axios.post(`${API_BASE_URL}/delete-highlight`,
                { key },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    withCredentials: true,
                    params: { book_id: bookId },
                }
            );

            if (response.data.status === 'success') {
                return key;
            } else {
                return rejectWithValue(response.data.message);
            }
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

/**
 * Добавление нового выделения (диспатчит pushHighlight и saveHighlight)
 */
export const addHighlight = createAsyncThunk<Highlight, Highlight>(
    'book/addHighlight',
    async (highlight, { dispatch, rejectWithValue }) => {
        try {
            // Сначала локально добавляем выделение
            dispatch(pushHighlight(highlight));
            // Потом пытаемся сохранить на сервере
            await dispatch(saveHighlight(highlight)).unwrap();
            return highlight;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

/**
 * Обновление выделения:
 * 1) Сразу локально обновляем стейт
 * 2) Шлём запрос на сервер
 * 3) Если запрос упал — можно откатить, если нужно
 */
export const updateHighlight = createAsyncThunk<Highlight, Highlight>(
    'book/updateHighlight',
    async (highlight, { getState, dispatch, rejectWithValue }) => {
        try {
            if (!bookId) throw new Error('bookId не найден');
            const token = getCookie('jwt_token');
            if (!token) throw new Error('Токен аутентификации не найден');

            // 1. Сначала локально обновим (быстрое обновление UI)
            dispatch(updateHighlightLocal(highlight)); 
            
            // 2. Теперь отправим запрос на сервер
            const response = await axios.post(`${API_BASE_URL}/save-highlight`,
                { highlight },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    withCredentials: true,
                    params: { book_id: bookId },
                }
            );

            // 3. Если сервер ответил success
            if (response.data.status === 'success') {
                return highlight; // fulfilled
            } else {
                return rejectWithValue(response.data.message);
            }
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

/* 
    Slice
*/
const bookSlice = createSlice({
    name: 'book',
    initialState,
    reducers: {
        /** 
         * Добавление выделения (Синхронно, только в Redux)
         */
        pushHighlight(state, action: PayloadAction<Highlight>) {
            const exists = state.highlights.find(h => h.key === action.payload.key);
            if (!exists) {
                state.highlights.push(action.payload);
            }
        },
        /** 
         * Удаление выделения (Синхронно, только в Redux)
         */
        popHighlight(state, action: PayloadAction<string>) {
            state.highlights = state.highlights.filter(h => h.key !== action.payload);
        },
        /** Обновление книги */
        updateBook(state, action: PayloadAction<Book>) {
            state.book = action.payload;
        },
        /** Обновление текущей страницы */
        updateCurrentPage(state, action: PayloadAction<Page>) {
            state.currentLocation = action.payload;
        },
        /** 
         * Локальное обновление выделения (переименовали, чтобы не путать с thunk)
         */
        updateHighlightLocal(state, action: PayloadAction<Highlight>) {
            const index = state.highlights.findIndex(h => h.key === action.payload.key);
            if (index !== -1) {
                state.highlights[index] = action.payload;
            }
        },
        /** Инициализация книги до начального состояния */
        clearBook(state) {
            state.book = initialBook;
        },
        /** Обновление оглавления */
        updateToc(state, action: PayloadAction<Toc[]>) {
            state.toc = action.payload;
        },
        /** Инициализация оглавления до пустого состояния */
        clearToc(state) {
            state.toc = [];
        },
    },
    extraReducers: (builder) => {
        // fetchHighlights
        builder.addCase(fetchHighlights.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(fetchHighlights.fulfilled, (state, action: PayloadAction<Highlight[]>) => {
            state.loading = false;
            state.highlights = action.payload;
        });
        builder.addCase(fetchHighlights.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });

        // saveHighlight
        builder.addCase(saveHighlight.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(saveHighlight.fulfilled, (state) => {
            state.loading = false;
            // Уже добавили в pushHighlight
        });
        builder.addCase(saveHighlight.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
            // Откат: удаляем выделение, которое не удалось сохранить
            const failedHighlight = action.meta.arg;
            state.highlights = state.highlights.filter(h => h.key !== failedHighlight.key);
        });

        // deleteHighlight
        builder.addCase(deleteHighlight.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(deleteHighlight.fulfilled, (state, action: PayloadAction<string>) => {
            state.loading = false;
            state.highlights = state.highlights.filter(h => h.key !== action.payload);
        });
        builder.addCase(deleteHighlight.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });

        // addHighlight
        builder.addCase(addHighlight.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(addHighlight.fulfilled, (state) => {
            state.loading = false;
        });
        builder.addCase(addHighlight.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
            // Откат: удаляем выделение, которое не удалось сохранить
            const failedHighlight = action.meta.arg;
            state.highlights = state.highlights.filter(h => h.key !== failedHighlight.key);
        });

        // updateHighlight (теперь это thunk!)
        builder.addCase(updateHighlight.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(updateHighlight.fulfilled, (state) => {
            state.loading = false;
            // Локальное обновление мы сделали раньше (в updateHighlightLocal)
        });
        builder.addCase(updateHighlight.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
            // Если хотите, можно здесь делать откат (вернуть прежнее значение).
        });
    },
});

// Экспортируем действия
export const {
    updateBook,
    clearBook,
    updateCurrentPage,
    updateToc,
    clearToc,
    pushHighlight,
    popHighlight,
    updateHighlightLocal, // <-- Синхронное локальное
} = bookSlice.actions;

// Экспортируем редьюсер
export default bookSlice.reducer;
