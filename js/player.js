class Player {
    constructor(canvas) {
        this.canvas = canvas;
        this.size = 40;
        this.speed = 5;
        
        // موقعیت اولیه: وسط صفحه
        this.x = canvas.width / 2 - this.size / 2;
        this.y = canvas.height / 2 - this.size / 2;
    }

    // بروزرسانی موقعیت بر اساس تغییر اندازه صفحه
    updatePositionOnResize() {
        this.x = this.canvas.width / 2 - this.size / 2;
        this.y = this.canvas.height / 2 - this.size / 2;
    }

    // حرکت بازیکن بر اساس زاویه و شدت
    move(angle, intensity) {
        this.x += Math.cos(angle) * this.speed * intensity;
        this.y += Math.sin(angle) * this.speed * intensity;

        // محدود کردن به صفحه
        this.x = Math.max(0, Math.min(this.canvas.width - this.size, this.x));
        this.y = Math.max(0, Math.min(this.canvas.height - this.size, this.y));
    }

    // رسم مربع بازیکن
    draw(ctx) {
        ctx.fillStyle = '#00d2ff';
        ctx.shadowColor = '#00d2ff';
        ctx.shadowBlur = 15;
        ctx.fillRect(this.x, this.y, this.size, this.size);
        ctx.shadowBlur = 0;
        ctx.shadowColor = 'transparent';
    }
                          }
