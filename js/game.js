const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let currentControlMode = 'joystick';
let isDraggingPositionMode = false;

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

// توابع عمومی
window.setControlMode = (mode) => {
    currentControlMode = mode;
    player.setControlMode(mode);
    mouseIsDown = false;
};

window.setJoystickSize = (size) => {
    joystick.setSize(size);
};

window.startDraggingPosition = () => {
    isDraggingPositionMode = true;
    canvas.style.cursor = 'grab';
};

window.confirmPosition = () => {
    isDraggingPositionMode = false;
    joystick.endDragging();
    canvas.style.cursor = '';
};

window.getJoystickPosition = () => {
    return joystick.getPosition();
};

let mouseIsDown = false;
let isDraggingJoystick = false;

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
    const { x, y } = getCanvasCoords(e);
    
    // اولویت با حالت درگ موقعیت
    if (isDraggingPositionMode) {
        if (joystick.startDragging(x, y)) {
            isDraggingJoystick = true;
            canvas.style.cursor = 'grabbing';
        }
        return;
    }

    mouseIsDown = true;
    
    if (currentControlMode === 'joystick') {
        joystick.startJoystick(x, y);
    } else {
        joystick.startClick(x, y);
        player.setTarget(x, y);
    }
});

canvas.addEventListener('mousemove', (e) => {
    const { x, y } = getCanvasCoords(e);
    
    // حالت درگ موقعیت
    if (isDraggingPositionMode && isDraggingJoystick) {
        joystick.moveDragging(x, y);
        return;
    }
    
    // تغییر کرسر در حالت درگ موقعیت
    if (isDraggingPositionMode && !isDraggingJoystick) {
        const dist = Math.hypot(x - joystick.centerX, y - joystick.centerY);
        canvas.style.cursor = dist <= joystick.radius + 20 ? 'grab' : 'default';
        return;
    }

    if (!mouseIsDown) return;
    
    if (currentControlMode === 'joystick') {
        joystick.moveJoystick(x, y);
    } else {
        joystick.moveClick(x, y);
        player.setTarget(x, y);
    }
});

window.addEventListener('mouseup', () => {
    // پایان درگ موقعیت
    if (isDraggingPositionMode && isDraggingJoystick) {
        isDraggingJoystick = false;
        canvas.style.cursor = 'grab';
        return;
    }

    mouseIsDown = false;
    
    if (currentControlMode === 'joystick') {
        joystick.end();
    }
});

// لمس
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const { x, y } = getCanvasCoords(e);
    
    // اولویت با حالت درگ موقعیت
    if (isDraggingPositionMode) {
        if (joystick.startDragging(x, y)) {
            isDraggingJoystick = true;
        }
        return;
    }

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
    
    // حالت درگ موقعیت
    if (isDraggingPositionMode && isDraggingJoystick) {
        joystick.moveDragging(x, y);
        return;
    }

    if (currentControlMode === 'joystick') {
        joystick.moveJoystick(x, y);
    } else {
        joystick.moveClick(x, y);
        player.setTarget(x, y);
    }
}, { passive: false });

canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    
    // پایان درگ موقعیت
    if (isDraggingPositionMode && isDraggingJoystick) {
        isDraggingJoystick = false;
        return;
    }

    if (currentControlMode === 'joystick') {
        joystick.end();
    }
});

canvas.addEventListener('touchcancel', (e) => {
    e.preventDefault();
    
    if (isDraggingPositionMode) {
        isDraggingJoystick = false;
        return;
    }

    if (currentControlMode === 'joystick') {
        joystick.end();
    }
});

function update() {
    if (isDraggingPositionMode) return; // تو حالت درگ، بازیکن حرکت نکنه

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
    
    if (isDraggingPositionMode) {
        // تو حالت درگ، فقط جوی‌استیک رو با استایل خاص نشون بده
        joystick.draw(ctx, 'joystick', true);
        // بازیکن رو هم نشون بده ولی حرکت نکنه
        player.draw(ctx);
    } else {
        player.draw(ctx);
        joystick.draw(ctx, currentControlMode);
    }
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

resizeCanvas();
gameLoop();
