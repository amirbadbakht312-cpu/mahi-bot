window.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    let currentControlMode = 'joystick';
    let isDraggingPositionMode = false;
    let isDraggingJoystick = false;
    let mouseIsDown = false;
    let activeTouchId = null;
    let lastTime = 0;

    const world = new World();
    const camera = new Camera(world);
    const player = new Player(world);
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
        joystick.updatePosition();
        minimap.updatePosition();
        player.clamp();
    }

    window.addEventListener('resize', resizeEverything);

    window.setControlMode = (mode) => {
        currentControlMode = mode;
        player.setControlMode(mode);
        joystick.end();
    };

    window.setJoystickSize = (size) => joystick.setSize(size);
    window.setJoystickPosition = (x, y) => joystick.setPosition(x, y);

    window.startDraggingPosition = () => {
        isDraggingPositionMode = true;
        isDraggingJoystick = false;
    };

    window.confirmPosition = () => {
        isDraggingPositionMode = false;
        isDraggingJoystick = false;
        joystick.endDragging();
    };

    window.getJoystickPosition = () => joystick.getPosition();

    function getCoords(e) {
        const rect = canvas.getBoundingClientRect();
        const cx = e.touches ? e.touches[0].clientX : e.clientX;
        const cy = e.touches ? e.touches[0].clientY : e.clientY;
        return { x: cx - rect.left, y: cy - rect.top };
    }

    canvas.addEventListener('mousedown', (e) => {
        const { x, y } = getCoords(e);
        if (isDraggingPositionMode) {
            isDraggingJoystick = joystick.startDragging(x, y);
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
        const { x, y } = getCoords(e);
        if (isDraggingPositionMode && isDraggingJoystick) {
            joystick.moveDragging(x, y);
            return;
        }
        if (!mouseIsDown) return;
        if (currentControlMode === 'joystick') {
            joystick.moveJoystick(x, y);
        }
    });

    window.addEventListener('mouseup', () => {
        if (isDraggingPositionMode) {
            isDraggingJoystick = false;
            return;
        }
        mouseIsDown = false;
        joystick.end();
    });

    window.addEventListener('touchstart', (e) => {
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
        e.preventDefault();
        if (activeTouchId === null) return;
        const rect = canvas.getBoundingClientRect();
        for (let i = 0; i < e.touches.length; i++) {
            if (e.touches[i].identifier === activeTouchId) {
                const x = e.touches[i].clientX - rect.left;
                const y = e.touches[i].clientY - rect.top;
                if (isDraggingPositionMode && isDraggingJoystick) {
                    joystick.moveDragging(x, y);
                } else if (currentControlMode === 'joystick') {
                    joystick.moveJoystick(x, y);
                }
                break;
            }
        }
    }, { passive: false });

    window.addEventListener('touchend', (e) => {
        e.preventDefault();
        let found = false;
        for (let i = 0; i < e.touches.length; i++) {
            if (e.touches[i].identifier === activeTouchId) { found = true; break; }
        }
        if (!found) {
            activeTouchId = null;
            if (isDraggingPositionMode) { isDraggingJoystick = false; return; }
            joystick.end();
        }
    });

    function update(dt) {
        if (isDraggingPositionMode) {
            player.stopWalking();
        } else if (currentControlMode === 'joystick') {
            const m = joystick.getMovement();
            if (m) player.moveWithJoystick(m.angle, m.intensity, dt);
        }
        player.update(dt);
        camera.follow(player.x, player.y, player.size);
    }

    function draw() {
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        world.draw(ctx, camera);
        player.draw(ctx, camera);
        if (currentControlMode === 'joystick' || isDraggingPositionMode) {
            joystick.draw(ctx, isDraggingPositionMode);
        }
        minimap.draw(ctx, player, camera);
    }

    function gameLoop(ts) {
        if (lastTime === 0) lastTime = ts;
        const dt = Math.min((ts - lastTime) / 1000, 0.1);
        lastTime = ts;
        update(dt);
        draw();
        requestAnimationFrame(gameLoop);
    }

    resizeEverything();
    requestAnimationFrame(gameLoop);
});
