class Joystick {
    constructor(canvas) {
        this.canvas = canvas;
        this.radius = 60;
        this.maxDist = 50;
        this.active = false;
        this.dx = 0;
        this.dy = 0;
        this.centerX = 0;
        this.centerY = 0;
        
        this.updatePosition();
    }

    // بروزرسانی موقعیت جوی‌استیک بر اساس سایز صفحه
    updatePosition() {
        this.centerX = this.radius + 40;
        this.centerY = this.canvas.height / 2;
    }

    // شروع کنترل: بررسی می‌کند که نقطه شروع داخل دایره باشد
    start(x, y) {
        const distToCenter = Math.hypot(x - this.centerX, y - this.centerY);
        if (distToCenter <= this.radius) {
            this.active = true;
            this.updateStickPosition(x, y);
            return true;
        }
        return false;
    }

    // بروزرسانی موقعیت دسته جوی‌استیک
    move(x, y) {
        if (!this.active) return;
        this.updateStickPosition(x, y);
    }

    // پایان کنترل
    end() {
        this.active = false;
        this.dx = 0;
        this.dy = 0;
    }

    // محاسبه موقعیت دسته نسبت به مرکز
    updateStickPosition(x, y) {
        let dx = x - this.centerX;
        let dy = y - this.centerY;
        const distance = Math.hypot(dx, dy);

        if (distance > this.maxDist) {
            const angle = Math.atan2(dy, dx);
            dx = Math.cos(angle) * this.maxDist;
            dy = Math.sin(angle) * this.maxDist;
        }

        this.dx = dx;
        this.dy = dy;
    }

    // دریافت زاویه و شدت حرکت
    getMovement() {
        if (!this.active) return null;
        
        const intensity = Math.min(1, Math.hypot(this.dx, this.dy) / this.maxDist);
        const angle = Math.atan2(this.dy, this.dx);
        
        return { angle, intensity };
    }

    // رسم جوی‌استیک
    draw(ctx) {
        // دایره بیرونی
        ctx.beginPath();
        ctx.arc(this.centerX, this.centerY, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // دسته جوی‌استیک
        if (this.active) {
            const stickX = this.centerX + this.dx;
            const stickY = this.centerY + this.dy;
            
            ctx.beginPath();
            ctx.arc(stickX, stickY, 25, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.fill();
        } else {
            ctx.beginPath();
            ctx.arc(this.centerX, this.centerY, 20, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.fill();
        }
    }
  }
