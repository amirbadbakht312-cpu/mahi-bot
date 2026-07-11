const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const W = 660, H = 450;

let penguinImg = new Image();
let fishImg = new Image();
let bobberImg = new Image();

penguinImg.src = 'assets/images/Penguin kamel.png';
fishImg.src = 'assets/images/mahi.png';
bobberImg.src = 'assets/images/choob.png';

function draw() {
    ctx.clearRect(0, 0, W, H);
    
    // پس‌زمینه
    ctx.fillStyle = '#1a3a5c';
    ctx.fillRect(0, 0, W, H);
    
    // کشیدن پنگوئن
    if (penguinImg.complete && penguinImg.naturalWidth > 0) {
        ctx.drawImage(penguinImg, 100, 180, 64, 64);
        ctx.fillStyle = '#4fc3f7';
        ctx.font = '18px sans-serif';
        ctx.fillText('✅ پنگوئن', 110, 280);
    } else {
        ctx.fillStyle = '#e74c3c';
        ctx.font = '18px sans-serif';
        ctx.fillText('❌ پنگوئن', 110, 280);
    }
    
    // کشیدن ماهی
    if (fishImg.complete && fishImg.naturalWidth > 0) {
        ctx.drawImage(fishImg, 250, 190, 48, 32);
        ctx.fillStyle = '#4fc3f7';
        ctx.font = '18px sans-serif';
        ctx.fillText('✅ ماهی', 260, 280);
    } else {
        ctx.fillStyle = '#e74c3c';
        ctx.font = '18px sans-serif';
        ctx.fillText('❌ ماهی', 260, 280);
    }
    
    // کشیدن چوب ماهی‌گیری
    if (bobberImg.complete && bobberImg.naturalWidth > 0) {
        ctx.drawImage(bobberImg, 420, 190, 48, 48);
        ctx.fillStyle = '#4fc3f7';
        ctx.font = '18px sans-serif';
        ctx.fillText('✅ چوب', 430, 280);
    } else {
        ctx.fillStyle = '#e74c3c';
        ctx.font = '18px sans-serif';
        ctx.fillText('❌ چوب', 430, 280);
    }
}

penguinImg.onload = draw;
fishImg.onload = draw;
bobberImg.onload = draw;
draw();
