/**
 * RENDERER SYSTEM
 * Handles all canvas 2D drawing operations
 * @module systems/Renderer
 */
import { CFG, UTILS } from '../core/config.js';
import { META_UPGRADES } from '../data/metaUpgrades.js';
import { assetLoader } from '../core/AssetLoader.js';

export class Renderer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        /** @type {CanvasRenderingContext2D} */
        this.ctx = this.canvas.getContext('2d');
        this.w = 0;
        this.h = 0;
        // this.imageCache = {}; // Removed in favor of AssetLoader

        // Matrix Rain Settings
        this.matrixFontSize = 16;
        this.matrixColumns = 0;
        this.matrixDrops = [];

        // Caches
        this.timeString = "";
        this.lastTimeUpdate = 0;
        this.mainButtonGrad = null;
    }

    setSize(w, h) {
        this.w = this.canvas.width = w;
        this.h = this.canvas.height = h;
        this.mainButtonGrad = null; // Invalidate cache
        this.vignetteGrad = null; // Invalidate vignette cache
        this.matrixDrops = []; // Reset matrix
    }

    /**
     * Main Draw Call
     * @param {Object} state - Game state (score, corruption, etc)
     * @param {Object} entities - Arrays of game objects
     * @param {Object} input - Input processing data (mouse, theme, flags)
     * @param {Object} uiManager - The UI Manager instance
     */
    draw(state, entities, input, uiManager) {
        const { currentTheme, mouse, shake, scareTimer, scareText } = input;

        // Optimize Time String (Update once per second)
        const now = Date.now();
        if (now - this.lastTimeUpdate > 1000) {
            this.timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            this.lastTimeUpdate = now;
        }

        if (state.crashed) {
            this.drawBSOD();
            return;
        }
        if (state.rebooting) {
            this.drawOldBIOS(input.rebootTimer);
            return;
        }

        if (input.gameState === 'BIOS') {
            this.drawBIOS(state, input, input.metaUpgrades, META_UPGRADES);
            return;
        }

        // --- FALSE CRASH VISUALS ---
        if (state.falseCrash) {
            this.ctx.fillStyle = '#000';
            this.ctx.fillRect(0, 0, this.w, this.h);

            // Show text after 3 seconds
            if (state.crashTimer > 3.0) {
                this.ctx.fillStyle = '#f00';
                this.ctx.font = "bold 24px Courier New";
                this.ctx.textAlign = 'center';
                this.ctx.fillText("I T  I S  N O T  A  G A M E", this.w / 2, this.h / 2);
            }
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
        if (currentTheme.id === 'digital_decay') {
            this.drawMatrixRain();
        } else {
            this.ctx.fillStyle = currentTheme.colors.bg;
            this.ctx.fillRect(0, 0, this.w, this.h);
        }

        // PARALLAX
        if (currentTheme.parallax) {
            this.drawParallax(currentTheme);
        }

        // CrazyFaces Layer
        if (entities.fakeUI) entities.fakeUI.draw(this.ctx);

        // Game Center Vignette
        if (!this.vignetteGrad || this.vignetteGradTheme !== currentTheme.id) {
            const cx = this.w / 2;
            const cy = this.h / 2;
            const grad = this.ctx.createRadialGradient(cx, cy, 100, cx, cy, 500);
            grad.addColorStop(0, currentTheme.colors.bg);
            grad.addColorStop(1, 'rgba(0,0,0,0)');
            this.vignetteGrad = grad;
            this.vignetteGradTheme = currentTheme.id;
        }
        this.ctx.fillStyle = this.vignetteGrad;
        this.ctx.fillRect(0, 0, this.w, this.h);

        this.drawGameUI(state, currentTheme, entities.upgrades, mouse);

        // Entities
        if (entities.debris) entities.debris.forEach(d => d.draw(this.ctx));
        if (entities.particles) entities.particles.forEach(p => p.draw(this.ctx));

        // Draw Popups (Legacy or specific EntityManager popups)
        if (entities.popups) {
            entities.popups.forEach(p => p.draw(this.ctx));
        }
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

        // DEV DESKTOP: Taskbar & Clippy
        if (currentTheme.id === 'dev_desktop') {
            // Taskbar
            this.ctx.fillStyle = '#245edb';
            this.ctx.fillRect(0, this.h - 40, this.w, 40);

            // Start Button
            this.ctx.fillStyle = '#31ab1f';
            this.ctx.beginPath();
            this.ctx.moveTo(0, this.h - 40);
            this.ctx.lineTo(100, this.h - 40);
            this.ctx.quadraticCurveTo(110, this.h - 20, 100, this.h);
            this.ctx.lineTo(0, this.h);
            this.ctx.fill();
            this.ctx.fillStyle = '#fff';
            this.ctx.font = 'bold 16px sans-serif';
            this.ctx.fillText("Start", 30, this.h - 15);

            // Clock/Tray
            this.ctx.fillStyle = '#0b288b';
            this.ctx.fillRect(this.w - 100, this.h - 40, 100, 40);
            // Use cached time string
            this.ctx.fillStyle = '#fff';
            this.ctx.font = '14px sans-serif';
            this.ctx.fillText(this.timeString, this.w - 80, this.h - 15);

            // Clippy Logic (Visual only)
            if (entities.clippy) entities.clippy.draw(this.ctx);
            else if (Math.random() < 0.05) this.drawClippy(this.w - 80, this.h - 100);
        }

        // Draw HUD Elements (Mail Icon)
        this.drawHUD(this.w, this.h, uiManager);

        // Draw Windows & UI Overlay (Delegated to UIManager)
        uiManager.draw(this.ctx);

        // Feedback / Reviews Button (Top Right, Below Mail)
        this.drawFeedbackIcon(this.w - 50, 110, '#6d2af7', '💬'); // Chat bubble emoji or draw custom
        // Achievements Button
        this.drawFeedbackIcon(this.w - 50, 170, '#FFD700', '🏆');

        if (entities.fakeCursor) entities.fakeCursor.draw(this.ctx);

        this.drawCursor(state, currentTheme, mouse);
        this.ctx.restore();
    }

    drawFeedbackIcon(x, y, color, emoji) {
        // Stylish modern icon
        this.ctx.save();
        this.ctx.translate(x, y); // x,y passed from draw() calls

        // Bouncing animation
        const bounce = Math.sin(Date.now() / 300) * 3;
        this.ctx.translate(0, bounce);

        // Glow
        this.ctx.shadowColor = color;
        this.ctx.shadowBlur = 15;

        // Circle
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 25, 0, Math.PI * 2);
        this.ctx.fill();

        // Icon (Emoji or Shape)
        this.ctx.shadowBlur = 0;
        this.ctx.fillStyle = '#fff';
        this.ctx.font = "24px Arial";
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";
        this.ctx.fillText(emoji || '?', 0, 2);

        this.ctx.restore();
    }

    drawHUD(w, h, uiManager) {
        // Mail Icon (Top Right)
        const mx = w - 50;
        const my = 50;

        this.ctx.fillStyle = '#fff';
        this.ctx.fillRect(mx - 15, my - 10, 30, 20); // Envelope body

        // Flap
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(mx - 15, my - 10);
        this.ctx.lineTo(mx, my + 5);
        this.ctx.lineTo(mx + 15, my - 10);
        this.ctx.stroke();

        // Notification Badge
        if (uiManager.mail && uiManager.mail.hasUnread) {
            this.ctx.fillStyle = '#f00';
            this.ctx.beginPath();
            this.ctx.arc(mx + 15, my - 10, 8, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.fillStyle = '#fff';
            this.ctx.font = 'bold 10px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText("!", mx + 15, my - 7);
        }
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

        // NULL VOID MECHANIC: Main Button Invisibility
        let btnAlpha = 1;
        if (theme.id === 'null_void') {
            const dist = Math.hypot(mouse.x - cx, mouse.y - (cy - 100));
            if (dist < 80) btnAlpha = 1; else btnAlpha = 0;
        }

        this.ctx.globalAlpha = btnAlpha;

        // Main Button circle
        this.ctx.beginPath();
        this.ctx.arc(cx, cy - 100, 80, 0, Math.PI * 2);

        // Gradient
        // Gradient
        let grad = this.mainButtonGrad;
        if (!grad) {
            grad = this.ctx.createLinearGradient(cx - 80, cy - 180, cx + 80, cy - 20);
            theme.button.gradient.forEach((c, i) => grad.addColorStop(i / (theme.button.gradient.length - 1), c));
            this.mainButtonGrad = grad;
        }

        this.ctx.fillStyle = grad;
        this.ctx.fill();
        this.ctx.lineWidth = 5;
        this.ctx.strokeStyle = theme.id === 'null_void' ? '#000' : '#fff'; // Black outline for Null Void
        this.ctx.stroke();

        // Button text
        this.ctx.fillStyle = theme.id === 'null_void' ? '#000' : '#fff';
        this.ctx.font = "bold 24px Arial";
        this.ctx.textAlign = 'center';
        this.ctx.fillText(theme.button.text, cx, cy - 110);
        this.ctx.font = "40px Arial";
        this.ctx.fillText(theme.button.emoji, cx, cy - 70);

        this.ctx.globalAlpha = 1; // Reset

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

        // Null Void: Invisible Progress Bar too
        let barAlpha = 1;
        if (theme.id === 'null_void') {
            const mx = mouse.x; const my = mouse.y;
            if (mx >= bx && mx <= bx + barW && my >= by && my <= by + barH) barAlpha = 1; else barAlpha = 0;
        }
        this.ctx.globalAlpha = barAlpha;

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

        this.ctx.globalAlpha = 1;

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
                        alpha = 0; // Completely invisible
                    }
                }

                this.ctx.globalAlpha = alpha;

                // BG
                this.ctx.fillStyle = state.score >= u.cost ? colors.ui : (theme.id === 'null_void' ? '#fff' : '#333');
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

                // Digital Decay Redaction
                if (theme.id === 'digital_decay' && (u.name.includes('[REDACTED]') || Math.random() < 0.01)) {
                    const w = this.ctx.measureText(u.name).width;
                    this.ctx.fillStyle = '#000';
                    this.ctx.fillRect(ux + 10, uy + 10, w, 18);
                }

                // Cost
                const canBuy = state.score >= u.cost;
                this.ctx.fillStyle = canBuy ? colors.accent : '#888';
                this.ctx.font = "14px monospace";
                this.ctx.fillText("Cost: " + UTILS.fmt(u.cost), ux + 10, uy + 45);

                // Count
                this.ctx.fillStyle = theme.id === 'null_void' ? '#000' : '#fff';
                this.ctx.textAlign = 'right';
                this.ctx.font = "bold 20px Arial";
                this.ctx.fillText(u.count, ux + 210, uy + 60);

                // Desc
                this.ctx.fillStyle = theme.id === 'null_void' ? '#888' : '#aaa';
                this.ctx.font = "12px Arial";
                this.ctx.textAlign = 'right';
                this.ctx.fillText(u.desc, ux + 210, uy + 25);

                this.ctx.globalAlpha = 1; // Reset
            });
        }
    }

    drawBSOD() {
        // Modern Windows 10/11 Style (Matching index.html #bsod-overlay)
        this.ctx.fillStyle = '#0078d7'; // Modern Blue
        this.ctx.fillRect(0, 0, this.w, this.h);

        this.ctx.fillStyle = '#fff';
        this.ctx.textAlign = 'left';

        // 1. Sad Face
        this.ctx.font = "100px 'Segoe UI', Arial, sans-serif";
        this.ctx.fillText(":(", 100, 150);

        // 2. Main Message
        this.ctx.font = "24px 'Segoe UI', Arial, sans-serif";
        this.ctx.fillText("Your game ran into a problem and needs to restart.", 100, 240);
        this.ctx.fillText("We're just collecting some error info, and then you can restart.", 100, 280);

        // 3. Progress (Fake)
        this.ctx.fillText("100% complete", 100, 320);

        // 4. QR Code Placeholder (White Square)
        this.ctx.fillStyle = '#fff';
        this.ctx.fillRect(100, 380, 80, 80);

        // 5. Technical Info
        this.ctx.fillStyle = '#fff';
        this.ctx.font = "14px 'Segoe UI', Arial, sans-serif";
        let y = 395;
        const x = 200;

        this.ctx.fillText("For more information about this issue and possible fixes, visit https://www.windows.com/stopcode", x, y);
        y += 25;
        this.ctx.fillText("If you call a support person, give them this info:", x, y);
        y += 25;
        this.ctx.fillText("Stop Code: GLITCH_GOD_INITIATED", x, y);
        y += 20;
        this.ctx.fillText("What failed: Reality.sys", x, y);
    }

    drawBIOS(state, input, metaUpgrades, metaList) {
        this.ctx.fillStyle = '#0000aa'; // Blue BIOS bg
        this.ctx.fillRect(0, 0, this.w, this.h);

        // Header
        this.ctx.fillStyle = '#c0c0c0';
        this.ctx.fillRect(0, 0, this.w, 30);
        this.ctx.fillStyle = '#000';
        this.ctx.textAlign = 'center';
        this.ctx.font = "bold 16px 'Courier New', monospace";
        this.ctx.fillText("PHOENIX BIOS SETUP UTILITY", this.w / 2, 20);

        // Footer
        this.ctx.fillStyle = '#c0c0c0';
        this.ctx.fillRect(0, this.h - 30, this.w, 30);
        this.ctx.fillStyle = '#000';
        this.ctx.fillText("ARROWS: Move   CLICK: Select   ENTER: Buy/Toggle   F10: Save & Exit", this.w / 2, this.h - 10);

        // Content Box (Double Border)
        this.ctx.strokeStyle = '#fff';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(20, 50, this.w - 40, this.h - 100);
        this.ctx.strokeRect(22, 52, this.w - 44, this.h - 104);

        // Left Column (Menu)
        this.ctx.fillStyle = '#fff';
        this.ctx.textAlign = 'left';
        this.ctx.font = "16px 'Courier New', monospace";

        // GLITCH DATA DISPLAY
        this.ctx.fillStyle = '#ffff55';
        this.ctx.fillText(`GLITCH DATA: ${input.glitchData || 0} MB`, 40, 80);
        this.ctx.fillStyle = '#fff';

        // Upgrades List
        const startY = 120;
        metaList.forEach((u, i) => {
            const y = startY + i * 30;
            const owned = metaUpgrades[u.id] || 0;
            let label = u.name;

            // Handle max level display
            // Handle max level display
            if (u.type === 'feature') {
                label += owned ? " [ENABLED]" : " [DISABLED]";
            } else {
                label += ` [Lv.${owned}]`;
            }

            // Selection highlight
            if (i === input.selectedBIOSIndex || (input.mouse.y >= y - 20 && input.mouse.y < y + 10)) {
                this.ctx.fillStyle = '#fff';
                this.ctx.fillRect(38, y - 20, this.w - 78, 30);
                this.ctx.fillStyle = '#0000aa';
            } else {
                this.ctx.fillStyle = '#fff';
            }

            // Handle Cost Scaling
            let cost = u.baseCost;
            if (u.costScale) {
                cost = Math.floor(u.baseCost * Math.pow(u.costScale, owned));
            }

            this.ctx.fillText(label, 40, y);
            this.ctx.fillText(cost + " MB", 400, y);
        });

        // "BOOT SYSTEM" Option
        const bootY = startY + metaList.length * 30 + 30;
        const bootIndex = metaList.length;

        if (input.selectedBIOSIndex === bootIndex || (input.mouse.y >= bootY - 20 && input.mouse.y < bootY + 10)) {
            this.ctx.fillStyle = '#fff';
            this.ctx.fillRect(38, bootY - 20, this.w - 78, 30);
            this.ctx.fillStyle = '#0000aa';
        } else {
            this.ctx.fillStyle = '#0f0';
        }
        this.ctx.fillText("> BOOT SYSTEM (START NEW RUN)", 40, bootY);

        // Theme Selector (if unlocked)
        // Theme Selector (if unlocked)
        if (metaUpgrades['start_theme']) {
            const themeY = bootY + 30;
            const themeIndex = metaList.length + 1;

            if (input.selectedBIOSIndex === themeIndex || (input.mouse.y >= themeY - 20 && input.mouse.y < themeY + 10)) {
                this.ctx.fillStyle = '#fff';
                this.ctx.fillRect(38, themeY - 20, this.w - 78, 30);
                this.ctx.fillStyle = '#0000aa';
            } else {
                this.ctx.fillStyle = '#0ff';
            }
            this.ctx.fillText(`STARTING THEME: [${input.currentTheme.id.toUpperCase()}]`, 40, themeY);
        }

        // Explicitly draw cursor on top for BIOS
        this.drawCursor(state, input.currentTheme, input.mouse);
    }

    drawOldBIOS(rebootTimer) {
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

    drawClippy(x, y) {
        // Simple shape drawing for Clippy
        this.ctx.save();
        this.ctx.translate(x, y);
        this.ctx.lineWidth = 3;
        this.ctx.strokeStyle = '#c0c0c0';

        // Body
        this.ctx.beginPath();
        this.ctx.moveTo(10, 40);
        this.ctx.quadraticCurveTo(0, 40, 0, 30);
        this.ctx.lineTo(0, 10);
        this.ctx.quadraticCurveTo(0, 0, 10, 0);
        this.ctx.lineTo(30, 0);
        this.ctx.quadraticCurveTo(40, 0, 40, 10);
        this.ctx.lineTo(40, 20); // Loop
        this.ctx.stroke();

        // Eyes (Red for evil)
        this.ctx.fillStyle = '#f00';
        this.ctx.beginPath(); this.ctx.arc(12, 12, 4, 0, Math.PI * 2); this.ctx.fill();
        this.ctx.beginPath(); this.ctx.arc(28, 12, 4, 0, Math.PI * 2); this.ctx.fill();

        // Eyebrows
        this.ctx.strokeStyle = '#000';
        this.ctx.beginPath(); this.ctx.moveTo(5, 5); this.ctx.lineTo(15, 10); this.ctx.stroke();
        this.ctx.beginPath(); this.ctx.moveTo(35, 5); this.ctx.lineTo(25, 10); this.ctx.stroke();

        // Text bubble
        this.ctx.fillStyle = '#ffffe1';
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 1;
        this.ctx.fillRect(-120, -60, 110, 50);
        this.ctx.strokeRect(-120, -60, 110, 50);

        this.ctx.fillStyle = '#000';
        this.ctx.font = '11px Tahoma';
        this.ctx.fillText("It looks like you", -115, -45);
        this.ctx.fillText("want to delete", -115, -30);
        this.ctx.fillText("System32?", -115, -15);

        this.ctx.restore();
    }

    drawParallax(theme) {
        if (!theme.parallax || !theme.parallax.layers) return;

        const time = Date.now() / 1000;

        theme.parallax.layers.forEach(layer => {
            const img = assetLoader.getImage(layer.src);
            // Strict check: must be loaded and have dimensions (not broken)
            if (img && img.complete && img.naturalWidth > 0) {
                // Scroll logic
                const x = -(time * layer.speed) % this.w;

                // Draw twice for seamless loop
                this.ctx.drawImage(img, x, 0, this.w, this.h);
                this.ctx.drawImage(img, x + this.w, 0, this.w, this.h);
            }
        });
    }

    drawMatrixRain() {
        // 1. Init
        // Reduce density: fewer columns
        const fontSize = 20; // Increased from 16
        const cols = Math.floor(this.w / fontSize);
        if (this.matrixDrops.length !== cols) {
            this.matrixDrops = Array(cols).fill(1).map(() => Math.random() * -100);
        }

        // 2. Fade effect (Trails)
        this.ctx.fillStyle = 'rgba(0, 5, 0, 0.1)'; // Very dark green fade
        this.ctx.fillRect(0, 0, this.w, this.h);

        // 3. Text settings
        this.ctx.fillStyle = '#0F0';
        // 3. Text settings
        this.ctx.fillStyle = '#0F0';
        this.ctx.font = fontSize + 'px monospace';

        // 4. Draw drops
        for (let i = 0; i < this.matrixDrops.length; i++) {
            // Random Katakana / Matrix char
            const text = String.fromCharCode(0x30A0 + Math.random() * 96);

            const x = i * fontSize;
            const y = this.matrixDrops[i] * fontSize;

            // Randomly brighter character
            if (Math.random() > 0.95) this.ctx.fillStyle = '#CFFFCD';
            else this.ctx.fillStyle = '#0F0';

            this.ctx.fillText(text, x, y);

            // 5. Reset drop
            if (y > this.h && Math.random() > 0.975) {
                this.matrixDrops[i] = 0;
            }

            // Move down
            this.matrixDrops[i]++;
        }
    }
}
