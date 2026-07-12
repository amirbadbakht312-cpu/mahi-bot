class Player {
    constructor(world) {
        this.world = world;
        this.size = 100;
        this.speed = 1.67;
        this.targetX = null;
        this.targetY = null;
        this.controlMode = 'joystick';
        
        this.x = world.width / 2 - this.size / 2;
        this.y = world.height / 2 - this.size / 2;
        
        // جهت حرکت: 'up', 'down', 'idle'
        this.direction = 'idle';
        
        // وضعیت انیمیشن قدم زدن
        this.isWalking = false;
        this.walkFrame = 0; // 0, 1, 2 برای سه فریم
        this.walkTimer = 0;
        this.walkInterval = 100; // 0.1 ثانیه به میلی‌ثانیه
        
        // عکس‌ها
        this.imageUp = new Image();
        this.imageUp.src = 'assets/images/pangghadamposht.jpeg';
        this.imageUpLoaded = false;
        this.imageUp.onload = () => { this.imageUpLoaded = true; };
        
        this.imageDown1 = new Image();
        this.imageDown1.src = 'assets/images/pangghadamposht1.jpeg';
        this.imageDown1Loaded = false;
        this.imageDown1.onload = () => { this.imageDown1Loaded = true; };
        
        this.imageDown2 = new Image();
        this.imageDown2.src = 'assets/images/pangghadamposht2.jpeg';
        this.imageDown2Loaded = false;
        this.imageDown2.onload = () => { this.imageDown2Loaded = true; };
        
        this.imageDown3 = new Image();
        this.imageDown3.src = 'assets/images/pangghadamposht3.jpeg';
        this.imageDown3Loaded = false;
        this.imageDown3.onload = () => { this.imageDown3Loaded = true; };
        
        // عکس پیش‌فرض (وقتی حرکت نمی‌کنه)
        this.imageIdle = new Image();
        this.imageIdle.src = 'assets/images/pangnafasdam.jpeg';
        this.imageIdleLoaded = false;
        this.imageIdle.onload = () => { this.imageIdleLoaded = true; };
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
        
        // فقط حرکت عمودی (بالا یا پایین)
        // زاویه بین -PI/2 تا PI/2 یعنی پایین، بقیه یعنی بالا
        const sinAngle = Math.sin(angle);
        
        if (sinAngle > 0.1) {
            // حرکت به پایین
            this.direction = 'down';
            this.y += this.speed * intensity;
            this.startWalking();
        } else if (sinAngle < -0.1) {
            // حرکت به بالا
            this.direction = 'up';
            this.y -= this.speed * intensity;
            this.startWalking();
        } else {
            // حرکت افقی خیلی کم - می‌تونیم ایستاده بمونیم
            // اما اگه intensity زیاده، شاید یه مقدار حرکت عمودی داره
            if (intensity > 0.3) {
                // حرکت خیلی کم عمودی
                this.direction = 'idle';
            } else {
                this.stopWalking();
            }
        }
        
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
        const clamped = this.world.clampPosition(this.x, this.y, this.size);
        this.x = clamped.x;
        this.y = clamped.y;
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
        this.direction = 'idle';
    }

    update() {
        // بروزرسانی انیمیشن قدم زدن
        if (this.isWalking) {
            this.walkTimer += 16.67; // تقریباً 60fps
            
            if (this.walkTimer >= this.walkInterval) {
                this.walkTimer = 0;
                this.walkFrame = (this.walkFrame + 1) % 3;
            }
        }

        // حرکت در حالت کلیک
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

            // فقط حرکت عمودی
            if (dy > 0) {
                this.direction = 'down';
                this.y += this.speed;
                this.startWalking();
            } else if (dy < 0) {
                this.direction = 'up';
                this.y -= this.speed;
                this.startWalking();
            }
            
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

        // انتخاب عکس بر اساس جهت و انیمیشن
        let imageToDraw = null;
        
        if (this.direction === 'up') {
            // حرکت به بالا - عکس پشت
            if (this.imageUpLoaded) {
                imageToDraw = this.imageUp;
            }
        } else if (this.direction === 'down' && this.isWalking) {
            // حرکت به پایین - انیمیشن قدم زدن
            if (this.walkFrame === 0 && this.imageDown1Loaded) {
                imageToDraw = this.imageDown1;
            } else if (this.walkFrame === 1 && this.imageDown2Loaded) {
                imageToDraw = this.imageDown2;
            } else if (this.walkFrame === 2 && this.imageDown3Loaded) {
                imageToDraw = this.imageDown3;
            }
        } else if (this.direction === 'idle') {
            // ایستاده
            if (this.imageIdleLoaded) {
                imageToDraw = this.imageIdle;
            }
        }

        // رسم عکس یا مربع پیش‌فرض
        if (imageToDraw) {
            ctx.save();
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(imageToDraw, screenX, screenY, this.size, this.size);
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
