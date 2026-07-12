class Player {
    constructor(world) {
        this.world = world;
        this.size = 40;
        this.speed = 5;
        this.targetX = null;
        this.targetY = null;
        this.controlMode = 'joystick';
        
        // شروع از وسط دنیا
        this.x = world.width / 2 - this.size / 2;
        this.y = world.height / 2 - this.size / 2;
    }

    updatePositionOnResize() {
        // وسط دنیا
        this.x = this.world.width / 2 - this.size / 2;
        this.y = this.world.height / 2 - this.size / 2;
        this.targetX = null;
        this.targetY = null;
    }

    setControlMode(mode) {
        this.controlMode = mode;
        this.stop();
    }

    moveWithJoystick(angle, intensity) {
        this.targetX = null;
        this.targetY = null;
        this.x += Math.cos(angle) * this.speed * intensity;
        this.y += Math.sin(angle) * this.speed * intensity;
        this.clamp();
    }

    setTarget(x, y) {
        if (this.controlMode !== 'click') return;
        // تبدیل مختصات صفحه به مختصات دنیا
        this.targetX = x - this.size / 2;
        this.targetY = y - this.size / 2;
    }

    stop() {
        this.targetX = null;
        this.targetY = null;
    }

    clamp() {
        const clamped = this.world.clampPosition(this.x, this.y, this.size);
        this.x = clamped.x;
        this.y = clamped.y;
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

    draw(ctx, camera) {
        const screenX = this.x - camera.x;
        const screenY = this.y - camera.y;
        
        if (this.controlMode === 'click' && this.targetX !== null && this.targetY !== null) {
            const targetScreenX = this.targetX - camera.x;
            const targetScreenY = this.targetY - camera.y;
            
            ctx.beginPath();
            ctx.moveTo(screenX + this.size / 2, screenY + this.size / 2);
            ctx.lineTo(targetScreenX + this.size / 2, targetScreenY + this.size / 2);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            ctx.stroke();
            ctx.setLineDash([]);
            
            ctx.beginPath();
            ctx.arc(targetScreenX + this.size / 2, targetScreenY + this.size / 2, 5, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.fill();
        }

        ctx.fillStyle = '#00d2ff';
        ctx.shadowColor = '#00d2ff';
        ctx.shadowBlur = 15;
        ctx.fillRect(screenX, screenY, this.size, this.size);
        ctx.shadowBlur = 0;
        ctx.shadowColor = 'transparent';
    }
}
