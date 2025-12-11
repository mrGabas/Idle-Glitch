/**
 * ENEMIES AND THREATS
 * @module entities/enemies
 */
import { UTILS } from '../core/config.js';

export class GlitchHunter {
    constructor(w, h) {
        // Spawn off-screen
        this.x = Math.random() < 0.5 ? -50 : w + 50;
        this.y = Math.random() * h;
        this.size = 30;
        this.speed = 1.5; // Chase speed
        this.hp = 5;      // Clicks to kill
        this.active = true;
        this.pulse = 0;
    }

    update(dt, context) {
        // Adapt context to existing signature or use context properties
        // The original signature was update(mx, my, dt)
        // Let's assume context IS the Game instance or similar. 
        // In Game.js, I will pass `this` (the game) as context? Or `this.renderer.draw` inputData?
        // Let's pass `this` (Game instance) as context to all entity updates.
        // So context.mouse.x, context.mouse.y.

        // This is tricky without modifying all entity files.
        // BUT, the prompt requirement is "Refactor Game.js... replace manual loops with entityManager.update".
        // It's acceptable to modify entities to standardized update(dt, game).

        // However, I can't modify all entities easily in one go if they are scattered?
        // Let's modify GlitchHunter.

        // I will read GlitchHunter first.
        const mx = context.mouse.x;
        const my = context.mouse.y;

        if (!this.active) return;

        // 1. Move to cursor
        const dx = mx - this.x;
        const dy = my - this.y;
        const dist = Math.hypot(dx, dy);

        // Normalize
        if (dist > 0) {
            this.x += (dx / dist) * this.speed;
            this.y += (dy / dist) * this.speed;
        }

        // 2. Visual pulse
        this.pulse += dt * 5;

        // 3. Attack (if reached cursor)
        if (dist < this.size + 10) {
            return 'damage'; // Signal player damage
        }
        return null;
    }

    draw(ctx) {
        if (!this.active) return;

        ctx.save();
        ctx.translate(this.x, this.y);

        // "Glitch Eye" Effect
        const scale = 1 + Math.sin(this.pulse) * 0.1;
        ctx.scale(scale, scale);

        // Aura
        ctx.fillStyle = `rgba(255, 0, 0, 0.3)`;
        ctx.beginPath();
        ctx.arc(0, 0, this.size + 10, 0, Math.PI * 2);
        ctx.fill();

        // Core
        ctx.fillStyle = '#f00';
        ctx.beginPath();
        // Distorted circle
        for (let i = 0; i < Math.PI * 2; i += 0.5) {
            let r = this.size + Math.random() * 5;
            ctx.lineTo(Math.cos(i) * r, Math.sin(i) * r);
        }
        ctx.fill();

        // Pupil
        ctx.fillStyle = '#000';
        ctx.fillRect(-5, -15, 10, 30); // Vertical pupil

        ctx.restore();
    }

    checkClick(mx, my) {
        const dist = Math.hypot(mx - this.x, my - this.y);
        if (dist < this.size + 15) {
            this.hp--;
            // Knockback
            this.x += (this.x - mx) * 2;
            this.y += (this.y - my) * 2;

            if (this.hp <= 0) {
                this.active = false;
                return true; // Killed
            }
            return 'hit'; // Just hit
        }
        return false;
    }
}

export class CursedCaptcha {
    constructor(w, h) {
        this.w = 300; this.h = 100;
        this.x = UTILS.rand(50, w - 350);
        this.y = UTILS.rand(50, h - 150);
        this.life = 10.0; // 10 seconds to verify
        this.active = true;
        this.isEye = false;

        // Checkbox position inside window
        this.cbX = 20;
        this.cbY = 30;
        this.cbSize = 24;
    }

    update(dt, context) {
        // context is Game instance
        const mx = context.mouse.x;
        const my = context.mouse.y;
        const w = context.w;
        const h = context.h;

        if (!this.active) return;
        this.life -= dt;
        this.shake = Math.sin(Date.now() / 50) * 5;

        // Timeout penalty handling moved here from Game.js
        if (this.life <= 0) {
            // Apply penalty directly
            context.events.emit('play_sound', 'error');
            context.state.score -= context.state.autoRate * 60;
            if (context.state.score < 0) context.state.score = 0;
            context.shake = 5;
            context.chat.addMessage('SYSTEM', 'VERIFICATION FAILED: ACCESS DENIED');
            context.state.addCorruption(5); // Was manually adding
            return 'timeout';
        }
        // Check distance to checkbox center (absolute coords)
        const absCbX = this.x + this.cbX + this.cbSize / 2;
        const absCbY = this.y + this.cbY + this.cbSize / 2;

        const dist = Math.hypot(mx - absCbX, my - absCbY);

        // 1. Transform to Eye
        if (dist < 100) {
            this.isEye = true;
        } else {
            this.isEye = false;
        }

        // 2. Flee
        if (dist < 80) {
            // Vector from mouse
            const dx = absCbX - mx;
            const dy = absCbY - my;

            // Move window
            this.x += dx * 0.1;
            this.y += dy * 0.1;

            // Borders
            if (this.x < 0) this.x = 0;
            if (this.x > w - this.w) this.x = w - this.w;
            if (this.y < 0) this.y = 0;
            if (this.y > h - this.h) this.y = h - this.h;
        }
    }

    draw(ctx) {
        if (!this.active) return;

        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(this.x + 5, this.y + 5, this.w, this.h);

        // BG like reCAPTCHA
        ctx.fillStyle = '#f9f9f9';
        ctx.fillRect(this.x, this.y, this.w, this.h);

        // Border
        ctx.strokeStyle = '#d3d3d3';
        ctx.lineWidth = 1;
        ctx.strokeRect(this.x, this.y, this.w, this.h);

        // Checkbox area
        if (this.isEye) {
            // Eye instead of checkbox
            const cx = this.x + this.cbX + this.cbSize / 2;
            const cy = this.y + this.cbY + this.cbSize / 2;

            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(cx, cy, 15, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            // Pupil (moving)
            ctx.fillStyle = '#f00';
            ctx.beginPath();
            ctx.arc(cx + (Math.random() - 0.5) * 5, cy + (Math.random() - 0.5) * 5, 5, 0, Math.PI * 2);
            ctx.fill();

        } else {
            // Normal Checkbox
            ctx.fillStyle = '#fff';
            ctx.fillRect(this.x + this.cbX, this.y + this.cbY, this.cbSize, this.cbSize);
            ctx.strokeStyle = '#c1c1c1';
            ctx.strokeRect(this.x + this.cbX, this.y + this.cbY, this.cbSize, this.cbSize);
        }

        // Text
        ctx.fillStyle = '#000';
        ctx.font = '14px Arial';
        ctx.textAlign = 'left';
        ctx.fillText("I'm not a robot", this.x + 60, this.y + 48);

        // Fake Recaptcha logo
        ctx.fillStyle = '#555';
        ctx.font = '10px Arial';
        ctx.fillText("reCAPTCHA", this.x + 230, this.y + 80);
        ctx.fillText("Privacy - Terms", this.x + 220, this.y + 92);

        // Timer bar
        ctx.fillStyle = '#f00';
        ctx.fillRect(this.x, this.y + this.h - 4, this.w * (this.life / 10), 4);
    }

    checkClick(mx, my) {
        const valMargin = 10; // Tolerance
        const absCbX = this.x + this.cbX;
        const absCbY = this.y + this.cbY;

        // Click must be exactly on checkbox
        if (mx >= absCbX - valMargin && mx <= absCbX + this.cbSize + valMargin &&
            my >= absCbY - valMargin && my <= absCbY + this.cbSize + valMargin) {
            this.active = false;
            return true; // Success
        }
        return false;
    }
}
