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

    /**
     * @param {CanvasRenderingContext2D} ctx 
     */
    drawContent(ctx, x, y, w, h) {
        // Main Content BG
        ctx.fillStyle = '#000'; // Black for Terminal feel
        ctx.fillRect(x, y, w, h);

        // Content Area
        this.minigame.draw(ctx, x + 2, y + 2, w - 4, h - 4);
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

