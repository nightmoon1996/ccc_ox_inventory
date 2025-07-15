import { useState, useEffect } from 'react';
import { imagePreloader } from '../utils/imagePreloader';

export const useImagePreload = (imageUrl: string | undefined) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!imageUrl || imageUrl === 'none' || imageUrl === '') {
      setIsLoaded(false);
      setIsLoading(false);
      return;
    }

    // Check if already cached
    if (imagePreloader.isCached(imageUrl)) {
      setIsLoaded(true);
      setIsLoading(false);
      return;
    }

    // Start loading
    setIsLoading(true);
    setIsLoaded(false);

    imagePreloader.preloadImage(imageUrl)
      .then(() => {
        setIsLoaded(true);
        setIsLoading(false);
      })
      .catch(() => {
        // Even if preloading fails, we'll still try to show the image
        setIsLoaded(true);
        setIsLoading(false);
      });
  }, [imageUrl]);

  return { isLoaded, isLoading };
};
