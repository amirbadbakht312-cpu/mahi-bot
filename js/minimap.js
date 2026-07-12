class Minimap {
    constructor(world) {
        this.world = world;
        this.size = 130;
        this.margin = 12;
        this.x = window.innerWidth - this.size - this.margin;
        this.y = this.margin;
        this.scaleX = this.size / world.width;
        this.scaleY = this.size / world.height;
    }

    updatePosition() {
        this.x = window.innerWidth - this.size - this.margin;
        this.y = this.margin;
        this.scaleX = this.size / this.world.width;
        this.scaleY = this.size / this.world.height;
    }

    draw(ctx, player, camera) {
        // پس‌زمینه مینی‌مپ
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(this.x, this.y, this.size, this.size * (this.world.height / this.world.width), 8);
        ctx.fill();
        ctx.stroke();

        const mapHeight = this.size * (this.world.height / this.world.width);
        
        // خطوط شبکه صفحات
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 0.5;
        
        for (let col = 1; col < this.world.cols; col++) {
            const x = this.x + col * this.world.pageWidth * this.scaleX;
            ctx.beginPath();
            ctx.moveTo(x, this.y);
            ctx.lineTo(x, this.y + mapHeight);
            ctx.stroke();
        }
        
        for (let row = 1; row < this.world.rows; row++) {
            const y = this.y + row * this.world.pageHeight * this.scaleY;
            ctx.beginPath();
            ctx.moveTo(this.x, y);
            ctx.lineTo(this.x + this.size, y);
            ctx.stroke();
        }

        // محدوده دید دوربین
        const camX = this.x + camera.x * this.scaleX;
        const camY = this.y + camera.y * this.scaleY;
        const camW = camera.viewWidth * this.scaleX;
        const camH = camera.viewHeight * this.scaleY;
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.rect(camX, camY, camW, camH);
        ctx.fill();
        ctx.stroke();

        // موقعیت بازیکن
        const playerX = this.x + player.x * this.scaleX;
        const playerY = this.y + player.y * this.scaleY;
        const playerSize = Math.max(3, player.size * this.scaleX);
        
        ctx.fillStyle = '#00d2ff';
        ctx.beginPath();
        ctx.arc(playerX + playerSize / 2, playerY + playerSize / 2, playerSize / 2 + 1, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Polyfill roundRect
if (!CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
        if (typeof r === 'number') r = { tl: r, tr: r, br: r, bl: r };
        this.beginPath();
        this.moveTo(x + r.tl, y);
        this.lineTo(x + w - r.tr, y);
        this.quadraticCurveTo(x + w, y, x + w, y + r.tr);
        this.lineTo(x + w, y + h - r.br);
        this.quadraticCurveTo(x + w, y + h, x + w - r.br, y + h);
        this.lineTo(x + r.bl, y + h);
        this.quadraticCurveTo(x, y + h, x, y + h - r.bl);
        this.lineTo(x, y + r.tl);
        this.quadraticCurveTo(x, y, x + r.tl, y);
        this.closePath();
        return this;
    };
}
