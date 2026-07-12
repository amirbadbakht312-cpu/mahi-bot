class Camera {
    constructor(world) {
        this.world = world;
        this.x = 0;
        this.y = 0;
        this.viewWidth = window.innerWidth;
        this.viewHeight = window.innerHeight;
    }

    updateViewSize() {
        this.viewWidth = window.innerWidth;
        this.viewHeight = window.innerHeight;
    }

    follow(targetX, targetY, targetSize) {
        // مرکز دوربین روی بازیکن
        let targetCenterX = targetX + targetSize / 2;
        let targetCenterY = targetY + targetSize / 2;
        
        this.x = targetCenterX - this.viewWidth / 2;
        this.y = targetCenterY - this.viewHeight / 2;
        
        // محدود کردن دوربین به دنیا
        this.x = Math.max(0, Math.min(this.world.width - this.viewWidth, this.x));
        this.y = Math.max(0, Math.min(this.world.height - this.viewHeight, this.y));
        
        // اگه دنیا از صفحه کوچیک‌تره، وسط چین کن
        if (this.world.width <= this.viewWidth) {
            this.x = (this.world.width - this.viewWidth) / 2;
        }
        if (this.world.height <= this.viewHeight) {
            this.y = (this.world.height - this.viewHeight) / 2;
        }
    }
}
