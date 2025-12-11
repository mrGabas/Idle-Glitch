import { Window } from './Window.js';

export class MinigameWindow extends Window {
    constructor(gameW, gameH, minigame) {
        const w = 400;
        const h = 250;
        const x = (gameW - w) / 2;
        const y = (gameH - h) / 2;
        const title = minigame.title || "MINIGAME.exe";

        super(x, y, w, h, title);

        this.minigame = minigame;
        // input handled by update logic passing global input because minigames often need keyboard/etc.
        // But for click input, checkClick delegates.

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
        const bx = tx + this.w - 18;
        const by = this.y + 4;
        ctx.fillStyle = '#000';
        ctx.fillRect(bx, by, 14, 14);
        ctx.strokeStyle = '#0f0';
        ctx.lineWidth = 1;
        ctx.strokeRect(bx, by, 14, 14);

        ctx.strokeStyle = '#0f0';
        ctx.beginPath();
        ctx.moveTo(bx + 3, by + 3);
        ctx.lineTo(bx + 11, by + 11);
        ctx.moveTo(bx + 11, by + 3);
        ctx.lineTo(bx + 3, by + 11);
        ctx.stroke();

        // Content Area
        this.minigame.draw(ctx, tx + 10, this.y + 30, this.w - 20, this.h - 40);
    }

    checkClick(mx, my) {
        const baseRes = super.checkClick(mx, my);
        if (baseRes) return baseRes;

        // Pass click to minigame if needed? 
        // Currently minigames handle their own logic via update(input), 
        // but if they need specific click events relative to window:
        /*
        if (this.minigame.onClick) {
            this.minigame.onClick(mx - this.x, my - this.y);
        }
        */
        return null; // Not consumed if not in body, but body is consumed by super.
    }
}

