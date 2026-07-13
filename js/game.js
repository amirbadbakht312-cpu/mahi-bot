window.addEventListener('DOMContentLoaded', () => {
    console.log('=== DOM loaded ===');

    const canvas = document.getElementById('gameCanvas');
    if (!canvas) {
        console.error('Canvas not found!');
        return;
    }
    
    const ctx = canvas.getContext('2d');
    let gameStarted = false;

    let currentControlMode = 'joystick';
    let isDraggingPositionMode = false;
    let isDraggingJoystick = false;
    let mouseIsDown = false;
    let activeTouchId = null;

    let lastTime = 0;
    let deltaTime = 0;

    // ساخت AssetManager
    const assets = new AssetManager();
    
    // تنظیم onAllLoaded قبل از loadImage
    assets.onAllLoaded = () => {
        console.log('>>> onAllLoaded fired');
        startGame();
    };

    // لود عکس‌ها
    console.log('Loading images...');
    assets.loadImage('front', 'assets/images/pangnafasdam.png');
    assets.loadImage('up1', 'assets/images/pangghadamposht1.png');
    assets.loadImage('up2', 'assets/images/pangghadamposht2.png');
    console.log('Total assets:', assets.totalCount);

    // Fallback: اگه تا ۳ ثانیه دیگه لود نشد، وضعیت رو نشون بده
    setTimeout(() => {
        if (!gameStarted) {
            console.warn('GAME NOT STARTED AFTER 3 SECONDS');
            console.log('Loaded:', assets.loadedCount, '/', assets.totalCount);
            console.log('Keys:', Object.keys(assets.images));
            
            // بررسی کدوم عکس‌ها لود نشدن
            ['front', 'up1', 'up2'].forEach(key => {
                const img = assets.get(key);
                if (img) {
                    console.log(key + ':', img.complete ? 'loaded' : 'loading', 'src:', img.src);
                } else {
                    console.warn(key + ': NOT FOUND');
                }
            });
            
            // حتی اگه کامل لود نشده، بازی رو شروع کن (با تصاویر پیش‌فرض)
            console.warn('Force starting game without all assets...');
            startGame();
        }
    }, 3000);

    // شیءهای بازی
    let world, camera, player, joystick, minimap;
    
    try {
        console.log('Creating game objects...');
        world = new World();
        camera = new Camera(world);
        player = new Player(world, assets);
        joystick = new Joystick(canvas);
        minimap = new Minimap(world);
        console.log('All game objects created successfully');
    } catch (err) {
        console.error('Error creating game objects:', err);
        return;
    }

    function applySettings() {
        const savedMode = localStorage.getItem('penguin_control_mode') || 'joystick';
        const savedSize = parseInt(localStorage.getItem('penguin_joystick_size') || '60');
        const savedX = parseInt(localStorage.getItem('penguin_joystick_x') || '100');
        const savedY = localStorage.getItem('penguin_joystick_y') || 'center';
        
        currentControlMode = savedMode;
        if (player) player.setControlMode(savedMode);
        if (joystick) {
            joystick.setSize(savedSize);
            const joyY = savedY === 'center' ? window.innerHeight / 2 : parseInt(savedY);
            joystick.setPosition(savedX, joyY);
        }
    }

    function resizeEverything() {
        if (!canvas || !ctx) return;
        
        const dpr = window.devicePixelRatio || 1;
        canvas.width = window.innerWidth * dpr;
        canvas.height = window.innerHeight * dpr;
        canvas.style.width = window.innerWidth + 'px';
        canvas.style.height = window.innerHeight + 'px';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        
        if (world) world.updatePageSize();
        if (camera) camera.updateViewSize();
        if (joystick) joystick.updatePosition();
        if (minimap) minimap.updatePosition();
        if (player) player.clamp();
    }

    window.addEventListener('resize', resizeEverything);

    // توابع عمومی
    window.setControlMode = (mode) => {
        currentControlMode = mode;
        if (player) player.setControlMode(mode);
        mouseIsDown = false;
        activeTouchId = null;
        if (joystick) joystick.end();
    };

    window.setJoystickSize = (size) => { if (joystick) joystick.setSize(size); };
    window.setJoystickPosition = (x, y) => { if (joystick) joystick.setPosition(x, y); };

    window.startDraggingPosition = () => {
        isDraggingPositionMode = true;
        isDraggingJoystick = false;
        activeTouchId = null;
        if (canvas) canvas.style.cursor = 'grab';
    };

    window.confirmPosition = () => {
        isDraggingPositionMode = false;
        isDraggingJoystick = false;
        activeTouchId = null;
        if (joystick) joystick.endDragging();
        if (canvas) canvas.style.cursor = '';
    };

    window.getJoystickPosition = () => {
        return joystick ? joystick.getPosition() : { x: 100, y: window.innerHeight / 2 };
    };

    function getCanvasCoords(e) {
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return { x: clientX - rect.left, y: clientY - rect.top };
    }

    function getTouchCoords(e, touchId) {
        if (!canvas) return null;
        const rect = canvas.getBoundingClientRect();
        for (let i = 0; i < e.touches.length; i++) {
            if (e.touches[i].identifier === touchId) {
                return {
                    x: e.touches[i].clientX - rect.left,
                    y: e.touches[i].clientY - rect.top
                };
            }
        }
        return null;
    }

    // Mouse events
    canvas.addEventListener('mousedown', (e) => {
        if (!player || !joystick) return;
        const { x, y } = getCanvasCoords(e);
        
        if (isDraggingPositionMode) {
            isDraggingJoystick = joystick.startDragging(x, y);
            if (isDraggingJoystick && canvas) canvas.style.cursor = 'grabbing';
            return;
        }

        mouseIsDown = true;
        
        if (currentControlMode === 'joystick') {
            joystick.startJoystick(x, y);
        } else {
            player.setTarget(x + camera.x, y + camera.y);
        }
    });

    canvas.addEventListener('mousemove', (e) => {
        if (!player || !joystick) return;
        const { x, y } = getCanvasCoords(e);
        
        if (isDraggingPositionMode) {
            if (isDraggingJoystick) {
                joystick.moveDragging(x, y);
            } else {
                const dist = Math.hypot(x - joystick.centerX, y - joystick.centerY);
                if (canvas) canvas.style.cursor = dist <= joystick.radius + 20 ? 'grab' : 'default';
            }
            return;
        }

        if (!mouseIsDown) return;
        
        if (currentControlMode === 'joystick') {
            joystick.moveJoystick(x, y);
        }
    });

    window.addEventListener('mouseup', () => {
        if (!joystick) return;
        
        if (isDraggingPositionMode) {
            if (isDraggingJoystick) {
                isDraggingJoystick = false;
                if (canvas) canvas.style.cursor = 'grab';
            }
            return;
        }
        mouseIsDown = false;
        joystick.end();
    });

    // Touch events
    window.addEventListener('touchstart', (e) => {
        if (!player || !joystick) return;
        e.preventDefault();
        
        if (activeTouchId !== null) return;
        
        const touch = e.touches[0];
        if (!touch) return;
        
        activeTouchId = touch.identifier;
        const rect = canvas.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        
        if (isDraggingPositionMode) {
            isDraggingJoystick = joystick.startDragging(x, y);
            return;
        }

        if (currentControlMode === 'joystick') {
            joystick.startJoystick(x, y);
        } else {
            player.setTarget(x + camera.x, y + camera.y);
        }
    }, { passive: false });

    window.addEventListener('touchmove', (e) => {
        if (!player || !joystick) return;
        e.preventDefault();
        
        if (activeTouchId === null) return;
        
        const coords = getTouchCoords(e, activeTouchId);
        if (!coords) return;
        
        if (isDraggingPositionMode && isDraggingJoystick) {
            joystick.moveDragging(coords.x, coords.y);
            return;
        }

        if (currentControlMode === 'joystick') {
            joystick.moveJoystick(coords.x, coords.y);
        }
    }, { passive: false });

    window.addEventListener('touchend', (e) => {
        if (!joystick) return;
        e.preventDefault();
        
        let touchFound = false;
        for (let i = 0; i < e.touches.length; i++) {
            if (e.touches[i].identifier === activeTouchId) {
                touchFound = true;
                break;
            }
        }
        
        if (!touchFound) {
            activeTouchId = null;
            
            if (isDraggingPositionMode) {
                if (isDraggingJoystick) isDraggingJoystick = false;
                return;
            }
            joystick.end();
        }
    }, { passive: false });

    window.addEventListener('touchcancel', (e) => {
        e.preventDefault();
        activeTouchId = null;
        
        if (isDraggingPositionMode) {
            isDraggingJoystick = false;
            return;
        }
        if (joystick) joystick.end();
    }, { passive: false });

    function update(dt) {
        if (!player || !camera) return;
        
        if (isDraggingPositionMode) {
            player.stopWalking();
        } else {
            if (currentControlMode === 'joystick' && joystick) {
                const movement = joystick.getMovement();
                if (movement) {
                    player.moveWithJoystick(movement.angle, movement.intensity, dt);
                }
            }
        }
        
        player.update(dt);
        camera.follow(player.x, player.y, player.size);
    }

    function draw() {
        if (!ctx || !world || !player || !camera || !joystick || !minimap) return;
        
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        
        try {
            world.draw(ctx, camera);
            player.draw(ctx, camera);
            
            if (currentControlMode === 'joystick' || isDraggingPositionMode) {
                joystick.draw(ctx, isDraggingPositionMode);
            }
            
            minimap.draw(ctx, player, camera);
        } catch (err) {
            console.error('Error in draw:', err);
        }
    }

    function gameLoop(timestamp) {
        if (lastTime === 0) lastTime = timestamp;
        deltaTime = (timestamp - lastTime) / 1000;
        lastTime = timestamp;
        if (deltaTime > 0.1) deltaTime = 0.016;
        
        update(deltaTime);
        draw();
        requestAnimationFrame(gameLoop);
    }

    function startGame() {
        if (gameStarted) {
            console.warn('Game already started, skipping...');
            return;
        }
        
        console.log('=== START GAME ===');
        gameStarted = true;
        
        applySettings();
        resizeEverything();
        lastTime = performance.now();
        requestAnimationFrame(gameLoop);
    }

    // شروع بازی
    // Fallback با setTimeout صفر
    setTimeout(() => {
        if (!gameStarted && assets.areAllLoaded()) {
            console.log('Starting game via setTimeout fallback');
            startGame();
        }
    }, 0);

    // بررسی فوری
    if (assets.areAllLoaded() && !gameStarted) {
        console.log('Assets already loaded, starting immediately');
        startGame();
    }
});
