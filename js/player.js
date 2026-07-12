class Player {
    constructor(world, assetManager) {
        this.world = world;
        this.assets = assetManager;
        this.size = 100;
        this.speed = 150;
        this.targetX = null;
        this.targetY = null;
        this.controlMode = 'joystick';
        
        this.x = world.width / 2 - this.size / 2;
        this.y = world.height / 2 - this.size / 2;
        
        this.direction = 'idle'; // 'up', 'down', 'idle'
        this.lastDirection = 'down'; // پیش‌فرض رو به پایین
        
        // انیمیشن حرکت به بالا
        this.isWalking = false;
        this.walkFrame = 0; // 0=posht2, 1=posht1, 2=posht3
        this.walkTimer = 0;
        this.walkInterval = 100;
        
        // ترتیب فریم‌ها برای حرکت به بالا: 2 -> 1 -> 3 -> 2 -> 1 -> 3
        this.upFrames = ['up2', 'up1', 'up3'];
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

    moveWithJoystick(angle, intensity, dt) {
        this.targetX = null;
        this.targetY = null;
        
        if (intensity < 0.05) {
            this.stopWalking();
            return;
        }
        
        const dx = Math.cos(angle) * this.speed * intensity * dt;
        const dy = Math.sin(angle) * this.speed * intensity * dt;
        
        this.x += dx;
        this.y += dy;
        
        // تشخیص جهت: اگر زاویه به سمت بالا باشه (sin منفی)
        if (Math.sin(angle) < -0.05) {
            this.direction = 'up';
        } else if (Math.sin(angle) > 0.05) {
            this.direction = 'down';
        }
        // حرکت کاملاً افقی: جهت قبلی حفظ میشه
        
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
            this.walkFrame = 0; // شروع از posht2
            this.walkTimer = 0;
        }
    }

    stopWalking() {
        this.isWalking = false;
        this.walkFrame = 0;
        this.walkTimer = 0;
    }

    update(dt) {
        // انیمیشن با deltaTime
        if (this.isWalking && this.direction === 'up') {
            // فقط در حرکت به بالا انیمیشن اجرا میشه
            this.walkTimer += dt * 1000;
            
            if (this.walkTimer >= this.walkInterval) {
                this.walkTimer -= this.walkInterval;
                this.walkFrame = (this.walkFrame + 1) % 3; // 0->1->2->0->1->2
            }
        }

        // حرکت در حالت کلیک
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
            
            // تشخیص جهت بر اساس هدف
            if (dy < -1) {
                // هدف بالای بازیکنه
                this.direction = 'up';
            } else if (dy > 1) {
                // هدف پایین بازیکنه
                this.direction = 'down';
            }
            
            this.startWalking();
            this.clamp();
        }
        
        // وقتی حرکت نمی‌کنه، idle
        if (!this.isWalking) {
            this.direction = 'idle';
        }
    }

    draw(ctx, camera) {
        const screenX = this.x - camera.x;
        const screenY = this.y - camera.y;
        
        // نقطه هدف
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

        // انتخاب عکس
        let imageKey = 'front'; // پیش‌فرض pangnafasdam
        
        if (this.direction === 'up') {
            // حرکت به بالا: انیمیشن 2-1-3
            imageKey = this.upFrames[this.walkFrame];
        } else if (this.direction === 'down') {
            // حرکت به پایین: فقط pangnafasdam
            imageKey = 'front';
        } else if (this.direction === 'idle') {
            // ایستاده: pangnafasdam
            imageKey = 'front';
        }

        const image = this.assets.get(imageKey);
        
        if (image && this.assets.isLoaded(imageKey)) {
            ctx.save();
            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(image, screenX, screenY, this.size, this.size);
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
