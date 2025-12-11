
import { TerminalHack } from '../minigames/TerminalHack.js';

export class MinigameWindow {
    constructor(w, h) {
        this.w = 400;
        this.h = 250;
        this.x = (w - this.w) / 2;
        this.y = (h - this.h) / 2;

        this.active = true;
        this.title = "SYSTEM_OVERRIDE.exe [WARNING]";

        this.hack = new TerminalHack();

        // Shake effect for window
        this.shake = 0;
    }

    update(dt) {
        if (!this.active) return;
        this.hack.update(dt);

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

        // Content Area
        this.hack.draw(ctx, tx + 10, this.y + 30, this.w - 20, this.h - 40);
    }

    checkClick(mx, my) {
        if (!this.active) return false;

        // Consume all clicks inside window to prevent clicking through
        if (mx >= this.x && mx <= this.x + this.w && my >= this.y && my <= this.y + this.h) {
            return true;
        }

        return false;
    }

    handleKeyDown(e) {
        if (!this.active) return;

        // Pass only printable characters
        if (e.key.length === 1) {
            this.hack.onKeyDown(e.key);
        }
    }
}
