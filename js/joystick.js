class Joystick {
    constructor(canvas) {
        this.canvas = canvas;
        this.radius = 60;
        this.maxDist = 50;
        this.active = false;
        this.dx = 0;
        this.dy = 0;
        this.centerX = 100;
        this.centerY = canvas.height / 2;
        
        // برای حالت کلیک
        this.startX = 0;
        this.startY = 0;
        this.currentX = 0;
        this.currentY = 0;
    }

    updatePosition() {
        // موقعیت به‌روزرسانی می‌شود چون canvas.height ممکن است تغییر کند
        if (this.centerY === 0) {
            this.centerY = this.canvas.height / 2;
        }
    }

    setSize(size) {
        this.radius = size;
        this.maxDist = size - 10;
    }

    setPosition(x, y) {
        this.centerX = x;
        this.centerY = y;
    }

    // حالت جوی‌استیک
    startJoystick(x, y) {
        const distToCenter = Math.hypot(x - this.centerX, y - this.centerY);
        if (distToCenter <= this.radius) {
            this.active = true;
            this.updateStickPosition(x, y);
            return true;
        }
        return false;
    }

    moveJoystick(x, y) {
        if (!this.active) return;
        this.updateStickPosition(x, y);
    }

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

    getMovement() {
        if (!this.active) return null;
        const intensity = Math.min(1, Math.hypot(this.dx, this.dy) / this.maxDist);
        const angle = Math.atan2(this.dy, this.dx);
        return { angle, intensity };
    }

    // حالت کلیک
    startClick(x, y) {
        this.active = true;
        this.startX = x;
        this.startY = y;
        this.currentX = x;
        this.currentY = y;
    }

    moveClick(x, y) {
        if (!this.active) return;
        this.currentX = x;
        this.currentY = y;
    }

    getCurrentPosition() {
        if (!this.active) return null;
        return { x: this.currentX, y: this.currentY };
    }

    end() {
        this.active = false;
        this.dx = 0;
        this.dy = 0;
    }

    draw(ctx, mode) {
        if (mode === 'joystick') {
            this.drawJoystick(ctx);
        } else if (mode === 'click' && this.active) {
            this.drawClickIndicator(ctx);
        }
    }

    drawJoystick(ctx) {
        // دایره بیرونی
        ctx.beginPath();
        ctx.arc(this.centerX, this.centerY, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // دسته
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

    drawClickIndicator(ctx) {
        // دایره شروع
        ctx.beginPath();
        ctx.arc(this.startX, this.startY, 30, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // دایره فعلی
        ctx.beginPath();
        ctx.arc(this.currentX, this.currentY, 25, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fill();

        // خط
        ctx.beginPath();
        ctx.moveTo(this.startX, this.startY);
        ctx.lineTo(this.currentX, this.currentY);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 3;
        ctx.stroke();
    }
}
