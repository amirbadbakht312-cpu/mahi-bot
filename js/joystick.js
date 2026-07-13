class Joystick {
    constructor(canvas) {
        this.canvas = canvas;
        this.radius = 60;
        this.maxDist = 50;
        this.active = false;
        this.dx = 0;
        this.dy = 0;
        this.centerX = 100;
        this.centerY = canvas ? canvas.height / 2 : window.innerHeight / 2;
        this.isDragging = false;
    }

    updatePosition() {
        if (this.canvas) {
            this.centerY = this.canvas.height / (window.devicePixelRatio || 1);
        } else {
            this.centerY = window.innerHeight / 2;
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

    getPosition() {
        return { x: this.centerX, y: this.centerY };
    }

    startDragging(x, y) {
        this.isDragging = false;
        const dist = Math.hypot(x - this.centerX, y - this.centerY);
        if (dist <= this.radius + 20) {
            this.isDragging = true;
            return true;
        }
        return false;
    }

    moveDragging(x, y) {
        if (!this.isDragging) return;
        this.centerX = x;
        this.centerY = y;
    }

    endDragging() {
        this.isDragging = false;
    }

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

    end() {
        this.active = false;
        this.dx = 0;
        this.dy = 0;
    }

    draw(ctx, isDraggingMode = false) {
        if (!ctx) return;
        
        ctx.beginPath();
        ctx.arc(this.centerX, this.centerY, this.radius, 0, Math.PI * 2);
        
        if (isDraggingMode) {
            const pulse = Math.sin(Date.now() / 300) * 0.1 + 0.2;
            ctx.fillStyle = `rgba(255, 200, 0, ${pulse})`;
            ctx.strokeStyle = 'rgba(255, 200, 0, 0.8)';
            ctx.lineWidth = 3;
        } else {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.lineWidth = 2;
        }
        
        ctx.fill();
        ctx.stroke();

        if (this.active && !isDraggingMode) {
            const stickX = this.centerX + this.dx;
            const stickY = this.centerY + this.dy;
            ctx.beginPath();
            ctx.arc(stickX, stickY, 22, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.fill();
        } else {
            ctx.beginPath();
            ctx.arc(this.centerX, this.centerY, isDraggingMode ? 22 : 18, 0, Math.PI * 2);
            ctx.fillStyle = isDraggingMode ? 'rgba(255, 200, 0, 0.8)' : 'rgba(255, 255, 255, 0.4)';
            ctx.fill();
        }
    }
}
