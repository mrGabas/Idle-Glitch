/**
 * RENDERER SYSTEM
 * Handles all canvas 2D drawing operations
 * @module systems/Renderer
 */
import { CFG, UTILS } from '../core/config.js';

export class Renderer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        /** @type {CanvasRenderingContext2D} */
        this.ctx = this.canvas.getContext('2d');
        this.w = 0;
        this.h = 0;
    }

    setSize(w, h) {
        this.w = this.canvas.width = w;
        this.h = this.canvas.height = h;
    }

    /**
     * Main Draw Call
     * @param {Object} state - Game state (score, corruption, etc)
     * @param {Object} world - Theme, Mouse, etc
     * @param {Object} entities - Arrays of game objects
     */
    draw(state, world, entities) {
        const { currentTheme, mouse, shake, scareTimer, scareText } = world;

        if (state.crashed) {
            this.drawBSOD();
            return;
        }
        if (state.rebooting) {
            this.drawBIOS(world.rebootTimer);
            return;
        }

        if (scareTimer > 0) {
            this.ctx.fillStyle = '#000';
            this.ctx.fillRect(0, 0, this.w, this.h);
            this.ctx.fillStyle = '#f00';
            this.ctx.font = "bold 48px Courier New";
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(scareText || "I SEE YOU", this.w / 2, this.h / 2);
            return;
        }

        this.ctx.save();
        if (shake > 0.5) {
            this.ctx.translate((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake);
        }

        // BG
        this.ctx.fillStyle = currentTheme.colors.bg;
        this.ctx.fillRect(0, 0, this.w, this.h);

        // CrazyFaces Layer
        if (entities.fakeUI) entities.fakeUI.draw(this.ctx);

        // Game Center Vignette
        const cx = this.w / 2;
        const cy = this.h / 2;
        const grad = this.ctx.createRadialGradient(cx, cy, 100, cx, cy, 500);
        grad.addColorStop(0, currentTheme.colors.bg);
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        this.ctx.fillStyle = grad;
        this.ctx.fillRect(0, 0, this.w, this.h);

        this.drawGameUI(state, currentTheme, entities.upgrades, mouse);

        // Entities
        if (entities.debris) entities.debris.forEach(d => d.draw(this.ctx));
        if (entities.particles) entities.particles.forEach(p => p.draw(this.ctx));
        if (entities.popups) entities.popups.forEach(p => p.draw(this.ctx));
        if (entities.captchas) entities.captchas.forEach(c => c.draw(this.ctx));
        if (entities.loreFiles) entities.loreFiles.forEach(f => f.draw(this.ctx));

        // PostFX
        if (state.glitchIntensity > 0.1) {
            if (Math.random() < state.glitchIntensity * 0.1) this.createGlitchSlice();
        }

        // LEGACY SYSTEM: Scanlines
        if (currentTheme.id === 'legacy_system') {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
            for (let y = 0; y < this.h; y += 4) {
                this.ctx.fillRect(0, y, this.w, 2);
            }
        }

        if (entities.hunter) entities.hunter.draw(this.ctx);

        if (entities.chat) entities.chat.draw(this.ctx, this.h);
        if (entities.activeNotepad) entities.activeNotepad.draw(this.ctx);
        if (entities.mailWindow) entities.mailWindow.draw(this.ctx);

        // Mail Button
        if (entities.mailSystem) {
            this.drawMailIcon(this.ctx, this.w - 50, 50, entities.mailSystem.hasUnread);
        }

        this.drawCursor(state, currentTheme, mouse);
        this.ctx.restore();
    }

    drawCursor(state, theme, mouse) {
        // Simple crosshair or custom cursor
        const mx = mouse.x;
        const my = mouse.y;

        this.ctx.strokeStyle = theme.colors.accent;

        // Visual Cues for Decay
        if (state.corruption > 60) {
            this.ctx.strokeStyle = '#f00'; // Red warning
            if (state.corruption > 85) {
                // Inversion Strobe
                this.ctx.strokeStyle = UTILS.randArr(['#f00', '#0ff', '#fff']);
            }
        }

        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(mx - 10, my);
        this.ctx.lineTo(mx + 10, my);
        this.ctx.moveTo(mx, my - 10);
        this.ctx.lineTo(mx, my + 10);
        this.ctx.stroke();
    }

    drawGameUI(state, theme, upgrades, mouse) {
        const cx = this.w / 2;
        const cy = this.h / 2;
        const colors = theme.colors;

        // Main Button circle
        this.ctx.beginPath();
        this.ctx.arc(cx, cy - 100, 80, 0, Math.PI * 2);

        // Gradient
        const grad = this.ctx.createLinearGradient(cx - 80, cy - 180, cx + 80, cy - 20);
        theme.button.gradient.forEach((c, i) => grad.addColorStop(i / (theme.button.gradient.length - 1), c));

        this.ctx.fillStyle = grad;
        this.ctx.fill();
        this.ctx.lineWidth = 5;
        this.ctx.strokeStyle = '#fff';
        this.ctx.stroke();

        // Button text
        this.ctx.fillStyle = '#fff';
        this.ctx.font = "bold 24px Arial";
        this.ctx.textAlign = 'center';
        this.ctx.fillText(theme.button.text, cx, cy - 110);
        this.ctx.font = "40px Arial";
        this.ctx.fillText(theme.button.emoji, cx, cy - 70);

        // Score
        this.ctx.fillStyle = colors.text;
        this.ctx.font = CFG.fonts.xl;
        this.ctx.fillText(UTILS.fmt(state.score) + ' ' + theme.currency.symbol, cx, cy + 20);

        this.ctx.font = CFG.fonts.m;
        this.ctx.fillText(`${UTILS.fmt(state.autoRate)} / sec`, cx, cy + 50);

        // Progress Bar (Corruption/Happiness)
        const barW = 400;
        const barH = 20;
        const bx = cx - barW / 2;
        const by = this.h - 50;

        this.ctx.fillStyle = theme.progressBar.bgColor;
        this.ctx.fillRect(bx, by, barW, barH);

        let pct = state.corruption;
        if (theme.progressBar.invert) pct = 100 - pct;

        this.ctx.fillStyle = theme.progressBar.color;
        this.ctx.fillRect(bx, by, barW * (pct / 100), barH);

        this.ctx.strokeStyle = colors.uiBorder;
        this.ctx.strokeRect(bx, by, barW, barH);

        this.ctx.fillStyle = colors.text;
        this.ctx.font = "bold 14px Arial";
        this.ctx.fillText(theme.progressBar.label, cx, by - 10);

        // Upgrades Shop
        // Grid 2x4
        if (upgrades) {
            upgrades.forEach((u, i) => {
                const col = i % 2;
                const row = Math.floor(i / 2);

                const ux = cx - 230 + col * 240;
                const uy = cy + 50 + row * 80;

                // NULL VOID MECHANIC: Invisible UI
                let alpha = 1;
                if (theme.id === 'null_void') {
                    const mx = mouse.x;
                    const my = mouse.y;
                    if (mx >= ux && mx <= ux + 220 && my >= uy && my <= uy + 70) {
                        alpha = 1;
                    } else {
                        alpha = 0.05; // Almost invisible
                    }
                }

                this.ctx.globalAlpha = alpha;

                // BG
                this.ctx.fillStyle = state.score >= u.cost ? colors.ui : '#333';
                this.ctx.fillRect(ux, uy, 220, 70);

                // Border
                this.ctx.strokeStyle = colors.uiBorder;
                this.ctx.lineWidth = 1;
                this.ctx.strokeRect(ux, uy, 220, 70);

                // Name
                this.ctx.fillStyle = colors.text;
                this.ctx.textAlign = 'left';
                this.ctx.font = "bold 16px Arial";
                this.ctx.fillText(u.name, ux + 10, uy + 25);

                // Cost
                const canBuy = state.score >= u.cost;
                this.ctx.fillStyle = canBuy ? colors.accent : '#888';
                this.ctx.font = "14px monospace";
                this.ctx.fillText("Cost: " + UTILS.fmt(u.cost), ux + 10, uy + 45);

                // Count
                this.ctx.fillStyle = '#fff';
                this.ctx.textAlign = 'right';
                this.ctx.font = "bold 20px Arial";
                this.ctx.fillText(u.count, ux + 210, uy + 60);

                // Desc
                this.ctx.fillStyle = '#aaa';
                this.ctx.font = "12px Arial";
                this.ctx.textAlign = 'right';
                this.ctx.fillText(u.desc, ux + 210, uy + 25);

                this.ctx.globalAlpha = 1; // Reset
            });
        }
    }

    drawBSOD() {
        this.ctx.fillStyle = '#0000aa';
        this.ctx.fillRect(0, 0, this.w, this.h);
        this.ctx.fillStyle = '#fff';
        this.ctx.font = "20px 'Courier New', monospace";
        this.ctx.textAlign = 'left';

        const lines = [
            "A problem has been detected and Windows has been shut down to prevent damage",
            "to your computer.", "", "THE_GLITCH_HAS_CONSUMED_ALL.", "",
            "Technical Information:", "",
            "*** STOP: 0x00000666 (0xDEADDEAD, 0xC0000221, 0x00000000, 0x00000000)",
            "*** GLITCH.SYS - Address FFFFFFFF base at FFFFFFFF, DateStamp 666666"
        ];

        let y = 100;
        lines.forEach(l => { this.ctx.fillText(l, 50, y); y += 28; });
    }

    drawBIOS(rebootTimer) {
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.w, this.h);
        this.ctx.fillStyle = '#ccc';
        this.ctx.font = "20px 'Courier New', monospace";
        this.ctx.textAlign = 'left';

        const lines = [
            "PhoenixBIOS 4.0 Release 6.0", "Copyright (C) 1985-2025 Phoenix Technologies Ltd.",
            "", "CPU = GlitchPRO 9000 Pro @ 99.9 GHz", "Rebooting system..."
        ];

        let y = 50;
        lines.forEach((l, i) => {
            if (rebootTimer < 5.0 - i * 0.5) { // Simple stagger
                this.ctx.fillText(l, 50, y); y += 24;
            }
        });
    }

    createGlitchSlice() {
        // if (Math.random() > 0.3) return; // Logic moved to Game or check before call
        const h = Math.random() * 30 + 5;
        const y = Math.random() * this.h;
        try {
            this.ctx.globalCompositeOperation = 'difference';
            this.ctx.fillStyle = UTILS.randArr(['#f0f', '#0ff', '#ff0']);
            this.ctx.fillRect(0, y, this.w, h);
            this.ctx.globalCompositeOperation = 'source-over';
        } catch (e) { }
    }

    drawMailIcon(ctx, x, y, hasUnread) {
        // Simple Envelope
        const size = 30; // Half-size for math

        // Button BG
        ctx.fillStyle = '#c0c0c0';
        ctx.fillRect(x - size, y - size, size * 2, size * 2);

        // Bevel
        ctx.fillStyle = '#fff';
        ctx.fillRect(x - size, y - size, size * 2, 2);
        ctx.fillRect(x - size, y - size, 2, size * 2);
        ctx.fillStyle = '#000';
        ctx.fillRect(x + size - 2, y - size, 2, size * 2);
        ctx.fillRect(x - size, y + size - 2, size * 2, 2);

        // Envelope Icon
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        const iconS = 15;
        ctx.rect(x - iconS, y - iconS + 5, iconS * 2, iconS * 2 - 5);
        ctx.moveTo(x - iconS, y - iconS + 5);
        ctx.lineTo(x, y + 5);
        ctx.lineTo(x + iconS, y - iconS + 5);
        ctx.stroke();

        if (hasUnread) {
            // Notification Badge
            ctx.fillStyle = 'red';
            ctx.beginPath();
            ctx.arc(x + 10, y - 10, 8, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = 'white';
            ctx.font = 'bold 12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText("!", x + 10, y - 6);
        }
    }
}
