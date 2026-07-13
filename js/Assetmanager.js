class AssetManager {
    constructor() {
        this.images = {};
        this.loadedCount = 0;
        this.totalCount = 0;
        this.onAllLoaded = null;
    }

    loadImage(key, src) {
        this.totalCount++;
        const img = new Image();
        img.src = src;
        
        img.onload = () => {
            this.loadedCount++;
            if (this.loadedCount === this.totalCount && this.onAllLoaded) {
                this.onAllLoaded();
            }
        };
        
        img.onerror = () => {
            console.warn('Failed to load image:', src);
            this.loadedCount++;
            if (this.loadedCount === this.totalCount && this.onAllLoaded) {
                this.onAllLoaded();
            }
        };
        
        this.images[key] = img;
        return img;
    }

    get(key) {
        return this.images[key] || null;
    }

    isLoaded(key) {
        return this.images[key] && 
               this.images[key].complete && 
               this.images[key].naturalWidth > 0;
    }

    areAllLoaded() {
        return this.loadedCount === this.totalCount;
    }
}
