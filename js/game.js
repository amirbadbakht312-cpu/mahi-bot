const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let currentControlMode = 'joystick';
let isDraggingPositionMode = false;
let isDraggingJoystick = false;
let mouseIsDown = false;

let lastTime = 0;
let deltaTime = 0;

// Asset manager با نام‌های درست
const assets = new AssetManager();
assets.loadImage('front', 'assets/images/pangnafasdam.jpeg');     // pangnafasdam = نمای جلو
assets.loadImage('up1', 'assets/images/pangghadamposht1.jpeg');   // posht1
assets.loadImage('up2', 'assets/images/pangghadamposht2.jpeg');   // posht2
assets.loadImage('up3', 'assets/images/pangghadamposht3.jpeg');   // posht3

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
    player.updatePositionOnResize();
    joystick.updatePosition();
    minimap.updatePosition();
}

window.addEventListener('resize', resizeEverything);

window.setControlMode = (mode) => {
    currentControlMode = mode;
    player.setControlMode(mode);
    mouseIsDown = false;
    joystick.end();
};

window.setJoystickSize = (size) => joystick.setSize(size);

window.startDraggingPosition = () => {
    isDraggingPositionMode = true;
    isDraggingJoystick = false;
    canvas.style.cursor = 'grab';
};

window.confirmPosition = () => {
    isDraggingPositionMode = false;
    isDraggingJoystick = false;
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

canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const { x, y } = getCanvasCoords(e);
    
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

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const { x, y } = getCanvasCoords(e);
    
    if (isDraggingPositionMode && isDraggingJoystick) {
        joystick.moveDragging(x, y);
        return;
    }

    if (currentControlMode === 'joystick') {
        joystick.moveJoystick(x, y);
    }
}, { passive: false });

canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    if (isDraggingPositionMode) {
        if (isDraggingJoystick) isDraggingJoystick = false;
        return;
    }
    joystick.end();
});

canvas.addEventListener('touchcancel', (e) => {
    e.preventDefault();
    if (isDraggingPositionMode) {
        isDraggingJoystick = false;
        return;
    }
    joystick.end();
});

function update(dt) {
    if (isDraggingPositionMode) return;

    if (currentControlMode === 'joystick') {
        const movement = joystick.getMovement();
        if (movement) {
            player.moveWithJoystick(movement.angle, movement.intensity, dt);
        } else {
            player.stopWalking();
        }
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

function gameLoop(timestamp) {
    if (lastTime === 0) lastTime = timestamp;
    deltaTime = (timestamp - lastTime) / 1000;
    lastTime = timestamp;
    if (deltaTime > 0.1) deltaTime = 0.1;
    
    update(deltaTime);
    draw();
    requestAnimationFrame(gameLoop);
}

resizeEverything();
requestAnimationFrame(gameLoop);
