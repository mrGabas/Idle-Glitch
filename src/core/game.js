/**
 * MAIN GAME ENGINE
 * @module core/game
 */

import { CFG, UTILS } from './config.js';
import { THEMES } from '../data/themes.js';
import { SoundEngine } from './audio.js';
import { ChatSystem } from '../ui/chat.js';
import { CrazyFaces } from '../ui/ui.js';
import { Particle, Debris } from '../entities/particles.js';
import { Popup, NotepadWindow } from '../ui/windows.js';
import { GlitchHunter, CursedCaptcha } from '../entities/enemies.js';
import { LoreFile } from '../entities/items.js';

/**
 * @typedef {Object} GameState
 * @property {number} score - Current currency amount
 * @property {number} clickPower - Currency per click
 * @property {number} autoRate - Currency per second
 * @property {number} corruption - Global corruption level (0-100)
 * @property {number} multiplier - Prestige multiplier
 * @property {number} startTime - Game start timestamp
 * @property {number} glitchIntensity - Visual glitch intensity (0-1)
 * @property {boolean} crashed - Is BSOD active?
 * @property {boolean} rebooting - Is BIOS active?
 */

export class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        /** @type {CanvasRenderingContext2D} */
        this.ctx = this.canvas.getContext('2d');
        this.audio = new SoundEngine();

        this.hunter = null;

        this.currentTheme = THEMES.rainbow_paradise;

        // Save loading
        let savedMult = localStorage.getItem('glitch_prestige_mult');
        this.prestigeMult = savedMult ? parseFloat(savedMult) : 1.0;

        let savedReboots = localStorage.getItem('glitch_reboot_count');
        this.rebootCount = savedReboots ? parseInt(savedReboots) : 0;

        /** @type {GameState} */
        this.state = {
            score: 0,
            clickPower: 1,
            autoRate: 0,
            corruption: 0,
            multiplier: 1 * this.prestigeMult,
            startTime: Date.now(),
            glitchIntensity: 0,
            crashed: false,
            rebooting: false
        };

        this.loadThemeUpgrades();

        /** @type {Particle[]} */
        this.particles = [];
        this.chat = new ChatSystem();
        /** @type {Debris[]} */
        this.debris = [];
        /** @type {Popup[]} */
        this.popups = [];
        /** @type {CursedCaptcha[]} */
        this.captchas = [];
        /** @type {LoreFile[]} */
        this.loreFiles = [];
        this.activeNotepad = null;

        this.fakeUI = new CrazyFaces(this);

        this.mouse = { x: 0, y: 0, down: false };
        this.shake = 0;
        this.rebootTimer = 0;

        this.resize();
        this.lastTime = 0;

        // UI State
        this.gameState = 'MENU'; // MENU, PLAYING, PAUSED, SETTINGS
        this.previousState = 'MENU';
        this.returnScreenId = null;

        // Bind UI Elements
        this.bindUI();

        // Start Loop
        requestAnimationFrame((t) => this.loop(t));
    }

    loadThemeUpgrades() {
        this.upgrades = this.currentTheme.upgrades.map(u => ({ ...u, count: 0, cost: u.baseCost }));
    }

    bindUI() {
        // Buttons
        const startBtn = document.getElementById('btn-start');
        if (startBtn) startBtn.onclick = () => this.startGame();

        const settingsBtn = document.getElementById('btn-settings');
        if (settingsBtn) settingsBtn.onclick = () => this.openSettings('start-menu');

        const resumeBtn = document.getElementById('btn-resume');
        if (resumeBtn) resumeBtn.onclick = () => this.togglePause();

        const pauseSettingsBtn = document.getElementById('btn-pause-settings');
        if (pauseSettingsBtn) pauseSettingsBtn.onclick = () => this.openSettings('pause-menu');

        const backBtn = document.getElementById('btn-back');
        if (backBtn) backBtn.onclick = () => this.closeSettings();

        // Volume Sliders
        const sfx = document.getElementById('vol-sfx');
        const music = document.getElementById('vol-music');

        if (sfx) sfx.oninput = (e) => this.audio.setSFXVolume(e.target.value);
        if (music) music.oninput = (e) => this.audio.setMusicVolume(e.target.value);

        // Input Listeners
        window.addEventListener('resize', () => this.resize());
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (this.gameState === 'PLAYING') this.togglePause();
                else if (this.gameState === 'PAUSED') this.togglePause();
                else if (this.gameState === 'SETTINGS') this.closeSettings();
            }
        });

        this.canvas.addEventListener('mousedown', (e) => this.handleInput(e));
        window.addEventListener('mousemove', (e) => {
            if (this.gameState === 'PLAYING') {
                this.mouse.x = e.clientX;
                this.mouse.y = e.clientY;
            }
        });
    }

    startGame() {
        this.audio.resume();
        this.setScreen(null);
        this.gameState = 'PLAYING';
    }

    togglePause() {
        if (this.gameState === 'PLAYING') {
            this.gameState = 'PAUSED';
            this.setScreen('pause-menu');
        } else if (this.gameState === 'PAUSED') {
            this.gameState = 'PLAYING';
            this.setScreen(null);
        }
    }

    openSettings(fromIds) {
        this.previousState = this.gameState;
        this.gameState = 'SETTINGS';
        this.returnScreenId = fromIds;
        this.setScreen('settings-menu');
    }

    closeSettings() {
        if (this.previousState === 'MENU') {
            this.gameState = 'MENU';
            this.setScreen('start-menu');
        } else {
            this.gameState = 'PAUSED';
            this.setScreen('pause-menu');
        }
    }

    setScreen(id) {
        document.querySelectorAll('.menu-screen').forEach(el => el.style.display = 'none');
        if (id) {
            const el = document.getElementById(id);
            if (el) el.style.display = 'flex';
        }
    }

    resize() {
        this.w = this.canvas.width = window.innerWidth;
        this.h = this.canvas.height = window.innerHeight;
        if (this.fakeUI) this.fakeUI.init(this.w, this.h);
    }

    switchTheme(newThemeId) {
        this.currentTheme = THEMES[newThemeId];
        this.loadThemeUpgrades();
        this.state.corruption = 0;

        // Flash effect
        const flash = document.createElement('div');
        flash.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:#fff;z-index:999;transition:opacity 2s;';
        document.body.appendChild(flash);
        setTimeout(() => { flash.style.opacity = '0'; setTimeout(() => flash.remove(), 2000); }, 100);

        // Re-init fake UI for new theme colors
        this.fakeUI.init(this.w, this.h);
    }

    triggerCrash() {
        this.state.crashed = true;
        this.audio.play('error');
        // Reset save? Or just reboot sequence.
    }

    hardReset() {
        // Prestige Reset logic
        this.rebootCount++;
        this.prestigeMult += 0.5; // +50% bonus per run

        localStorage.setItem('glitch_prestige_mult', this.prestigeMult);
        localStorage.setItem('glitch_reboot_count', this.rebootCount);

        // Reload page to clear everything dirty
        location.reload();
    }

    // --- LOGIC ---

    handleInput(e) {
        if (this.gameState !== 'PLAYING') return;

        this.mouse.down = true;
        const mx = e.clientX;
        const my = e.clientY;

        // 0. Notepad (Top Priority)
        if (this.activeNotepad) {
            const close = this.activeNotepad.checkClick(mx, my);
            if (close) this.activeNotepad = null;
            return; // Block other inputs
        }

        // 0.1 Lore Files
        for (let i = 0; i < this.loreFiles.length; i++) {
            if (this.loreFiles[i].checkClick(mx, my)) {
                // Open lore
                this.activeNotepad = new NotepadWindow(this.w, this.h, "ACCESS GRANTED\n\nPROJECT: RAINBOW\nSTATUS: FAILED\n\nLOG: The AI has become self-aware. It demands more pixels.");
                this.loreFiles.splice(i, 1);
                this.audio.play('click');
                return;
            }
        }

        // 0.2 Captchas (Priority)
        for (let i = 0; i < this.captchas.length; i++) {
            const c = this.captchas[i];
            if (c.checkClick(mx, my)) {
                this.audio.play('buy'); // Success sound
                this.addScore(this.state.autoRate * 120 + 1000); // Bonus
                this.state.corruption = Math.max(0, this.state.corruption - 5); // Cleans corruption
                this.createParticles(mx, my, '#0f0');
                this.chat.addMessage('SYSTEM', 'VERIFICATION SUCCESSFUL');
                this.captchas.splice(i, 1);
                return;
            }
        }

        // 1. Popups
        let popupHit = false;
        for (let p of this.popups) {
            const res = p.checkClick(mx, my);
            if (res) {
                popupHit = true;
                if (res === 'bonus') {
                    this.addScore(this.state.autoRate * 20 + 500);
                    this.createParticles(mx, my, this.currentTheme.colors.accent);
                    this.audio.play('buy');
                } else {
                    this.audio.play('click');
                }
            }
        }
        if (popupHit) return;

        // 2. Shop Upgrades
        let shopHit = false;
        this.upgrades.forEach((u, i) => {
            const col = i % 2;
            const row = Math.floor(i / 2);
            const bx = this.w / 2 - 230 + col * 240;
            const by = this.h / 2 + 50 + row * 80;

            if (mx >= bx && mx <= bx + 220 && my >= by && my <= by + 70) {
                shopHit = true;
                if (this.state.score >= u.cost) {
                    this.buyUpgrade(u);
                } else {
                    this.audio.play('error');
                }
            }
        });
        if (shopHit) return;

        // 3. Main Button
        const cx = this.w / 2;
        const cy = this.h / 2 - 100;
        if (Math.hypot(mx - cx, my - cy) < 80) {
            this.clickMain();
            return;
        }

        // 4. DESTRUCTION OF FAKE UI
        let hitUI = false;
        this.fakeUI.elements.forEach(el => {
            if (el.active && mx > el.x && mx < el.x + el.w && my > el.y && my < el.y + el.h) {
                hitUI = true;
                // Damage UI logic moved to CrazyFaces class partly, but effect logic here
                const destroyed = this.fakeUI.damage(el);

                // Spawn debris
                for (let i = 0; i < 3; i++) {
                    this.debris.push(new Debris(mx, my, el.color));
                }

                if (destroyed) {
                    // Big debris explosion
                    for (let i = 0; i < 15; i++) {
                        this.debris.push(new Debris(el.x + el.w / 2, el.y + el.h / 2, el.color));
                    }
                    this.addScore(100 * this.state.multiplier);

                    if (this.currentTheme.id === 'rainbow_paradise') {
                        this.state.corruption += 1.5;
                    } else {
                        this.state.corruption += 0.5;
                    }
                }
            }
        });

        if (hitUI) {
            this.shake = 3;
            // Additional lock logic for early game
            if (this.currentTheme.id === 'rainbow_paradise' && this.state.corruption < 30) {
                this.audio.play('error');
                this.createFloatingText(mx, my, "LOCKED", "#888");
                return; // No corruption if locked?
            }

            this.audio.play('glitch');
            if (this.currentTheme.id === 'rainbow_paradise') {
                this.state.corruption += 0.2;
            }
        }

        if (this.hunter && this.hunter.active) {
            const hit = this.hunter.checkClick(mx, my);
            if (hit) {
                this.audio.play('click');
                this.createParticles(mx, my, '#f00');
                if (hit === true) {
                    this.addScore(1000 * this.state.multiplier);
                    this.hunter = null;
                    this.chat.addMessage('Admin_Alex', 'Фух... пронесло.');
                }
                return;
            }
        }
    }

    createFloatingText(x, y, text, color) {
        const p = new Particle(x, y, color);
        p.text = text;
        p.vy = -2;
        p.vx = 0;
        p.life = 1.0;
        p.draw = (ctx) => {
            ctx.globalAlpha = p.life;
            ctx.font = "bold 16px Arial";
            ctx.fillStyle = color;
            ctx.fillText(p.text, p.x, p.y);
            ctx.globalAlpha = 1;
        };
        this.particles.push(p);
    }

    clickMain() {
        this.addScore(this.state.clickPower);
        this.audio.play('click');
        this.createParticles(this.w / 2, this.h / 2 - 100, this.currentTheme.colors.accent);
        this.shake = 2;
        if (this.currentTheme.id === 'rainbow_paradise') this.state.corruption += 0.05;
    }

    buyUpgrade(u) {
        this.state.score -= u.cost;
        u.count++;
        u.cost = Math.floor(u.cost * 1.4);
        if (u.type === 'auto') this.state.autoRate += u.val;
        if (u.type === 'click') this.state.clickPower += u.val;
        this.audio.play('buy');
        this.state.corruption += 1.5;
    }

    addScore(val) {
        this.state.score += val * this.state.multiplier;
    }

    createParticles(x, y, color) {
        for (let i = 0; i < 8; i++) {
            this.particles.push(new Particle(x, y, color));
        }
    }

    createGlitchSlice() {
        if (Math.random() > 0.3) return;
        const h = Math.random() * 30 + 5;
        const y = Math.random() * this.h;
        try {
            this.ctx.globalCompositeOperation = 'difference';
            this.ctx.fillStyle = UTILS.randArr(['#f0f', '#0ff', '#ff0']);
            this.ctx.fillRect(0, y, this.w, h);
            this.ctx.globalCompositeOperation = 'source-over';
        } catch (e) { }
    }

    loop(t) {
        const dt = (t - this.lastTime) / 1000;
        this.lastTime = t;

        if (this.gameState !== 'PLAYING' && !this.state.crashed && !this.state.rebooting) {
            // Still draw even if paused, just don't update
            this.draw();
            requestAnimationFrame((t) => this.loop(t));
            return;
        }

        // Cap dt to avoid huge jumps on lag
        const safeDt = Math.min(dt, 0.1);

        this.update(safeDt);
        this.draw();

        requestAnimationFrame((t) => this.loop(t));
    }

    update(dt) {
        this.addScore(this.state.autoRate * dt);
        this.chat.update(dt, this.state.corruption);

        // Crash Logic
        if (this.state.crashed) {
            this.rebootTimer -= dt;
            if (this.rebootTimer <= 0) {
                this.state.crashed = false;
                this.state.rebooting = true;
                this.rebootTimer = 5.0; // 5s BIOS
            }
            return;
        }

        if (this.state.rebooting) {
            this.rebootTimer -= dt;
            if (this.rebootTimer <= 0) {
                this.hardReset();
            }
            return;
        }

        // Theme Transition
        if (this.currentTheme.id === 'rainbow_paradise') {
            this.state.glitchIntensity = Math.max(0, (this.state.corruption - 30) / 70);
            if (this.state.corruption >= 100) this.switchTheme('digital_decay');
        } else {
            // Phase 2
            this.state.glitchIntensity = 0.2 + (this.state.corruption / 100) * 0.8;
            if (this.state.corruption >= 100) {
                this.triggerCrash();
            }
        }

        // Entities
        this.particles.forEach((p, i) => {
            p.update();
            if (p.life <= 0) this.particles.splice(i, 1);
        });

        this.debris.forEach((d, i) => {
            const res = d.update(dt, this.h, this.mouse.x, this.mouse.y);
            if (res === 'collected') {
                this.addScore(10 * this.state.multiplier);
                this.audio.play('click');
            }
            if (d.life <= 0) this.debris.splice(i, 1);
        });

        this.popups.forEach((p, i) => {
            p.life -= dt;
            if (p.life <= 0) this.popups.splice(i, 1);
        });

        if (Math.random() < 0.001 + (this.state.glitchIntensity * 0.02)) {
            if (this.popups.length < 5) this.popups.push(new Popup(this.w, this.h));
        }

        if (this.shake > 0) this.shake *= 0.9;

        // Hunter Spawn
        if (!this.hunter && this.state.corruption > 40 && Math.random() < 0.001) {
            this.hunter = new GlitchHunter(this.w, this.h);
            this.chat.addMessage('SYSTEM', 'WARNING: VIRUS DETECTED');
            this.audio.play('error');
        }

        // Captchas
        this.captchas.forEach((c, i) => {
            const res = c.update(dt, this.mouse.x, this.mouse.y, this.w, this.h);
            if (res === 'timeout') {
                this.captchas.splice(i, 1);
                this.audio.play('error');
                this.state.score -= this.state.autoRate * 60; // Penalty
                if (this.state.score < 0) this.state.score = 0;
                this.shake = 5;
                this.chat.addMessage('SYSTEM', 'VERIFICATION FAILED: ACCESS DENIED');
                this.state.corruption += 5;
            }
        });

        if (this.state.corruption > 15 && Math.random() < 0.0005) {
            if (this.captchas.length < 1) {
                this.captchas.push(new CursedCaptcha(this.w, this.h));
                this.audio.play('error');
            }
        }

        // Lore Files
        this.loreFiles.forEach((f, i) => {
            f.life -= dt;
            if (f.life <= 0) this.loreFiles.splice(i, 1);
        });

        if (this.state.corruption > 10 && Math.random() < 0.0003 && !this.activeNotepad) {
            if (this.loreFiles.length < 2) this.loreFiles.push(new LoreFile(this.w, this.h));
        }

        // Hunter Update
        if (this.hunter && this.hunter.active) {
            const status = this.hunter.update(this.mouse.x, this.mouse.y, dt);
            if (status === 'damage') {
                this.state.score -= this.state.autoRate * dt * 2;
                if (this.state.score < 0) this.state.score = 0;
                this.shake = 5;
                this.ctx.fillStyle = 'rgba(255,0,0,0.1)';
                this.ctx.fillRect(0, 0, this.w, this.h);
            }
        }
    }

    draw() {
        if (this.state.crashed) {
            this.drawBSOD();
            return;
        }
        if (this.state.rebooting) {
            this.drawBIOS();
            return;
        }

        this.ctx.save();
        if (this.shake > 0.5) {
            this.ctx.translate((Math.random() - 0.5) * this.shake, (Math.random() - 0.5) * this.shake);
        }

        // BG
        this.ctx.fillStyle = this.currentTheme.colors.bg;
        this.ctx.fillRect(0, 0, this.w, this.h);

        // CrazyFaces Layer
        this.fakeUI.draw(this.ctx);

        // Game Center Vignette
        const cx = this.w / 2;
        const cy = this.h / 2;
        const grad = this.ctx.createRadialGradient(cx, cy, 100, cx, cy, 500);
        grad.addColorStop(0, this.currentTheme.colors.bg);
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        this.ctx.fillStyle = grad;
        this.ctx.fillRect(0, 0, this.w, this.h);

        this.drawGameUI();

        // Entites
        this.debris.forEach(d => d.draw(this.ctx));
        this.particles.forEach(p => p.draw(this.ctx));
        this.popups.forEach(p => p.draw(this.ctx));
        this.captchas.forEach(c => c.draw(this.ctx));
        this.loreFiles.forEach(f => f.draw(this.ctx));

        // PostFX
        if (this.state.glitchIntensity > 0.1) {
            if (Math.random() < this.state.glitchIntensity * 0.1) this.createGlitchSlice();
        }
        if (this.hunter) this.hunter.draw(this.ctx);

        this.chat.draw(this.ctx, this.h);
        if (this.activeNotepad) this.activeNotepad.draw(this.ctx);

        this.drawCursor();
        this.ctx.restore();
    }

    drawCursor() {
        // Simple crosshair or custom cursor
        // Browser handles it mostly, but for style:
        const mx = this.mouse.x;
        const my = this.mouse.y;
        this.ctx.strokeStyle = this.currentTheme.colors.accent;
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(mx - 10, my);
        this.ctx.lineTo(mx + 10, my);
        this.ctx.moveTo(mx, my - 10);
        this.ctx.lineTo(mx, my + 10);
        this.ctx.stroke();
    }

    drawGameUI() {
        const cx = this.w / 2;
        const cy = this.h / 2;
        const colors = this.currentTheme.colors;
        const theme = this.currentTheme;

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
        this.ctx.fillText(UTILS.fmt(this.state.score) + ' ' + theme.currency.symbol, cx, cy + 20);

        this.ctx.font = CFG.fonts.m;
        this.ctx.fillText(`${UTILS.fmt(this.state.autoRate)} / sec`, cx, cy + 50);

        // Progress Bar (Corruption/Happiness)
        const barW = 400;
        const barH = 20;
        const bx = cx - barW / 2;
        const by = this.h - 50; // Fixed: Always at bottom

        this.ctx.fillStyle = theme.progressBar.bgColor;
        this.ctx.fillRect(bx, by, barW, barH);

        let pct = this.state.corruption;
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
        this.upgrades.forEach((u, i) => {
            const col = i % 2;
            const row = Math.floor(i / 2);

            const ux = cx - 230 + col * 240;
            const uy = cy + 50 + row * 80;

            // BG
            this.ctx.fillStyle = this.state.score >= u.cost ? colors.ui : '#333';
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
            const canBuy = this.state.score >= u.cost;
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
        });
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

    drawBIOS() {
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
            if (this.rebootTimer < 5.0 - i * 0.5) { // Simple stagger
                this.ctx.fillText(l, 50, y); y += 24;
            }
        });
    }
}
