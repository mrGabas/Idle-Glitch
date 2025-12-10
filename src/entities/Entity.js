/**
 * Entity Base Class
 * Standardizes interface for all game objects.
 */
export class Entity {
    constructor(x, y) {
        this.x = x || 0;
        this.y = y || 0;
        this.active = true;
        this.life = 1.0;
        this.z = 0; // Layer index
    }

    update(dt) {
        // Override me
    }

    draw(ctx) {
        // Override me
    }

    kill() {
        this.active = false;
    }
}

/**
 * Example Concrete Entity: GlitchArtifact
 */
import { UTILS } from '../data/config.js';

export class GlitchArtifact extends Entity {
    constructor(x, y, color) {
        super(x, y);
        this.color = color || '#ff00ff';
        this.vx = UTILS.rand(-1, 1);
        this.vy = UTILS.rand(-1, 1);
    }

    update(dt) {
        this.x += this.vx;
        this.y += this.vy;

        if (Math.random() < 0.05) {
            this.x += UTILS.rand(-5, 5); // Glitch jump
        }
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, 10, 10);

        // Glitch trail
        if (Math.random() < 0.2) {
            ctx.globalAlpha = 0.5;
            ctx.fillRect(this.x - 5, this.y, 10, 2);
            ctx.globalAlpha = 1;
        }
    }
}
