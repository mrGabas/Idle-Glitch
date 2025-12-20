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


        // Matrix Rain Settings
        this.matrixFontSize = 16;
        this.matrixColumns = 0;
        this.matrixDrops = [];

        // Caches
        this.timeString = "";
        this.lastTimeUpdate = 0;
        this.mainButtonGrad = null;

        this.CREEPY_TEXTS = ["HELP ME", "IT HURTS", "STOP CLICKING", "I SEE YOU", "NO ESCAPE", "LET ME OUT", "SYSTEM FAILURE", "NULL", "DIE", "RUN"];
        this.SubliminalMessages = ["WAKE UP", "IT'S A TRAP", "KILL PROCESS", "EYES OPEN"];
        this.SubliminalImages = [
            'assets/25fps/Larry.webp',
            'assets/25fps/Scarycat.webp',
            'assets/25fps/Scarycat2.webp'
        ];

        // Subliminal State
        this.subliminalActive = false;
        this.subliminalTimer = 0;
        this.subliminalType = null; // 'image', 'text', 'invert'
        this.subliminalContent = null;

        // UI Gaslighting Map
        this.GASLIGHT_MAP = {
            "🦄 Unicorn Friend": { name: "Autonomic Spasm", desc: "Twitching forever." },
            "🌟 Magic Wand": { name: "Visual Cortex", desc: "Stimulated directly." },
            "🏰 Cloud Castle": { name: "Coffin Row", desc: "Sleep well." },
            "🧁 Cupcake Bakery": { name: "Biomass VAT", desc: "Recycle the flesh." },
            "🌈 Rainbow Factory": { name: "Thought Grinder", desc: "No more dreams." },
            "🎠 Carousel of Dreams": { name: "Looping Nightmare", desc: "It never ends." },
            "⭐ Shooting Star": { name: "Burning Satellite", desc: "Falling down." },
            "🎪 Circus Maximus": { name: "The Slaughterhouse", desc: "Enter the ring." }
        };
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
        const { currentTheme, mouse, shake, scareTimer, scareText, shopOpen, gameState, activeHighlightTarget } = input;

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

        // CrazyFakes Layer
        if (entities.fakeUI) entities.fakeUI.draw(this.ctx);

        // Game Center Vignette
        if (!this.vignetteGrad || this.vignetteGradTheme !== currentTheme.id) {
            // Center in Game Area, matching Main Button
            const gameW = this.w * CFG.game.gameAreaWidthRatio;
            const cx = gameW / 2;
            const cy = this.h / 2;
            const grad = this.ctx.createRadialGradient(cx, cy, 100, cx, cy, 500);
            grad.addColorStop(0, currentTheme.colors.bg);
            grad.addColorStop(1, 'rgba(0,0,0,0)');
            this.vignetteGrad = grad;
            this.vignetteGradTheme = currentTheme.id;
        }
        this.ctx.fillStyle = this.vignetteGrad;
        this.ctx.fillRect(0, 0, this.w, this.h);

        this.drawGameUI(state, currentTheme, entities.upgrades, mouse, shopOpen, activeHighlightTarget);

        // Entities
        if (entities.debris) entities.debris.forEach(d => d.draw(this.ctx));
        if (entities.particles) entities.particles.forEach(p => p.draw(this.ctx));

        // Draw Collection Drops (Desktop level)
        if (uiManager && uiManager.game && uiManager.game.collectionSystem) {
            uiManager.game.collectionSystem.draw(this.ctx);
        }

        // Draw Popups (Legacy or specific EntityManager popups)
        if (entities.popups) {
            entities.popups.forEach(p => p.draw(this.ctx));
        }

        // Draw Enemies (Captchas, Hunters, etc.)
        if (entities.enemies) {
            entities.enemies.forEach(e => e.draw(this.ctx));
        }

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

        // --- HUD ICONS (Sidebar Header) ---
        // Layout: 4 icons distributed horizontally in the sidebar top area
        // Sidebar X starts at w * 0.66
        const sx = this.w * CFG.game.shop.startXRatio;
        const sw = this.w - sx;
        const iconY = this.h * 0.05; // Higher up to avoid overlap

        // Distribute 4 icons: Mail, Reviews, Achievements, Archive
        // Centers: 20%, 40%, 60%, 80% of Sidebar Width
        const iconStep = sw / 4;
        const halfStep = iconStep / 2;

        const mailX = sx + halfStep;
        const chatX = sx + halfStep + iconStep;
        const achX = sx + halfStep + iconStep * 2;
        const arcX = sx + halfStep + iconStep * 3;

        // Draw HUD Elements (Mail Icon)
        this.drawHUD(mailX, iconY, uiManager);

        // Draw Windows & UI Overlay (Delegated to UIManager)
        uiManager.draw(this.ctx);

        // Feedback / Reviews Button
        this.drawFeedbackIcon(chatX, iconY, '#6d2af7', '💬', uiManager.reviewsTab.hasNew);
        // Achievements Button
        this.drawFeedbackIcon(achX, iconY, '#FFD700', '🏆', uiManager.game.achievementSystem.hasNew);
        // Archive Button
        this.drawFeedbackIcon(arcX, iconY, '#ebb434', '📁', uiManager.game.loreSystem.hasNew);

        if (entities.fakeCursor) entities.fakeCursor.draw(this.ctx);



        // META: BIOS_PASSWORD (Safe Mode Visual)
        if (input.metaUpgrades['safe_mode']) {
            // Anchor to left of Sidebar
            // Panel Width 90 + Padding 10 = 100 offset
            const px = (this.w * CFG.game.shop.startXRatio) - 100;
            const py = 20;

            // DEBUG PANEL
            const panelW = 90;
            const panelH = 100; // Increased for 3rd button

            // Panel BG
            this.ctx.fillStyle = 'rgba(0, 50, 0, 0.8)';
            this.ctx.strokeStyle = '#0f0';
            this.ctx.lineWidth = 1;
            this.ctx.fillRect(px, py, panelW, panelH);
            this.ctx.strokeRect(px, py, panelW, panelH);

            // Buttons
            const btnW = 70;
            const btnH = 25;

            // -10% COR (Top)
            const b1x = px + 10;
            const b1y = py + 8;

            this.ctx.fillStyle = '#000';
            this.ctx.fillRect(b1x, b1y, btnW, btnH);
            this.ctx.strokeStyle = '#0f0';
            this.ctx.strokeRect(b1x, b1y, btnW, btnH);
            this.ctx.fillStyle = '#0f0';
            this.ctx.textAlign = 'center';
            this.ctx.font = "10px monospace";
            this.ctx.fillText("-10% COR", b1x + btnW / 2, b1y + 16);

            // +10% COR (Middle)
            const b2y = b1y + btnH + 5;

            this.ctx.fillStyle = '#000';
            this.ctx.fillRect(b1x, b2y, btnW, btnH);
            this.ctx.strokeStyle = '#0f0';
            this.ctx.strokeRect(b1x, b2y, btnW, btnH);
            this.ctx.fillStyle = '#0f0';
            this.ctx.fillText("+10% COR", b1x + btnW / 2, b2y + 16);

            // POST/RESUME (Bottom)
            const b3y = b2y + btnH + 5;
            const isPaused = state.corruptionPaused; // Access logic from state

            this.ctx.fillStyle = isPaused ? '#300' : '#000'; // Dim red if paused
            this.ctx.fillRect(b1x, b3y, btnW, btnH);
            this.ctx.strokeStyle = isPaused ? '#f00' : '#0f0';
            this.ctx.strokeRect(b1x, b3y, btnW, btnH);
            this.ctx.fillStyle = isPaused ? '#f00' : '#0f0';
            this.ctx.fillText(isPaused ? "RESUME" : "PAUSE COR", b1x + btnW / 2, b3y + 16);

            this.ctx.textAlign = "left"; // Reset
        }

        this.drawCursor(state, currentTheme, mouse);

        // SUBLIMINAL GLITCHES
        if (state.corruption > 40) {

            // Check if we should trigger a new flash
            if (!this.subliminalActive) {
                if (Math.random() < 0.005) { // 0.5% chance per frame
                    this.subliminalActive = true;
                    this.subliminalTimer = 6; // Lasts 6 frames (approx 100ms at 60fps)

                    const rand = Math.random();
                    // Distribution: 10% Image, 5% Text, 5% Invert
                    if (rand < 0.1) {
                        this.subliminalType = 'image';
                        this.subliminalContent = UTILS.randArr(this.SubliminalImages);
                    } else if (rand < 0.05) {
                        this.subliminalType = 'text';
                        this.subliminalContent = UTILS.randArr(this.SubliminalMessages);
                    } else {
                        this.subliminalType = 'invert';
                    }
                }
            }

            // Draw Active Flash
            if (this.subliminalActive) {
                this.ctx.save();
                if (this.subliminalType === 'image') {
                    const img = assetLoader.getImage(this.subliminalContent);
                    if (img && img.complete) {
                        this.ctx.drawImage(img, 0, 0, this.w, this.h);
                    }
                } else if (this.subliminalType === 'text') {
                    this.ctx.fillStyle = Math.random() < 0.5 ? '#f00' : '#fff'; // Flicker color still
                    this.ctx.font = "bold 100px Arial";
                    this.ctx.textAlign = 'center';
                    this.ctx.textBaseline = 'middle';
                    this.ctx.fillText(this.subliminalContent, this.w / 2, this.h / 2);
                } else if (this.subliminalType === 'invert') {
                    this.ctx.globalCompositeOperation = 'difference';
                    this.ctx.fillStyle = '#fff';
                    this.ctx.fillRect(0, 0, this.w, this.h);
                }
                this.ctx.restore();

                this.subliminalTimer--;
                if (this.subliminalTimer <= 0) {
                    this.subliminalActive = false;
                }
            }
        }

        this.ctx.restore();
    }

    drawFeedbackIcon(x, y, color, emoji, animate = false) {
        // Stylish modern icon
        this.ctx.save();
        this.ctx.translate(x, y); // x,y passed from draw() calls

        // Bouncing animation
        if (animate) {
            const bounce = Math.sin(Date.now() / 300) * 3;
            this.ctx.translate(0, bounce);
        }

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

        // Notification Badge (!)
        if (animate) {
            this.ctx.fillStyle = '#FFD700';
            this.ctx.beginPath();
            this.ctx.arc(15, -10, 10, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.fillStyle = '#000'; // Black text
            this.ctx.font = 'bold 12px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText("!", 15, -9);
        }

        this.ctx.restore();
    }

    drawHUD(mx, my, uiManager) {
        this.ctx.save();
        this.ctx.translate(mx, my);

        // Bouncing animation (Sync with others) only if unread
        if (uiManager.mail && uiManager.mail.hasUnread) {
            const bounce = Math.sin(Date.now() / 300) * 3;
            this.ctx.translate(0, bounce);
        }

        // Circle Background (Style match)
        const color = '#ff4757'; // Red for Mail
        this.ctx.shadowColor = color;
        this.ctx.shadowBlur = 15;
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 25, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.shadowBlur = 0;

        // Envelope Icon (Centered at 0,0)
        // Previous was centered at mx, my. Now we are translated.
        // Bounds: -15 to +15 x, -10 to +10 y

        this.ctx.fillStyle = '#fff';
        this.ctx.fillRect(-15, -10, 30, 20); // Envelope body

        // Flap
        this.ctx.strokeStyle = '#e6e6e6'; // Slightly darker for visibility on white? Or keep outline.
        // Actually envelope is white. Background is Red. Contrast is good.
        // Let's add slight detail lines
        this.ctx.strokeStyle = '#ccc';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(-15, -10);
        this.ctx.lineTo(0, 5);
        this.ctx.lineTo(15, -10);
        this.ctx.stroke();

        // Notification Badge
        if (uiManager.mail && uiManager.mail.hasUnread) {
            this.ctx.fillStyle = '#ffaa00'; // Orange Warning on Red? Or White with Red text? 
            // Let's do distinct yellow badge
            this.ctx.fillStyle = '#FFD700';
            this.ctx.beginPath();
            this.ctx.arc(15, -10, 10, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.fillStyle = '#000'; // Black text
            this.ctx.font = 'bold 12px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle'; // Center vertical
            this.ctx.fillText("!", 15, -9);
        }

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

    drawGameUI(state, theme, upgrades, mouse, shopOpen, activeHighlightTarget) {
        // const cx = this.w / 2; // Removed (Redeclared below)
        const cy = this.h / 2;
        const colors = theme.colors;

        // --- LAYOUT AREAS ---
        const gameW = this.w * CFG.game.gameAreaWidthRatio;
        const sideW = this.w - gameW;

        // Game Area Center
        const cx = gameW / 2;

        // --- SIDEBAR BACKGROUND ---
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'; // Subtle darken
        this.ctx.fillRect(gameW, 0, sideW, this.h);

        // --- POSITIONING CONSTANTS (RESPONSIVE) ---
        const btnX = cx; // Center of Game Area
        const btnY = this.h * 0.5;  // Center Height

        // --- TUTORIAL HIGHLIGHT: MAIN BUTTON ---
        if (activeHighlightTarget === 'MAIN_BUTTON') {
            this.ctx.save();
            this.ctx.strokeStyle = '#0f0';
            this.ctx.lineWidth = 4;
            // Pulsing radius
            const pulse = Math.sin(Date.now() / 200) * 10;
            this.ctx.beginPath();
            this.ctx.arc(btnX, btnY, this.h * CFG.game.mainButtonRatio + 20 + pulse, 0, Math.PI * 2);
            this.ctx.stroke();

            // "CLICK ME" text or arrow?
            // Let's rely on the pulse for now.
            this.ctx.restore();
        }

        // Dynamic Radius based on screen size (min of w,h)
        const btnRadius = Math.min(gameW, this.h) * CFG.game.mainButtonRatio;

        // NULL VOID MECHANIC: Main Button Invisibility
        let btnAlpha = 1;
        if (theme.id === 'null_void') {
            const dist = Math.hypot(mouse.x - btnX, mouse.y - btnY);
            if (dist < btnRadius) btnAlpha = 1; else btnAlpha = 0;
        }

        this.ctx.globalAlpha = btnAlpha;

        // Main Button circle
        this.ctx.beginPath();
        this.ctx.arc(btnX, btnY, btnRadius, 0, Math.PI * 2);

        // Check for Image
        let img = null;
        if (theme.button.image) {
            img = assetLoader.getImage(theme.button.image);
        }

        if (img && img.complete && img.naturalWidth > 0) {
            // Draw full image without clipping
            this.ctx.drawImage(img, btnX - btnRadius, btnY - btnRadius, btnRadius * 2, btnRadius * 2);
        } else {
            // Gradient Fallback
            let grad = this.mainButtonGrad;
            // Ideally invalidate gradient if size changes, but for now just recreate/use
            // Simpler: Just make new gradient every frame is expensive? No.
            // But we cache.
            // If radius changes, gradient should be rebuilt?
            // "this.mainButtonGrad" cache might be stale if window resizes.
            // "setSize" invalidates it. So we are good.
            if (!grad) {
                grad = this.ctx.createLinearGradient(btnX - btnRadius, btnY - btnRadius, btnX + btnRadius, btnY + btnRadius);
                theme.button.gradient.forEach((c, i) => grad.addColorStop(i / (theme.button.gradient.length - 1), c));
                this.mainButtonGrad = grad;
            }

            this.ctx.fillStyle = grad;
            this.ctx.fill();
            this.ctx.lineWidth = Math.max(2, btnRadius * 0.05); // Dynamic stroke
            this.ctx.strokeStyle = theme.id === 'null_void' ? '#000' : '#fff'; // Black outline for Null Void
            this.ctx.stroke();
        }

        this.ctx.fillStyle = theme.id === 'null_void' ? '#000' : '#fff';
        this.ctx.textAlign = 'center';

        // Dynamic Font
        const btnFontSize = Math.floor(btnRadius * 0.3); // 30% of radius
        this.ctx.font = `bold ${btnFontSize}px Arial`;

        // Hide Text/Emoji if we have an image
        if (!img || !img.complete) {
            // UI GASLIGHTING: Main Button
            let btnText = theme.button.text;
            if (state.corruption > 50) {
                btnText = this.getGlitchText(btnText, state.corruption);
            }
            this.ctx.fillText(btnText, btnX, btnY - btnRadius * 0.3);

            const emojiSize = Math.floor(btnRadius * 0.6);
            this.ctx.font = `${emojiSize}px Arial`;
            this.ctx.fillText(theme.button.emoji, btnX, btnY + btnRadius * 0.5);
        }

        this.ctx.globalAlpha = 1; // Reset

        // Score (Top Center)
        const scoreText = UTILS.fmt(state.score);
        const rateText = `${UTILS.fmt(state.autoRate)} / sec`;

        this.ctx.font = CFG.fonts.xl;
        const scoreMeasure = this.ctx.measureText(scoreText);
        this.ctx.font = CFG.fonts.m;
        const rateMeasure = this.ctx.measureText(rateText);

        const maxWidth = Math.max(scoreMeasure.width, rateMeasure.width);
        const bgPadding = 20;
        const bgW = maxWidth + bgPadding * 2;
        const bgH = this.h * 0.15; // Approximate height coverage
        const bgX = cx - bgW / 2;
        const bgY = this.h * 0.02; // Start a bit from top

        // Draw Background
        this.ctx.save();
        this.ctx.fillStyle = colors.ui;
        this.ctx.shadowColor = colors.accent;
        this.ctx.shadowBlur = 15;
        this.ctx.fillRect(bgX, bgY, bgW, bgH);
        this.ctx.shadowBlur = 0;
        this.ctx.restore();

        this.ctx.strokeStyle = colors.uiBorder;
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(bgX, bgY, bgW, bgH);

        this.ctx.fillStyle = colors.text;
        this.ctx.font = CFG.fonts.xl;
        this.ctx.fillText(scoreText, cx, this.h * 0.1);

        this.ctx.font = CFG.fonts.m;
        this.ctx.fillText(rateText, cx, this.h * 0.14);

        // Progress Bar (Bottom Center of Game Area)
        const barW = gameW * 0.8; // 80% Width of Game Area
        const barH = Math.max(10, this.h * 0.03); // 3% Height
        const bx = cx - barW / 2;
        const by = this.h * 0.9;

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

        // OVERHEAT GAUGE (Server Farm)
        if (theme.mechanics && theme.mechanics.overheat) {
            const hbx = bx;
            const hby = by - barH * 1.5; // Above corruption bar
            const hbW = barW;
            const hbH = barH * 0.5;

            // BG
            this.ctx.fillStyle = '#220000';
            this.ctx.fillRect(hbx, hby, hbW, hbH);

            // Bar
            const tPct = state.temperature;
            // Color from Green to Red
            const r = Math.floor(255 * (tPct / 100));
            const g = Math.floor(255 * (1 - tPct / 100));
            this.ctx.fillStyle = `rgb(${r}, ${g}, 0)`;
            if (state.throttled) this.ctx.fillStyle = '#f00'; // Flash red if throttled

            this.ctx.fillRect(hbx, hby, hbW * (tPct / 100), hbH);

            // Border
            this.ctx.strokeStyle = '#ff0000';
            this.ctx.strokeRect(hbx, hby, hbW, hbH);

            // Text
            this.ctx.fillStyle = '#ff0000';
            this.ctx.font = '10px monospace';
            this.ctx.fillText(state.throttled ? "THROTTLED" : `TEMP: ${Math.floor(state.temperature)}°C`, cx, hby - 5);
        }

        // Upgrades Shop (Right Side - Responsive)
        const shopStartX = this.w * CFG.game.shop.startXRatio;
        const shopStartY = this.h * CFG.game.shop.startYRatio;

        const cardW = this.w * CFG.game.shop.cardWidthRatio;
        const cardH = this.h * CFG.game.shop.cardHeightRatio;

        const colStep = this.w * CFG.game.shop.colSpacingRatio;
        const rowStep = this.h * CFG.game.shop.rowSpacingRatio;

        if (upgrades && shopOpen) {
            upgrades.forEach((u, i) => {
                const ux = shopStartX;
                const uy = shopStartY + i * rowStep;

                // NULL VOID MECHANIC: Invisible UI
                let alpha = 1;
                if (theme.id === 'null_void') {
                    const mx = mouse.x;
                    const my = mouse.y;
                    if (mx >= ux && mx <= ux + cardW && my >= uy && my <= uy + cardH) {
                        alpha = 1;
                    } else {
                        alpha = 0; // Completely invisible
                    }
                }

                this.ctx.globalAlpha = alpha;

                // BG
                this.ctx.fillStyle = state.score >= u.cost ? colors.ui : (theme.id === 'null_void' ? '#fff' : '#333');
                this.ctx.fillRect(ux, uy, cardW, cardH);

                // TUTORIAL HIGHLIGHT
                let borderCol = colors.uiBorder;
                let borderW = 1;

                if (activeHighlightTarget === 'UPGRADE_' + u.id) {
                    const pulse = (Math.sin(Date.now() / 200) + 1) * 0.5; // 0 to 1
                    // Interpolate white to accent
                    borderCol = `rgba(0, 255, 0, ${0.5 + pulse * 0.5})`; // green pulse
                    borderW = 3;
                }

                // Border
                this.ctx.strokeStyle = borderCol;
                this.ctx.lineWidth = borderW;
                this.ctx.strokeRect(ux, uy, cardW, cardH);

                // UI Gaslighting Logic
                const uInfo = this.getCorruptedUpgradeInfo(u, state.corruption);

                // Icon (Left)
                const iconSize = cardH * 0.6;
                this.ctx.font = `${Math.floor(iconSize)}px Arial`;
                this.ctx.textAlign = 'center';
                this.ctx.fillStyle = '#fff';
                let icon = u.type === 'auto' ? '⚙️' : '👆';
                if (u.id.includes('cursor')) icon = '👆';
                if (u.id.includes('auto')) icon = '⚡';
                this.ctx.fillText(icon, ux + cardH * 0.5, uy + cardH * 0.7);

                // Name (Right)
                this.ctx.fillStyle = colors.text;
                this.ctx.textAlign = 'left';
                const fontSize = Math.max(12, Math.floor(cardH * 0.18));
                this.ctx.font = `bold ${fontSize}px Arial`;
                const textX = ux + cardH;

                this.ctx.fillText(uInfo.name, textX, uy + cardH * 0.3);

                // Digital Decay Redaction
                if (theme.id === 'digital_decay' && (uInfo.name.includes('[REDACTED]') || Math.random() < 0.01)) {
                    const w = this.ctx.measureText(uInfo.name).width;
                    this.ctx.fillStyle = '#000';
                    this.ctx.fillRect(textX, uy + cardH * 0.3 - fontSize * 0.8, w, fontSize);
                }

                // Rate Text
                this.ctx.fillStyle = '#ccc';
                this.ctx.font = `${Math.floor(fontSize * 0.8)}px monospace`;
                let rateText = "";
                if (u.type === 'auto') rateText = `+${UTILS.fmt(u.val)}/sec`;
                else if (u.type === 'click') rateText = `+${UTILS.fmt(u.val)} Click`;
                this.ctx.fillText(rateText, textX, uy + cardH * 0.55);

                // Cost
                const canBuy = state.score >= u.cost;
                this.ctx.fillStyle = canBuy ? colors.accent : '#888';
                this.ctx.font = `bold ${Math.floor(fontSize * 0.9)}px monospace`;
                this.ctx.fillText(UTILS.fmt(u.cost), textX, uy + cardH * 0.85);

                // Count
                this.ctx.fillStyle = theme.id === 'null_void' ? '#000' : '#fff';
                this.ctx.textAlign = 'right';
                this.ctx.font = `bold ${Math.floor(fontSize * 1.2)}px Arial`;
                this.ctx.fillText(u.count, ux + cardW - 10, uy + cardH * 0.85);

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
        this.ctx.fillText("ARROWS: Move   CLICK NAME: Desc   CLICK BUTTON: Buy   F10: Save & Exit", this.w / 2, this.h - 10);

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
        let currentY = startY - input.biosState.scrollOffset;

        // CLIPPING
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.rect(22, 52, this.w - 44, this.h - 104);
        this.ctx.clip();

        metaList.forEach((u, i) => {
            const owned = metaUpgrades[u.id] || 0;
            const isExpanded = input.biosState.openDescriptions.has(u.id);
            const itemHeight = isExpanded ? 60 : 30;

            // BACKGROUND HIGHLIGHT
            // Helper for mouse hover check over entire ROW
            if (input.mouse.y >= currentY && input.mouse.y < currentY + itemHeight && input.mouse.x < 380) {
                this.ctx.fillStyle = '#fff';
                this.ctx.fillRect(38, currentY, 340, itemHeight);
                this.ctx.fillStyle = '#0000aa'; // Text Color inverted
            } else {
                this.ctx.fillStyle = '#0000aa'; // Back to blue? No, text matches bg?
                // Default text is white. selection bg is white, text is blue.
                this.ctx.fillStyle = '#fff';
            }

            // NAME Display
            let label = u.name;
            if (u.type === 'feature') {
                label += owned ? " [ENABLED]" : " [DISABLED]";
            } else {
                label += ` [Lv.${owned}]`;
            }
            this.ctx.fillText(label, 40, currentY + 20);

            // DESCRIPTION (If expanded)
            if (isExpanded) {
                this.ctx.font = "14px 'Courier New', monospace";
                this.ctx.fillText(u.desc, 50, currentY + 45);
                this.ctx.font = "16px 'Courier New', monospace"; // Reset
            }

            // BUY BUTTON (Right Side)
            // Handle Cost Scaling
            let cost = u.baseCost;
            if (u.costScale) {
                cost = Math.floor(u.baseCost * Math.pow(u.costScale, owned));
            }

            // Button Rect
            const btnX = 400;
            const btnW = 200;
            const btnH = 26;
            const btnY = currentY + (isExpanded ? 15 : 0); // Center relative to row or sticking to top?
            // Let's stick it to top aligned with name

            const isHoverBtn = input.mouse.x >= btnX && input.mouse.x <= btnX + btnW && input.mouse.y >= currentY && input.mouse.y <= currentY + btnH;
            const canAfford = input.glitchData >= cost;

            this.ctx.fillStyle = isHoverBtn ? (canAfford ? '#00ff00' : '#ff0000') : '#ccc';
            this.ctx.fillRect(btnX, currentY, btnW, btnH);

            // Button Border
            this.ctx.strokeStyle = '#000';
            this.ctx.lineWidth = 1;
            this.ctx.strokeRect(btnX, currentY, btnW, btnH);

            // Cost Text
            this.ctx.fillStyle = '#000';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(`BUY: ${cost} MB`, btnX + btnW / 2, currentY + 18);

            // Reset for next item
            this.ctx.textAlign = 'left';
            this.ctx.fillStyle = '#fff';

            currentY += itemHeight;
        });

        // "BOOT SYSTEM" Option
        currentY += 30; // Margin
        const bootY = currentY;

        let bootHover = (input.mouse.y >= bootY && input.mouse.y < bootY + 30);
        if (bootHover) {
            this.ctx.fillStyle = '#fff';
            this.ctx.fillRect(38, bootY, this.w - 78, 30);
            this.ctx.fillStyle = '#0000aa';
        } else {
            this.ctx.fillStyle = '#0f0';
        }
        this.ctx.fillText("> BOOT SYSTEM (START NEW RUN)", 40, bootY + 20);

        // Theme Selector (if unlocked)
        if (metaUpgrades['start_theme']) {
            currentY += 40;
            const themeY = currentY;

            let themeHover = (input.mouse.y >= themeY && input.mouse.y < themeY + 30);
            if (themeHover) {
                this.ctx.fillStyle = '#fff';
                this.ctx.fillRect(38, themeY, this.w - 78, 30);
                this.ctx.fillStyle = '#0000aa';
            } else {
                this.ctx.fillStyle = '#0ff';
            }
            this.ctx.fillText(`STARTING THEME: [${input.currentTheme.id.toUpperCase()}]`, 40, themeY + 20);
        }

        // Calculate Max Scroll dynamically
        const contentBottomVirtual = currentY + 30 + input.biosState.scrollOffset;
        const viewH = this.h - 104; // Height of view area
        const viewBottom = 52 + viewH;
        // Total height needed = contentBottomVirtual - 120 (start) + padding?
        // Actually simpler: 
        // We want the last element (at contentBottomVirtual) to be visible at viewBottom.
        // maxScroll = contentBottomVirtual - viewBottom + 20 (padding)
        input.biosState.maxScroll = Math.max(0, contentBottomVirtual - viewBottom + 20);

        this.ctx.restore(); // End Clipping

        // Scrollbar
        if (input.biosState.maxScroll > 0) {
            const sbX = this.w - 30;
            const sbY = 52;
            const sbH = this.h - 104;

            this.ctx.fillStyle = '#0000aa';
            this.ctx.fillRect(sbX, sbY, 10, sbH);
            this.ctx.strokeStyle = '#fff';
            this.ctx.strokeRect(sbX, sbY, 10, sbH);

            const scrollPct = input.biosState.scrollOffset / input.biosState.maxScroll;
            const handleH = Math.max(20, sbH * (sbH / (sbH + input.biosState.maxScroll)));
            const handleY = sbY + (sbH - handleH) * scrollPct;

            this.ctx.fillStyle = '#fff';
            this.ctx.fillRect(sbX + 2, handleY, 6, handleH);
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

    /**
     * Helper to get glitch text based on corruption
     */
    getGlitchText(original, corruption) {
        // Chance increases with corruption
        // At 50 corruption: 0% chance (handled by caller check > 50)
        // At 100 corruption: 5% chance per frame (flicker)
        const chance = (corruption - 50) / 1000;

        if (Math.random() < chance) {
            return UTILS.randArr(this.CREEPY_TEXTS);
        }
        return original;
    }

    /**
     * Helper to get corrupted upgrade info based on corruption level
     * Returns { name, desc }
     */
    getCorruptedUpgradeInfo(originalUpgrade, corruption) {
        if (corruption <= 60) return originalUpgrade;

        // Chance to glitch frames
        // 5% chance per frame to show the "truth" if corruption > 60
        // Scale chance with corruption: 60 -> 1%, 100 -> 10%
        const chance = ((corruption - 60) / 40) * 0.1;

        if (Math.random() < chance) {
            const mapped = this.GASLIGHT_MAP[originalUpgrade.name];
            if (mapped) {
                return mapped;
            }
        }

        return originalUpgrade;
    }


}

