// hooks/useLoadLocation.ts
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function useLoadLocation(productId?: number) {
  const [initialLocation, setInitialLocation] = useState<string | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);

  useEffect(() => {
    async function loadReadingProgress() {
      if (!productId) {
        // Нет productId — показываем первую страницу как дефолт
        setInitialLocation('epubcfi(/6/2[cover]!/6)');
        setIsLoadingLocation(false);
        return;
      }
      try {
        // ВАША логика получения токена из куки
        const token = document.cookie.replace(/(?:(?:^|.*;\s*)jwt_token\s*\=\s*([^;]*).*$)|^.*$/, '$1');

        const res = await axios.get('/wp-json/myplugin/v1/get-reading-progress', {
          params: { product_id: productId },
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data?.status === 'success' && res.data?.data?.start_cfi) {
          setInitialLocation(res.data.data.start_cfi);
        } else {
          setInitialLocation('epubcfi(/6/2[cover]!/6)');
        }
      } catch (err) {
        console.error('Ошибка при загрузке прогресса:', err);
        setInitialLocation('epubcfi(/6/2[cover]!/6)');
      } finally {
        setIsLoadingLocation(false);
      }
    }

    loadReadingProgress();
  }, [productId]);

  return { initialLocation, isLoadingLocation };
}
