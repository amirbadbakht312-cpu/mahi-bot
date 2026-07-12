class Player {
    constructor(canvas) {
        this.canvas = canvas;
        this.size = 40;
        this.speed = 5;
        this.targetX = null;
        this.targetY = null;
        this.controlMode = 'joystick'; // 'joystick' یا 'click'
        
        // موقعیت اولیه: وسط صفحه
        this.x = canvas.width / 2 - this.size / 2;
        this.y = canvas.height / 2 - this.size / 2;
    }

    updatePositionOnResize() {
        this.x = this.canvas.width / 2 - this.size / 2;
        this.y = this.canvas.height / 2 - this.size / 2;
        this.targetX = null;
        this.targetY = null;
    }

    setControlMode(mode) {
        this.controlMode = mode;
        this.stop();
    }

    // حرکت با جوی‌استیک
    moveWithJoystick(angle, intensity) {
        this.targetX = null;
        this.targetY = null;
        this.x += Math.cos(angle) * this.speed * intensity;
        this.y += Math.sin(angle) * this.speed * intensity;
        this.clamp();
    }

    // تنظیم هدف برای حالت کلیک
    setTarget(x, y) {
        if (this.controlMode !== 'click') return;
        this.targetX = x - this.size / 2;
        this.targetY = y - this.size / 2;
    }

    stop() {
        this.targetX = null;
        this.targetY = null;
    }

    clamp() {
        this.x = Math.max(0, Math.min(this.canvas.width - this.size, this.x));
        this.y = Math.max(0, Math.min(this.canvas.height - this.size, this.y));
    }

    update() {
        if (this.controlMode === 'click' && this.targetX !== null && this.targetY !== null) {
            const dx = this.targetX - this.x;
            const dy = this.targetY - this.y;
            const distance = Math.hypot(dx, dy);

            if (distance < this.speed) {
                this.x = this.targetX;
                this.y = this.targetY;
                this.stop();
                return;
            }

            const angle = Math.atan2(dy, dx);
            this.x += Math.cos(angle) * this.speed;
            this.y += Math.sin(angle) * this.speed;
            this.clamp();
        }
    }

    draw(ctx) {
        // خط راهنما در حالت کلیک
        if (this.controlMode === 'click' && this.targetX !== null && this.targetY !== null) {
            ctx.beginPath();
            ctx.moveTo(this.x + this.size / 2, this.y + this.size / 2);
            ctx.lineTo(this.targetX + this.size / 2, this.targetY + this.size / 2);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            ctx.stroke();
            ctx.setLineDash([]);
            
            ctx.beginPath();
            ctx.arc(this.targetX + this.size / 2, this.targetY + this.size / 2, 5, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.fill();
        }

        // رسم مربع
        ctx.fillStyle = '#00d2ff';
        ctx.shadowColor = '#00d2ff';
        ctx.shadowBlur = 15;
        ctx.fillRect(this.x, this.y, this.size, this.size);
        ctx.shadowBlur = 0;
        ctx.shadowColor = 'transparent';
    }
}
