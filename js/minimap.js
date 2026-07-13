class Minimap {
    constructor(world) {
        this.world = world;
        this.size = 130;
        this.margin = 12;
        this.x = window.innerWidth - this.size - this.margin;
        this.y = this.margin;
        this.scaleX = this.size / (world.width || 1);
        this.scaleY = this.size / (world.height || 1);
    }

    updatePosition() {
        this.x = window.innerWidth - this.size - this.margin;
        this.y = this.margin;
        this.scaleX = this.size / (this.world.width || 1);
        this.scaleY = this.size / (this.world.height || 1);
    }

    draw(ctx, player, camera) {
        if (!ctx || !player || !camera || !this.world) return;
        
        const mapHeight = this.size * (this.world.height / this.world.width);
        
        // پس‌زمینه
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1.5;
        ctx.fillRect(this.x, this.y, this.size, mapHeight);
        ctx.strokeRect(this.x, this.y, this.size, mapHeight);

        // خطوط شبکه
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

        // محدوده دوربین
        const camX = this.x + camera.x * this.scaleX;
        const camY = this.y + camera.y * this.scaleY;
        const camW = camera.viewWidth * this.scaleX;
        const camH = camera.viewHeight * this.scaleY;
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 1;
        ctx.fillRect(camX, camY, camW, camH);
        ctx.strokeRect(camX, camY, camW, camH);

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
