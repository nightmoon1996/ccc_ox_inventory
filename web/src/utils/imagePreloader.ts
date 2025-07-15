class ImagePreloader {
  private cache = new Map<string, HTMLImageElement>();
  private blacklist = new Set([
    // Weapon skins
    'at_skin_luxe.png',
    'at_skin_wood.png',
    'at_skin_skull.png',
    'at_skin_patriotic.png',
    'at_skin_love.png',
    'at_skin_bulletholes.png',
    'at_skin_pimp.png',
    'at_skin_bodyguard.png',
    'at_skin_metal.png',
    'at_skin_burgershot.png',
    'at_skin_pearl.png',
    'at_skin_perseus.png',
    'at_skin_festive.png',
    'at_skin_hate.png',
    'at_skin_king.png',
    'at_skin_vip.png',
    'at_skin_security.png',
    'at_skin_ballas.png',
    'at_skin_player.png',
    'at_skin_blagueurs.png',
    'at_skin_trippy.png',
    'at_skin_geometric.png',
    'at_skin_wall.png',
    'at_skin_boom.png',
    'at_skin_tiedye.png',
    'at_skin_vagos.png',
    'at_skin_sessanta.png',
    'at_skin_fatalincursion.png',
    'at_skin_zebra.png',
    'at_skin_luchalibre.png',
    'at_skin_brushstroke.png',
    'at_skin_diamond.png',
    'at_skin_woodland.png',
    'at_skin_splatter.png',
    'at_skin_leopard.png',
    'at_skin_camo.png',
    'at_skin_dollar.png',
    'at_skin_cluckinbell.png',

    // Missing weapons
    'WEAPON_SNOWLAUNCHER.png',
    'WEAPON_TACTICALRIFLE.png',
    'WEAPON_BATTLERIFLE.png',
    'WEAPON_DAGGER.png',
    'WEAPON_TEARGAS.png',

    // Missing attachments
    'at_scope_macro.png',
    'at_muzzle_precision.png',
    'at_compensator.png',

    // Missing ammo
    'ammo-firework.png',

    // Other missing items
    'clothing.png'
  ]);

  preloadImage(url: string): Promise<void> {
    if (this.cache.has(url)) {
      return Promise.resolve();
    }

    // Check if URL is blacklisted
    const urlParts = url.split('/');
    const filename = urlParts[urlParts.length - 1];
    if (this.blacklist.has(filename)) {
      return Promise.resolve(); // Skip blacklisted images
    }

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.cache.set(url, img);
        resolve();
      };
      img.onerror = () => {
        // Add to blacklist if it fails to load
        this.blacklist.add(filename);
        reject(new Error(`Failed to load image: ${url}`));
      };
      img.src = url;
    });
  }

  // New method: Only preload if not already cached
  preloadImageIfNeeded(url: string): Promise<void> {
    if (this.cache.has(url)) {
      return Promise.resolve(); // Already cached, no need to preload
    }
    return this.preloadImage(url);
  }

  // New method: Preload multiple images efficiently
  preloadImages(urls: string[]): Promise<void[]> {
    const uncachedUrls = urls.filter(url => !this.cache.has(url) && !this.isBlacklisted(url));
    const promises = uncachedUrls.map(url => this.preloadImage(url).catch(() => {
      // Silently fail for individual images
    }));
    return Promise.all(promises);
  }

  isCached(url: string): boolean {
    return this.cache.has(url);
  }

  getCachedImage(url: string): HTMLImageElement | undefined {
    return this.cache.get(url);
  }

  isBlacklisted(url: string): boolean {
    const urlParts = url.split('/');
    const filename = urlParts[urlParts.length - 1];
    return this.blacklist.has(filename);
  }

  // Get cache statistics
  getCacheStats() {
    return {
      cachedCount: this.cache.size,
      blacklistedCount: this.blacklist.size,
      totalProcessed: this.cache.size + this.blacklist.size
    };
  }
}

export const imagePreloader = new ImagePreloader();
