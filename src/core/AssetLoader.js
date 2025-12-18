/**
 * ASSET LOADER
 * Preloads all game assets (images, audio) and tracks progress
 * @module core/AssetLoader
 */

export class AssetLoader {
    constructor() {
        this.cache = {
            images: {},
            audio: {}
        };
        this.totalAssets = 0;
        this.loadedAssets = 0;
    }

    /**
     * Load all assets defined in the asset list
     * @param {Object} assetList - Object containing 'images' and 'audio' arrays
     * @param {Function} onProgress - Callback(progress) where progress is 0.0 to 1.0
     * @returns {Promise} Resolves when all assets are loaded
     */
    async loadAll(assetList, onProgress = () => { }) {
        const images = assetList.images || [];
        const audio = assetList.audio || [];

        this.totalAssets = images.length + audio.length;
        this.loadedAssets = 0;

        // If nothing to load, resolve immediately
        if (this.totalAssets === 0) {
            onProgress(1.0);
            return Promise.resolve(this.cache);
        }

        const loadPromises = [];

        // Load Images
        images.forEach(src => {
            loadPromises.push(this.loadImage(src, onProgress));
        });

        // Load Audio
        audio.forEach(src => {
            loadPromises.push(this.loadAudio(src, onProgress));
        });

        await Promise.all(loadPromises);
        return this.cache;
    }

    loadImage(src, onProgress = () => { }) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                this.cache.images[src] = img;
                this.loadedAssets++;
                onProgress(this.loadedAssets / this.totalAssets);
                resolve(img);
            };
            img.onerror = (e) => {
                console.error(`Failed to load image: ${src}`, e);
                // Resolve anyway to prevent hanging, but log error
                this.loadedAssets++;
                onProgress(this.loadedAssets / this.totalAssets);
                resolve(null);
            };
            img.src = src;
        });
    }

    loadAudio(src, onProgress = () => { }) {
        return new Promise((resolve, reject) => {
            const audio = new Audio();
            audio.oncanplaythrough = () => {
                this.cache.audio[src] = audio;
                this.loadedAssets++;
                onProgress(this.loadedAssets / this.totalAssets);
                resolve(audio);
            };
            audio.onerror = (e) => {
                console.error(`Failed to load audio: ${src}`, e);
                this.loadedAssets++;
                onProgress(this.loadedAssets / this.totalAssets);
                resolve(null);
            };
            audio.src = src;
            audio.load();
        });
    }

    /**
     * Get a loaded image
     * @param {string} src 
     * @returns {HTMLImageElement}
     */
    getImage(src) {
        if (!this.cache.images[src] && src) {
            // Lazy load attempt for dynamic assets
            this.cache.images[src] = new Image();
            this.cache.images[src].src = src;
        }
        return this.cache.images[src];
    }

    /**
     * Get a loaded audio object
     * @param {string} src 
     * @returns {HTMLAudioElement}
     */
    getAudio(src) {
        return this.cache.audio[src];
    }
    /**
     * Get a video object (lazy cached)
     * @param {string} src 
     * @returns {HTMLVideoElement}
     */
    getVideo(src) {
        if (!this.cache.images[src]) { // Reuse cache or separate? Better separate but for now reuse or new prop?
            // "cache.images" is misnamed if we put videos there. Let's make a videos cache.
        }
        if (!this.cache.videos) this.cache.videos = {};

        if (!this.cache.videos[src]) {
            const v = document.createElement('video');
            v.src = src;
            v.crossOrigin = "anonymous";
            v.preload = "auto";
            v.muted = false; // Allow sound if needed? Loop logic in Window.
            this.cache.videos[src] = v;
        }
        return this.cache.videos[src];
    }
}

export const assetLoader = new AssetLoader();
