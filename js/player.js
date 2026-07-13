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
        
        this.direction = 'idle';
        
        this.isWalking = false;
        this.walkFrame = 0;
        this.walkTimer = 0;
        this.walkInterval = 100;
        
        this.upFrames = ['up2', 'up1', 'up2_reversed'];
        
        // Canvas اشتراکی برای قرینه کردن (static)
        if (!Player._reversedCanvas) {
            Player._reversedCanvas = document.createElement('canvas');
            Player._reversedCanvas.width = this.size;
            Player._reversedCanvas.height = this.size;
            Player._reversedCtx = Player._reversedCanvas.getContext('2d');
        }
        
        this.reversedImage = null;
        this.needsReversedUpdate = true;
    }

    setPosition(x, y) {
        this.x = x;
        this.y = y;
    }

    updatePositionOnResize() {
        // فقط clamp کن، ریست نکن به وسط
        this.clamp();
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

    updateReversedImage() {
        const originalImage = this.assets.get('up2');
        if (!originalImage || !this.assets.isLoaded('up2')) return;
        
        const canvas = Player._reversedCanvas;
        const ctx = Player._reversedCtx;
        
        ctx.clearRect(0, 0, this.size, this.size);
        ctx.save();
        ctx.translate(this.size, 0);
        ctx.scale(-1, 1);
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(originalImage, 0, 0, this.size, this.size);
        ctx.restore();
        
        this.reversedImage = new Image();
        this.reversedImage.src = canvas.toDataURL();
        this.needsReversedUpdate = false;
    }

    update(dt) {
        if (this.needsReversedUpdate && this.assets.isLoaded('up2')) {
            this.updateReversedImage();
        }

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
            
            if (dy < -1) {
                this.direction = 'up';
            } else if (dy > 1) {
                this.direction = 'down';
            }
            
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

        let imageToDraw = null;
        
        if (this.direction === 'up') {
            const frameKey = this.upFrames[this.walkFrame];
            if (frameKey === 'up2_reversed') {
                imageToDraw = this.reversedImage || this.assets.get('up2');
            } else {
                imageToDraw = this.assets.get(frameKey);
            }
        } else {
            imageToDraw = this.assets.get('front');
        }

        if (!imageToDraw) {
            imageToDraw = this.assets.get('front');
        }

        if (imageToDraw && imageToDraw.complete && imageToDraw.naturalWidth > 0) {
            ctx.save();
            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(imageToDraw, screenX, screenY, this.size, this.size);
            ctx.restore();
        }
    }
}
