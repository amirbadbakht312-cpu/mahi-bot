const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let currentControlMode = 'joystick';
let settingPositionMode = false;

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

window.startSettingPosition = () => {
    settingPositionMode = true;
    canvas.style.cursor = 'crosshair';
};

window.cancelSettingPosition = () => {
    settingPositionMode = false;
    canvas.style.cursor = '';
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
    // اگر در حالت تنظیم موقعیت هستیم
    if (settingPositionMode) {
        const { x, y } = getCanvasCoords(e);
        joystick.setPosition(x, y);
        window.updatePositionDisplay(x, y);
        settingPositionMode = false;
        canvas.style.cursor = '';
        return;
    }

    mouseIsDown = true;
    const { x, y } = getCanvasCoords(e);
    
    if (currentControlMode === 'joystick') {
        joystick.startJoystick(x, y);
    } else {
        // حالت کلیک: فقط هدف رو تنظیم کن (بدون نیاز به نگه داشتن)
        joystick.startClick(x, y);
        player.setTarget(x, y);
    }
});

canvas.addEventListener('mousemove', (e) => {
    if (settingPositionMode) return;
    if (!mouseIsDown) return;
    const { x, y } = getCanvasCoords(e);
    
    if (currentControlMode === 'joystick') {
        joystick.moveJoystick(x, y);
    } else {
        // تو حالت کلیک، موقع حرکت ماوس هدف رو بروز کن
        joystick.moveClick(x, y);
        player.setTarget(x, y);
    }
});

window.addEventListener('mouseup', () => {
    if (settingPositionMode) return;
    mouseIsDown = false;
    
    if (currentControlMode === 'joystick') {
        joystick.end();
    }
    // تو حالت کلیک، با رها کردن ماوس هم هدف پاک نمیشه
    // بازیکن به حرکت ادامه میده تا به هدف برسه
});

// لمس
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    
    // اگر در حالت تنظیم موقعیت هستیم
    if (settingPositionMode) {
        const { x, y } = getCanvasCoords(e);
        joystick.setPosition(x, y);
        window.updatePositionDisplay(x, y);
        settingPositionMode = false;
        canvas.style.cursor = '';
        return;
    }

    const { x, y } = getCanvasCoords(e);
    
    if (currentControlMode === 'joystick') {
        joystick.startJoystick(x, y);
    } else {
        // حالت کلیک: فقط هدف رو تنظیم کن
        joystick.startClick(x, y);
        player.setTarget(x, y);
    }
}, { passive: false });

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (settingPositionMode) return;
    
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
    if (settingPositionMode) return;
    
    if (currentControlMode === 'joystick') {
        joystick.end();
    }
    // تو حالت کلیک، هدف حفظ میشه
});

canvas.addEventListener('touchcancel', (e) => {
    e.preventDefault();
    if (settingPositionMode) return;
    
    if (currentControlMode === 'joystick') {
        joystick.end();
    }
});

function update() {
    if (currentControlMode === 'joystick') {
        const movement = joystick.getMovement();
        if (movement) {
            player.moveWithJoystick(movement.angle, movement.intensity);
        }
    } else {
        // تو حالت کلیک، همیشه آپدیت میشه (حتی بدون نگه داشتن ماوس)
        player.update();
    }
}

function draw() {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    player.draw(ctx);
    
    // تو حالت تنظیم موقعیت، جوی‌استیک رو هم نشون بده
    if (settingPositionMode || currentControlMode === 'joystick') {
        joystick.draw(ctx, 'joystick');
    } else if (currentControlMode === 'click' && mouseIsDown) {
        joystick.draw(ctx, 'click');
    }
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

resizeCanvas();
gameLoop();
