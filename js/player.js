class Player {
    constructor(world) {
        this.world = world;
        this.size = 100; // دو برابر شده (قبلاً 50 بود)
        this.speed = 1.67; // یک سوم شده (قبلاً 5 بود)
        this.targetX = null;
        this.targetY = null;
        this.controlMode = 'joystick';
        
        this.x = world.width / 2 - this.size / 2;
        this.y = world.height / 2 - this.size / 2;
        
        // لود عکس از مسیر جدید
        this.image = new Image();
        this.image.src = 'assets/images/pangnafasdam.jpeg';
        this.imageLoaded = false;
        this.image.onload = () => { 
            this.imageLoaded = true; 
        };
        this.image.onerror = () => { 
            this.imageLoaded = false; 
        };
    }

    updatePositionOnResize() {
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
        
        // نمایش نقطه هدف در حالت کلیک
        if (this.controlMode === 'click' && this.targetX !== null && this.targetY !== null) {
            const targetScreenX = this.targetX + this.size / 2 - camera.x;
            const targetScreenY = this.targetY + this.size / 2 - camera.y;
            
            ctx.fillStyle = '#00ff88';
            ctx.beginPath();
            ctx.arc(targetScreenX, targetScreenY, 6, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.strokeStyle = 'rgba(0, 255, 136, 0.5)';
            ctx.lineWidth = 1;
            ctx.stroke();
        }

        // رسم عکس یا مربع پیش‌فرض
        if (this.imageLoaded) {
            // رسم عکس با سایز دقیق
            ctx.save();
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(this.image, screenX, screenY, this.size, this.size);
            ctx.restore();
        } else {
            // مربع پیش‌فرض
            ctx.fillStyle = '#00d2ff';
            ctx.shadowColor = '#00d2ff';
            ctx.shadowBlur = 15;
            ctx.fillRect(screenX, screenY, this.size, this.size);
            ctx.shadowBlur = 0;
            ctx.shadowColor = 'transparent';
        }
    }
    }
