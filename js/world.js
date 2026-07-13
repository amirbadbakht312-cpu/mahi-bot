class World {
    constructor() {
        this.cols = 3;
        this.rows = 2;
        this.pageWidth = window.innerWidth;
        this.pageHeight = window.innerHeight;
        this.width = this.cols * this.pageWidth;
        this.height = this.rows * this.pageHeight;
    }

    updatePageSize() {
        this.pageWidth = window.innerWidth;
        this.pageHeight = window.innerHeight;
        this.width = this.cols * this.pageWidth;
        this.height = this.rows * this.pageHeight;
    }

    clampPosition(x, y, size) {
        return {
            x: Math.max(0, Math.min(this.width - size, x)),
            y: Math.max(0, Math.min(this.height - size, y))
        };
    }

    draw(ctx, camera) {
        if (!ctx || !camera) return;
        
        // خطوط عمودی
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.lineWidth = 1;
        
        for (let col = 1; col < this.cols; col++) {
            const x = col * this.pageWidth - camera.x;
            ctx.beginPath();
            ctx.moveTo(x, -camera.y);
            ctx.lineTo(x, this.height - camera.y);
            ctx.stroke();
        }
        
        // خطوط افقی
        for (let row = 1; row < this.rows; row++) {
            const y = row * this.pageHeight - camera.y;
            ctx.beginPath();
            ctx.moveTo(-camera.x, y);
            ctx.lineTo(this.width - camera.x, y);
            ctx.stroke();
        }

        // شماره صفحات
        ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
        ctx.font = '20px Segoe UI';
        ctx.textAlign = 'center';
        
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const centerX = col * this.pageWidth + this.pageWidth / 2 - camera.x;
                const centerY = row * this.pageHeight + this.pageHeight / 2 - camera.y;
                ctx.fillText(`${row * this.cols + col + 1}`, centerX, centerY);
            }
        }
    }
}
