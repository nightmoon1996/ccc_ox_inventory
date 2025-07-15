class ImagePreloader {
  private cache = new Map<string, HTMLImageElement>();

  preloadImage(url: string): Promise<void> {
    if (this.cache.has(url)) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.cache.set(url, img);
        resolve();
      };
      img.onerror = () => {
        reject(new Error(`Failed to load image: ${url}`));
      };
      img.src = url;
    });
  }

  isCached(url: string): boolean {
    return this.cache.has(url);
  }

  getCachedImage(url: string): HTMLImageElement | undefined {
    return this.cache.get(url);
  }
}

export const imagePreloader = new ImagePreloader();
