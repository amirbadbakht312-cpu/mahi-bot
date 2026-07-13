class AssetManager {
    constructor() {
        this.images = {};
        this.loadedCount = 0;
        this.totalCount = 0;
        this.onAllLoaded = null;
        this.allLoadedFired = false;
    }

    loadImage(key, src) {
        // جلوگیری از بارگذاری تکراری
        if (this.images[key]) {
            return this.images[key];
        }

        this.totalCount++;
        const img = new Image();

        // اول هندلرها رو وصل کن، بعد src رو تنظیم کن
        img.onload = () => {
            this.loadedCount++;
            this.checkAllLoaded();
        };

        img.onerror = () => {
            console.warn('Failed to load image:', src);
            this.loadedCount++;
            this.checkAllLoaded();
        };

        // src رو بعد از هندلرها تنظیم کن
        img.src = src;

        // اگه عکس از کش لود شده باشه و complete باشه
        if (img.complete) {
            this.loadedCount++;
            this.checkAllLoaded();
        }

        this.images[key] = img;
        return img;
    }

    checkAllLoaded() {
        if (!this.allLoadedFired && this.loadedCount >= this.totalCount && this.totalCount > 0) {
            this.allLoadedFired = true;
            if (this.onAllLoaded) {
                this.onAllLoaded();
            }
        }
    }

    get(key) {
        return this.images[key] || null;
    }

    isLoaded(key) {
        const img = this.images[key];
        return img && img.complete && img.naturalWidth > 0;
    }

    areAllLoaded() {
        return this.loadedCount >= this.totalCount && this.totalCount > 0;
    }

    // برای بارگذاری مرحله‌ای (اختیاری - اگه بعداً بخوای چیز جدید لود کنی)
    resetCounter() {
        this.allLoadedFired = false;
        this.loadedCount = 0;
        this.totalCount = 0;
        this.images = {};
    }
}
