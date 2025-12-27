import { ACHIEVEMENTS } from '../data/achievements.js';

export class AchievementsWindow {
    constructor(game) {
        this.game = game;
        this.visible = false;

        // Dimensions
        this.w = 500;
        this.h = 600;
        this.x = (game.w - this.w) / 2;
        this.y = (game.h - this.h) / 2;

        this.scrollTop = 0;
        this.maxScroll = 0;
        this.contentHeight = 0;
    }

    toggle() {
        this.visible = !this.visible;
        this.game.events.emit('play_sound', 'click');
        this.resize();
        this.scrollTop = 0;
    }

    resize() {
        this.x = (this.game.w - this.w) / 2;
        this.y = (this.game.h - this.h) / 2;
        this.updateScrollBounds();
    }

    updateScrollBounds() {
        this.contentHeight = ACHIEVEMENTS.length * 80; // 70px card + 10px gap
        const visibleH = this.h - 80;
        this.maxScroll = Math.max(0, this.contentHeight - visibleH);
    }

    handleScroll(delta) {
        if (!this.visible) return;
        this.scrollTop += delta;
        if (this.scrollTop < 0) this.scrollTop = 0;
        if (this.scrollTop > this.maxScroll) this.scrollTop = this.maxScroll;
    }

    checkClick(mx, my) {
        if (!this.visible) return false;

        // Close button
        if (mx > this.x + this.w - 40 && mx < this.x + this.w &&
            my > this.y && my < this.y + 40) {
            // this.toggle();
            return 'close';
        }

        // Click outside
        if (mx < this.x || mx > this.x + this.w || my < this.y || my > this.y + this.h) {
            // this.toggle();
            return 'close';
        }

        return 'consumed'; // Consume click
    }

    draw(ctx) {
        if (!this.visible) return;

        // Overlay
        ctx.fillStyle = 'rgba(0,0,0,0.85)';
        ctx.fillRect(0, 0, this.game.w, this.game.h);

        ctx.save();

        // Window
        ctx.shadowColor = '#FFD700'; // Gold glow
        ctx.shadowBlur = 15;
        ctx.fillStyle = '#111';
        ctx.fillRect(this.x, this.y, this.w, this.h);
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.w, this.h);
        ctx.shadowBlur = 0;

        // Header
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(this.x, this.y, this.w, 60);

        ctx.fillStyle = '#000';
        ctx.font = "bold 24px Courier New";
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText("ACHIEVEMENTS", this.x + this.w / 2, this.y + 30);

        // Close Btn
        ctx.fillStyle = '#ff4444';
        ctx.fillRect(this.x + this.w - 40, this.y + 10, 30, 40);
        ctx.fillStyle = '#fff';
        ctx.fillText("X", this.x + this.w - 25, this.y + 30);

        // Content
        ctx.beginPath();
        ctx.rect(this.x, this.y + 60, this.w, this.h - 60);
        ctx.clip();

        let ry = this.y + 80 - this.scrollTop;
        const unlockedIds = this.game.achievementSystem.unlocked;

        ACHIEVEMENTS.forEach(ach => {
            // Optimization
            if (ry > this.y + this.h || ry + 70 < this.y + 60) {
                ry += 80;
                return;
            }

            const isUnlocked = unlockedIds.includes(ach.id);

            // Card BG
            ctx.fillStyle = isUnlocked ? '#222' : '#111';
            ctx.fillRect(this.x + 20, ry, this.w - 40, 70);

            ctx.strokeStyle = isUnlocked ? '#FFD700' : '#444';
            ctx.lineWidth = 1;
            ctx.strokeRect(this.x + 20, ry, this.w - 40, 70);

            // Icon Placeholder
            ctx.fillStyle = isUnlocked ? '#FFD700' : '#333';
            ctx.fillRect(this.x + 30, ry + 10, 50, 50);
            ctx.fillStyle = '#000';
            ctx.font = "20px Arial";
            ctx.textAlign = 'center';
            ctx.fillText(isUnlocked ? "★" : "?", this.x + 55, ry + 42);

            // Text
            ctx.textAlign = 'left';
            ctx.fillStyle = isUnlocked ? '#FFD700' : '#666';
            ctx.font = "bold 16px Courier New";
            ctx.fillText(ach.name, this.x + 90, ry + 30);

            ctx.fillStyle = isUnlocked ? '#ccc' : '#444';
            ctx.font = "12px Arial";
            ctx.fillText(isUnlocked ? ach.desc : "Locked", this.x + 90, ry + 50);

            ry += 80;
        });

        // Scrollbar logic reuse...
        if (this.maxScroll > 0) {
            const barHeight = ((this.h - 80) / this.contentHeight) * (this.h - 80);
            const barY = this.y + 60 + (this.scrollTop / this.contentHeight) * (this.h - 80);
            ctx.fillStyle = '#FFD700';
            ctx.fillRect(this.x + this.w - 10, barY, 5, Math.max(20, barHeight));
        }

        ctx.restore();
    }
}
