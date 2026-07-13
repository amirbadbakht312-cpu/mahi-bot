window.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    let currentControlMode = 'joystick';
    let isDraggingPositionMode = false;
    let isDraggingJoystick = false;
    let mouseIsDown = false;

    // Multi-touch support
    let activeTouchId = null;

    let lastTime = 0;
    let deltaTime = 0;
    let gameStarted = false;

    const assets = new AssetManager();
    assets.loadImage('front', 'assets/images/pangnafasdam.jpeg');
    assets.loadImage('up1', 'assets/images/pangghadamposht1.jpeg');
    assets.loadImage('up2', 'assets/images/pangghadamposht2.jpeg');
    assets.loadImage('up3', 'assets/images/pangghadamposht3.jpeg');

    const world = new World();
    const camera = new Camera(world);
    const player = new Player(world, assets);
    const joystick = new Joystick(canvas);
    const minimap = new Minimap(world);

    function resizeEverything() {
        const dpr = window.devicePixelRatio || 1;
        canvas.width = window.innerWidth * dpr;
        canvas.height = window.innerHeight * dpr;
        canvas.style.width = window.innerWidth + 'px';
        canvas.style.height = window.innerHeight + 'px';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        
        world.updatePageSize();
        camera.updateViewSize();
        // بازیکن رو ریست نمی‌کنیم - فقط دوربین و دنیا آپدیت میشن
        joystick.updatePosition();
        minimap.updatePosition();
    }

    window.addEventListener('resize', resizeEverything);

    window.setControlMode = (mode) => {
        currentControlMode = mode;
        player.setControlMode(mode);
        mouseIsDown = false;
        activeTouchId = null;
        joystick.end();
    };

    window.setJoystickSize = (size) => joystick.setSize(size);

    window.startDraggingPosition = () => {
        isDraggingPositionMode = true;
        isDraggingJoystick = false;
        activeTouchId = null;
        canvas.style.cursor = 'grab';
    };

    window.confirmPosition = () => {
        isDraggingPositionMode = false;
        isDraggingJoystick = false;
        activeTouchId = null;
        joystick.endDragging();
        canvas.style.cursor = '';
    };

    window.getJoystickPosition = () => joystick.getPosition();

    function getCanvasCoords(e) {
        const rect = canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return { x: clientX - rect.left, y: clientY - rect.top };
    }

    function getTouchCoords(e, touchId) {
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
        const { x, y } = getCanvasCoords(e);
        
        if (isDraggingPositionMode) {
            isDraggingJoystick = joystick.startDragging(x, y);
            if (isDraggingJoystick) canvas.style.cursor = 'grabbing';
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
        const { x, y } = getCanvasCoords(e);
        
        if (isDraggingPositionMode) {
            if (isDraggingJoystick) {
                joystick.moveDragging(x, y);
            } else {
                const dist = Math.hypot(x - joystick.centerX, y - joystick.centerY);
                canvas.style.cursor = dist <= joystick.radius + 20 ? 'grab' : 'default';
            }
            return;
        }

        if (!mouseIsDown) return;
        
        if (currentControlMode === 'joystick') {
            joystick.moveJoystick(x, y);
        }
    });

    window.addEventListener('mouseup', () => {
        if (isDraggingPositionMode) {
            if (isDraggingJoystick) {
                isDraggingJoystick = false;
                canvas.style.cursor = 'grab';
            }
            return;
        }
        mouseIsDown = false;
        joystick.end();
    });

    // Touch events with multi-touch support
    window.addEventListener('touchstart', (e) => {
        e.preventDefault();
        
        if (activeTouchId !== null) return; // already tracking a touch
        
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
        e.preventDefault();
        
        // Check if our tracked touch ended
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
        joystick.end();
    }, { passive: false });

    function update(dt) {
        if (isDraggingPositionMode) {
            // فقط حرکت بازیکن متوقف بشه، نه کل آپدیت
            // انیمیشن‌ها و NPCها اینجا آپدیت میشن
            player.stopWalking();
        } else {
            if (currentControlMode === 'joystick') {
                const movement = joystick.getMovement();
                if (movement) {
                    player.moveWithJoystick(movement.angle, movement.intensity, dt);
                }
                // stopWalking فقط وقتی لازمه صدا زده بشه
                // نه هر فریم
            }
        }
        
        player.update(dt);
        camera.follow(player.x, player.y, player.size);
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        world.draw(ctx, camera);
        player.draw(ctx, camera);
        
        if (currentControlMode === 'joystick' || isDraggingPositionMode) {
            joystick.draw(ctx, isDraggingPositionMode);
        }
        
        minimap.draw(ctx, player, camera);
    }

    function gameLoop(timestamp) {
        if (lastTime === 0) lastTime = timestamp;
        deltaTime = (timestamp - lastTime) / 1000;
        lastTime = timestamp;
        if (deltaTime > 0.1) deltaTime = 0.016; // محدودیت سخت‌تر
        
        update(deltaTime);
        draw();
        requestAnimationFrame(gameLoop);
    }

    // شروع بازی فقط بعد از لود همه عکس‌ها
    function startGame() {
        resizeEverything();
        gameStarted = true;
        lastTime = performance.now();
        requestAnimationFrame(gameLoop);
    }

    assets.onAllLoaded = () => {
        startGame();
    };

    // اگه عکس‌ها زودتر لود شدن (مثلاً از کش)
    if (assets.areAllLoaded()) {
        startGame();
    }
});
