/**
 * PARTICLE SYSTEMS
 * @module entities/particles
 */
import { UTILS } from '../core/config.js';

export class Particle {
    constructor(x, y, color, size = 2) {
        this.x = x; this.y = y;
        this.color = color;
        this.vx = (Math.random() - 0.5) * 5;
        this.vy = (Math.random() - 0.5) * 5;
        this.life = 1.0;
        this.size = size;
    }
    update(dt, game) {
        this.x += this.vx * (dt * 60); // approximate based on 60fps expectation
        this.y += this.vy * (dt * 60);
        this.life -= dt;
    }
    draw(ctx) {
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.size, this.size);
        ctx.globalAlpha = 1;
    }
}

// UI Debris with physics
export class Debris extends Particle {
    constructor(x, y, color) {
        super(x, y, color, Math.random() * 4 + 2); // Larger
        this.vx = (Math.random() - 0.5) * 10;
        this.vy = (Math.random() - 2) * 5; // Explode up
        this.gravity = 0.5;
        this.grounded = false;
        this.life = 20.0; // Long life
        this.collected = false;
    }

    update(dt, context) {
        if (this.collected) return;
        const h = context.h;
        const mx = context.mouse.x;
        const my = context.mouse.y;

        // Physics
        this.vy += this.gravity;
        this.x += this.vx;
        this.y += this.vy;

        // Floor (Collision)
        if (this.y > h - 10) {
            this.y = h - 10;
            this.vy *= -0.5; // Bounce
            this.vx *= 0.9;  // Friction
            if (Math.abs(this.vy) < 1) this.grounded = true;
        }

        // Walls
        if (this.x < 0 || this.x > window.innerWidth) this.vx *= -1;

        // Magnet cursor (Garbage collection)
        if (this.grounded) {
            const dx = mx - this.x;
            const dy = my - this.y;
            const dist = Math.hypot(dx, dy);

            if (dist < 50) {
                // Attract to mouse
                this.x += dx * 0.2;
                this.y += dy * 0.2;
                if (dist < 10) {
                    this.life = 0; // Collected
                    this.collected = true;
                    // Handle collection side-effect directly
                    context.state.addScore(10 * context.state.multiplier);
                    context.events.emit('play_sound', 'collect');
                    return 'collected';
                }
            }
        }

        this.life -= 0.005; // Fade very slowly
    }
}

export class FloatingText extends Particle {
    constructor(x, y, text, color) {
        super(x, y, color);
        this.text = text;
        this.vx = 0;
        this.vy = -2; // Moves up
        this.life = 1.0;
        // Text specific
        this.font = "bold 16px Arial";
    }

    update(dt) {
        // Gentle float upwards (independent of Particle physics)
        this.y -= 30 * dt;
        this.life -= dt;
    }

    draw(ctx) {
        ctx.globalAlpha = this.life;
        ctx.font = this.font;
        ctx.fillStyle = this.color;
        ctx.fillText(this.text, this.x, this.y);
        ctx.globalAlpha = 1;
    }
}
