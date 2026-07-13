class Player {
    constructor(world) {
        this.world = world;
        this.size = 100;
        this.speed = 150;
        this.targetX = null;
        this.targetY = null;
        this.controlMode = 'joystick';
        
        this.x = world.width / 2 - this.size / 2;
        this.y = world.height / 2 - this.size / 2;
        
        this.direction = 'idle';
        this.isWalking = false;
        this.walkFrame = 0;
        this.walkTimer = 0;
        this.walkInterval = 100;
        
        // لود مستقیم عکس‌ها
        this.images = {};
        this.imagesLoaded = false;
        
        this.loadImage('front', 'assets/images/pangnafasdam.png');
        this.loadImage('up1', 'assets/images/pangghadamposht1.png');
        this.loadImage('up2', 'assets/images/pangghadamposht2.png');
        
        // ساخت تصویر قرینه شده
        this.reversedImage = null;
    }

    loadImage(key, src) {
        const img = new Image();
        img.onload = () => {
            this.images[key] = img;
            this.checkAllLoaded();
        };
        img.onerror = () => {
            console.warn('Failed to load:', src);
        };
        img.src = src;
    }

    checkAllLoaded() {
        if (this.images.front && this.images.up1 && this.images.up2) {
            this.imagesLoaded = true;
            this.createReversedImage();
        }
    }

    createReversedImage() {
        if (!this.images.up2) return;
        
        const canvas = document.createElement('canvas');
        canvas.width = this.size;
        canvas.height = this.size;
        const ctx = canvas.getContext('2d');
        
        ctx.translate(this.size, 0);
        ctx.scale(-1, 1);
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(this.images.up2, 0, 0, this.size, this.size);
        
        this.reversedImage = new Image();
        this.reversedImage.src = canvas.toDataURL();
    }

    setControlMode(mode) {
        this.controlMode = mode;
        this.stop();
    }

    moveWithJoystick(angle, intensity, dt) {
        this.targetX = null;
        this.targetY = null;
        
        if (intensity < 0.05) {
            this.stopWalking();
            return;
        }
        
        this.x += Math.cos(angle) * this.speed * intensity * dt;
        this.y += Math.sin(angle) * this.speed * intensity * dt;
        
        if (Math.sin(angle) < -0.05) {
            this.direction = 'up';
        } else if (Math.sin(angle) > 0.05) {
            this.direction = 'down';
        }
        
        this.startWalking();
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
        this.stopWalking();
    }

    clamp() {
        this.x = Math.max(0, Math.min(this.world.width - this.size, this.x));
        this.y = Math.max(0, Math.min(this.world.height - this.size, this.y));
    }

    startWalking() {
        if (!this.isWalking) {
            this.isWalking = true;
            this.walkFrame = 0;
            this.walkTimer = 0;
        }
    }

    stopWalking() {
        this.isWalking = false;
        this.walkFrame = 0;
        this.walkTimer = 0;
    }

    update(dt) {
        if (this.isWalking && this.direction === 'up') {
            this.walkTimer += dt * 1000;
            if (this.walkTimer >= this.walkInterval) {
                this.walkTimer -= this.walkInterval;
                this.walkFrame = (this.walkFrame + 1) % 3;
            }
        }

        if (this.controlMode === 'click' && this.targetX !== null && this.targetY !== null) {
            const dx = this.targetX - this.x;
            const dy = this.targetY - this.y;
            const distance = Math.hypot(dx, dy);

            if (distance < this.speed * dt) {
                this.x = this.targetX;
                this.y = this.targetY;
                this.stop();
                return;
            }

            const angle = Math.atan2(dy, dx);
            this.x += Math.cos(angle) * this.speed * dt;
            this.y += Math.sin(angle) * this.speed * dt;
            
            this.direction = dy < -1 ? 'up' : dy > 1 ? 'down' : this.direction;
            this.startWalking();
            this.clamp();
        }
        
        if (!this.isWalking) {
            this.direction = 'idle';
        }
    }

    draw(ctx, camera) {
        const screenX = this.x - camera.x;
        const screenY = this.y - camera.y;
        
        // نقطه هدف
        if (this.controlMode === 'click' && this.targetX !== null && this.targetY !== null) {
            const tx = this.targetX + this.size / 2 - camera.x;
            const ty = this.targetY + this.size / 2 - camera.y;
            ctx.fillStyle = '#00ff88';
            ctx.beginPath();
            ctx.arc(tx, ty, 6, 0, Math.PI * 2);
            ctx.fill();
        }

        // انتخاب عکس
        let img = null;
        
        if (this.direction === 'up') {
            const frames = [this.images.up2, this.images.up1, this.reversedImage];
            img = frames[this.walkFrame] || this.images.front;
        } else {
            img = this.images.front;
        }

        // رسم
        if (img && img.complete && img.naturalWidth > 0) {
            ctx.save();
            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(img, screenX, screenY, this.size, this.size);
            ctx.restore();
        } else {
            // مربع پیش‌فرض
            ctx.fillStyle = '#00d2ff';
            ctx.fillRect(screenX, screenY, this.size, this.size);
        }
    }
}
