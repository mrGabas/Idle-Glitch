
import { TerminalHack } from '../minigames/TerminalHack.js';
// Leaving import for now, but really MinigameWindow shouldn't depend on it if passed in. 
// Ideally we remove this import to avoid circular dep if any, but it's safe if unused.
// Actually, let's remove it to be clean.

export class MinigameWindow {
    constructor(w, h, minigame) {
        this.w = 400;
        this.h = 250;
        this.x = (w - this.w) / 2;
        this.y = (h - this.h) / 2;

        this.active = true;
        this.minigame = minigame;
        this.title = minigame.title || "MINIGAME.exe";

        // Shake effect for window
        this.shake = 0;
    }

    update(dt, game) {
        if (!this.active) return;
        this.minigame.update(dt, game.input); // Pass input to minigame

        if (this.shake > 0) {
            this.shake *= 0.9;
            if (this.shake < 0.5) this.shake = 0;
        }
    }

    draw(ctx) {
        if (!this.active) return;

        let sx = 0;
        if (this.shake > 0) {
            sx = (Math.random() - 0.5) * this.shake;
        }
        const tx = this.x + sx;

        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(tx + 5, this.y + 5, this.w, this.h);

        // Main Window BG
        ctx.fillStyle = '#000'; // Black for Terminal feel
        ctx.fillRect(tx, this.y, this.w, this.h);

        // Border
        ctx.strokeStyle = '#0f0'; // Hacker Green
        ctx.lineWidth = 2;
        ctx.strokeRect(tx, this.y, this.w, this.h);

        // Title Bar
        ctx.fillStyle = '#0f0';
        ctx.fillRect(tx, this.y, this.w, 24);
        ctx.fillStyle = '#000';
        ctx.font = 'bold 12px "Courier New", monospace';
        ctx.textAlign = 'left';
        ctx.fillText(this.title, tx + 6, this.y + 16);

        // Close Button
        ctx.fillStyle = '#000';
        ctx.fillRect(tx + this.w - 18, this.y + 4, 14, 14);
        ctx.strokeStyle = '#0f0';
        ctx.lineWidth = 1;
        ctx.strokeRect(tx + this.w - 18, this.y + 4, 14, 14);

        ctx.strokeStyle = '#0f0';
        ctx.beginPath();
        ctx.moveTo(tx + this.w - 15, this.y + 7);
        ctx.lineTo(tx + this.w - 7, this.y + 15);
        ctx.moveTo(tx + this.w - 7, this.y + 7);
        ctx.lineTo(tx + this.w - 15, this.y + 15);
        ctx.stroke();

        // Content Area
        this.minigame.draw(ctx, tx + 10, this.y + 30, this.w - 20, this.h - 40);
    }

    checkClick(mx, my) {
        if (!this.active) return false;

        // Check Close Button
        const bx = this.x + this.w - 18;
        const by = this.y + 4;
        if (mx >= bx && mx <= bx + 14 && my >= by && my <= by + 14) {
            this.active = false;
            return 'close';
        }

        // Header Drag
        if (mx >= this.x && mx <= this.x + this.w && my >= this.y && my <= this.y + 24) {
            return 'drag';
        }

        // Consume all clicks inside window to prevent clicking through
        if (mx >= this.x && mx <= this.x + this.w && my >= this.y && my <= this.y + this.h) {
            return true;
        }

        return false;
    }

    // handleKeyDown(e) removed - minigame should poll input in update
}
