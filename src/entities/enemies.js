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
        if (!this.active) return;

        const mx = context.mouse.x;
        const my = context.mouse.y;

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
            this.onReachTarget(context, dt);
        }
    }

    onReachTarget(context, dt) {
        // Apply damage directly
        context.state.score -= context.state.autoRate * dt * 2;
        if (context.state.score < 0) context.state.score = 0;
        context.shake = 5;
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

    destroy() {
        // Cleanup resources if any (listeners, etc)
        // Currently none, but good for future proofing
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
            context.uiManager.chat.addMessage('SYSTEM', 'VERIFICATION FAILED: ACCESS DENIED');
            context.state.addCorruption(-5); // Timeout now reduces corruption (bad for player if they want glitch)
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

    destroy() {
        // Cleanup
    }
}

export class AntiVirusBot extends GlitchHunter {
    constructor(w, h) {
        super(w, h);
        this.color = '#00ffff'; // Cyan
        this.auraColor = 'rgba(0, 255, 255, 0.3)';
        this.patchTimer = 0;
        this.patchMax = 1.0; // 1 Second to patch
    }

    update(dt, context) {
        super.update(dt, context);

        // Reset timer if moved away
        const mx = context.mouse.x;
        const my = context.mouse.y;
        const dist = Math.hypot(mx - this.x, my - this.y);

        // Threshold match GlitchHunter.update (size + 10)
        if (dist >= this.size + 10) {
            this.patchTimer = 0;
        }
    }

    // Override draw to look different
    draw(ctx) {
        if (!this.active) return;

        ctx.save();
        ctx.translate(this.x, this.y);

        const scale = 1 + Math.sin(this.pulse) * 0.1;
        ctx.scale(scale, scale);

        // Aura
        ctx.fillStyle = this.auraColor;
        ctx.beginPath();
        ctx.arc(0, 0, this.size + 10, 0, Math.PI * 2);
        ctx.fill();

        // Core - Cross / Plus shape for Health/Antivirus
        ctx.fillStyle = '#00ffff';
        ctx.fillRect(-15, -5, 30, 10);
        ctx.fillRect(-5, -15, 10, 30);

        // Progress Bar (if charging)
        if (this.patchTimer > 0) {
            ctx.fillStyle = '#0f0';
            const pct = Math.min(1, this.patchTimer / this.patchMax);
            ctx.fillRect(-20, -35, 40 * pct, 4);
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 1;
            ctx.strokeRect(-20, -35, 40, 4);
        }

        ctx.restore();
    }

    // Override update to heal (reduce corruption) on hit
    onReachTarget(context, dt) {
        // Charge up patch
        this.patchTimer += dt;

        if (this.patchTimer >= this.patchMax) {
            // "Heal" the system -> Reduce corruption
            context.state.addCorruption(-5); // Penalize progress
            context.createFloatingText(this.x, this.y, "PATCHED!", "#00ffff");
            context.events.emit('play_sound', 'error'); // Bad sound
            this.active = false; // Die after patching
        }
    }

    // Rely on base checkClick implementation
    // We already moved generic movement/click logic to base
}

export class SuddenMeeting {
    constructor(w, h) {
        this.w = w;
        this.h = h;
        this.life = 10.0; // Lasts 10 seconds
        this.hp = 20;     // Clicks to dismiss early
        this.active = true;
        this.texts = [
            "SYNERGY ALIGNMENT",
            "Q3 STRATEGY REVIEW",
            "MANDATORY HR TRAINING",
            "BLOCKCHAIN SYMPOSIUM",
            "PIVOT TO VIDEO"
        ];
        this.text = this.texts[Math.floor(Math.random() * this.texts.length)];
    }

    update(dt, context) {
        if (!this.active) return;
        this.life -= dt;
        if (this.life <= 0) {
            this.active = false;
        }
    }

    draw(ctx) {
        if (!this.active) return;

        ctx.save();
        // Overlay
        ctx.fillStyle = 'rgba(200, 200, 190, 0.95)'; // Boring Beige
        ctx.fillRect(0, 0, this.w, this.h);

        // Box
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 5;
        ctx.strokeRect(50, 50, this.w - 100, this.h - 100);

        // Text
        ctx.fillStyle = '#000';
        ctx.font = 'bold 36px Arial';
        ctx.textAlign = 'center';
        ctx.fillText("ATTENTION!", this.w / 2, this.h / 2 - 50);

        ctx.font = '24px Arial';
        ctx.fillText(this.text, this.w / 2, this.h / 2);

        ctx.fillStyle = '#555';
        ctx.font = '16px Arial';
        ctx.fillText(`CLICK TO END MEETING (${Math.ceil(this.hp)})`, this.w / 2, this.h / 2 + 50);

        ctx.restore();
    }

    checkClick(mx, my) {
        // Any click counts
        this.hp--;
        if (this.hp <= 0) {
            this.active = false;
            return true;
        }
        return 'hit'; // Absorb click
    }
}


