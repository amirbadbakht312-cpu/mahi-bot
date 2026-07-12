// تنظیم Canvas با پشتیبانی از Retina
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    
    // ابعاد فیزیکی Canvas
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    
    // ابعاد نمایشی CSS
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    
    // اعمال مقیاس برای رسم
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    
    // بروزرسانی موقعیت بازیکن و جوی‌استیک
    player.updatePositionOnResize();
    joystick.updatePosition();
}

// ساخت اشیاء بازی
const player = new Player({ width: window.innerWidth, height: window.innerHeight });
const joystick = new Joystick({ width: window.innerWidth, height: window.innerHeight });

// مدیریت رویداد تغییر اندازه صفحه
window.addEventListener('resize', resizeCanvas);

// ----- کنترل‌های یکپارچه ماوس و لمسی -----
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
    joystick.start(x, y);
});

canvas.addEventListener('mousemove', (e) => {
    if (!mouseIsDown) return;
    const { x, y } = getCanvasCoords(e);
    joystick.move(x, y);
});

window.addEventListener('mouseup', () => {
    mouseIsDown = false;
    joystick.end();
});

// لمس
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const { x, y } = getCanvasCoords(e);
    joystick.start(x, y);
}, { passive: false });

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const { x, y } = getCanvasCoords(e);
    joystick.move(x, y);
}, { passive: false });

canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    joystick.end();
});

canvas.addEventListener('touchcancel', (e) => {
    e.preventDefault();
    joystick.end();
});

// ----- حلقه اصلی بازی -----
function update() {
    const movement = joystick.getMovement();
    if (movement) {
        player.move(movement.angle, movement.intensity);
    }
}

function draw() {
    // پاک کردن صفحه با در نظر گرفتن مقیاس
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    
    // رسم بازیکن و جوی‌استیک
    player.draw(ctx);
    joystick.draw(ctx);
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// راه‌اندازی اولیه
resizeCanvas();
gameLoop();
