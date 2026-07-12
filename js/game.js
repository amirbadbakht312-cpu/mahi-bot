const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let currentControlMode = 'joystick';

function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    
    player.updatePositionOnResize();
    joystick.updatePosition();
}

const player = new Player({ width: window.innerWidth, height: window.innerHeight });
const joystick = new Joystick({ width: window.innerWidth, height: window.innerHeight });

window.addEventListener('resize', resizeCanvas);

// توابع عمومی برای UI
window.setControlMode = (mode) => {
    currentControlMode = mode;
    player.setControlMode(mode);
    mouseIsDown = false;
};

window.setJoystickSize = (size) => {
    joystick.setSize(size);
};

window.setJoystickPosition = (x, y) => {
    joystick.setPosition(x, y);
};

// کنترل‌ها
let mouseIsDown = false;

function getCanvasCoords(e) {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
        x: clientX - rect.left,
        y: clientY - rect.top
    };
}

// ماوس
canvas.addEventListener('mousedown', (e) => {
    mouseIsDown = true;
    const { x, y } = getCanvasCoords(e);
    
    if (currentControlMode === 'joystick') {
        joystick.startJoystick(x, y);
    } else {
        joystick.startClick(x, y);
        player.setTarget(x, y);
    }
});

canvas.addEventListener('mousemove', (e) => {
    if (!mouseIsDown) return;
    const { x, y } = getCanvasCoords(e);
    
    if (currentControlMode === 'joystick') {
        joystick.moveJoystick(x, y);
    } else {
        joystick.moveClick(x, y);
        player.setTarget(x, y);
    }
});

window.addEventListener('mouseup', () => {
    mouseIsDown = false;
    joystick.end();
    if (currentControlMode === 'click') {
        player.stop();
    }
});

// لمس
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const { x, y } = getCanvasCoords(e);
    
    if (currentControlMode === 'joystick') {
        joystick.startJoystick(x, y);
    } else {
        joystick.startClick(x, y);
        player.setTarget(x, y);
    }
}, { passive: false });

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const { x, y } = getCanvasCoords(e);
    
    if (currentControlMode === 'joystick') {
        joystick.moveJoystick(x, y);
    } else {
        joystick.moveClick(x, y);
        player.setTarget(x, y);
    }
}, { passive: false });

canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    joystick.end();
    if (currentControlMode === 'click') {
        player.stop();
    }
});

canvas.addEventListener('touchcancel', (e) => {
    e.preventDefault();
    joystick.end();
    if (currentControlMode === 'click') {
        player.stop();
    }
});

function update() {
    if (currentControlMode === 'joystick') {
        const movement = joystick.getMovement();
        if (movement) {
            player.moveWithJoystick(movement.angle, movement.intensity);
        }
    } else {
        player.update();
    }
}

function draw() {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    player.draw(ctx);
    joystick.draw(ctx, currentControlMode);
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

resizeCanvas();
gameLoop();
