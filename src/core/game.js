/**
 * MAIN GAME ENGINE
 * @module core/game
 */

import { CFG, UTILS } from './config.js';
import { THEMES } from '../data/themes.js';
import { SoundEngine } from './audio.js';
import { events } from './events.js';
import { SaveSystem } from './SaveSystem.js';
import { Renderer } from '../systems/Renderer.js';
import { InputHandler } from '../systems/InputHandler.js';
import { ProgressionSystem } from '../systems/Progression.js';
import { ChatSystem } from '../ui/chat.js';
import { CrazyFaces } from '../ui/ui.js';
import { Particle, Debris } from '../entities/particles.js';
import { Popup, NotepadWindow, MailWindow } from '../ui/windows.js';
import { GlitchHunter, CursedCaptcha } from '../entities/enemies.js';
import { MailSystem } from '../systems/MailSystem.js';
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
        this.events = events;
        this.saveSystem = new SaveSystem();
        this.renderer = new Renderer('gameCanvas');
        this.audio = new SoundEngine(); // Keep for resume()

        this.currentTheme = THEMES.rainbow_paradise;

        // Save loading
        this.prestigeMult = this.saveSystem.loadNumber('prestige_mult', 1.0);
        this.rebootCount = this.saveSystem.loadNumber('reboot_count', 0);

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

        // UI & Systems
        this.chat = new ChatSystem();
        this.mail = new MailSystem(this);
        this.input = new InputHandler(this); // Initializes listeners
        this.progression = new ProgressionSystem(this);

        this.hunter = null;

        // Entities
        /** @type {Particle[]} */
        this.particles = [];
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
        this.mailWindow = new MailWindow(this.w || 800, this.h || 600, this.mail);

        // Visual State
        this.mouse = this.input.mouse; // Alias for renderer access
        this.shake = 0;
        this.rebootTimer = 0;
        this.scareTimer = 0;
        this.scareText = "";

        this.resize();
        this.lastTime = 0;

        // Game State
        this.gameState = 'MENU'; // MENU, PLAYING, PAUSED, SETTINGS
        this.previousState = 'MENU';
        this.returnScreenId = null;

        // Bind DOM UI
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

        // Note: Global input listeners (resize, keydown, mouse, visibility) 
        // are now handled by this.input (InputHandler)
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
        if (this.renderer) this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.w = window.innerWidth; // Keep local ref for logic
        this.h = window.innerHeight;
        if (this.fakeUI) this.fakeUI.init(this.w, this.h);
        if (this.mailWindow) {
            this.mailWindow.w = Math.min(500, this.w - 40);
            this.mailWindow.h = Math.min(400, this.h - 40);
            this.mailWindow.x = (this.w - this.mailWindow.w) / 2;
            this.mailWindow.y = (this.h - this.mailWindow.h) / 2;
        }
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
        this.events.emit('play_sound', 'error');
    }

    hardReset() {
        // Prestige Reset logic
        this.rebootCount++;
        this.prestigeMult += 0.5; // +50% bonus per run

        this.saveSystem.saveNumber('prestige_mult', this.prestigeMult);
        this.saveSystem.saveNumber('reboot_count', this.rebootCount);

        // Reload page to clear everything dirty
        location.reload();
    }

    triggerScareOverlay(text) {
        this.scareText = text;
        this.scareTimer = 1.5; // Displays for 1.5s
    }

    // --- GAME ACTIONS (Called by InputHandler) ---

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
        this.events.emit('play_sound', 'click');
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
        this.events.emit('play_sound', 'buy');
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

    // Main Loop
    loop(t) {
        const dt = (t - this.lastTime) / 1000;
        this.lastTime = t;

        if (this.gameState !== 'PLAYING' && !this.state.crashed && !this.state.rebooting) {
            // Still draw even if paused, just don't update
            this.draw();
            requestAnimationFrame((t) => this.loop(t));
            return;
        }

        const safeDt = Math.min(dt, 0.1);
        this.update(safeDt);
        this.draw();

        requestAnimationFrame((t) => this.loop(t));
    }

    update(dt) {
        // System Updates
        this.input.updateMouse(dt, this.state.corruption);
        this.progression.update(dt);
        this.chat.update(dt, this.state.corruption);
        this.mail.update(dt);

        this.addScore(this.state.autoRate * dt);

        // Entity Updates
        this.updateEntities(dt);

        if (this.shake > 0) this.shake *= 0.9;
        if (this.scareTimer > 0) this.scareTimer -= dt;

        // Spawners (Hunter, Lore etc - Could be moved to EntitySpawner system)
        this.handleSpawns();
    }

    updateEntities(dt) {
        // Entities
        this.particles.forEach((p, i) => {
            p.update();
            if (p.life <= 0) this.particles.splice(i, 1);
        });

        this.debris.forEach((d, i) => {
            const res = d.update(dt, this.h, this.input.mouse.x, this.input.mouse.y);
            if (res === 'collected') {
                this.addScore(10 * this.state.multiplier);
                this.events.emit('play_sound', 'click');
            }
            if (d.life <= 0) this.debris.splice(i, 1);
        });

        this.popups.forEach((p, i) => {
            p.life -= dt;
            if (p.life <= 0) this.popups.splice(i, 1);
        });

        // Captchas
        this.captchas.forEach((c, i) => {
            const res = c.update(dt, this.input.mouse.x, this.input.mouse.y, this.w, this.h);
            if (res === 'timeout') {
                this.captchas.splice(i, 1);
                this.events.emit('play_sound', 'error');
                this.state.score -= this.state.autoRate * 60; // Penalty
                if (this.state.score < 0) this.state.score = 0;
                this.shake = 5;
                this.chat.addMessage('SYSTEM', 'VERIFICATION FAILED: ACCESS DENIED');
                this.state.corruption += 5;
            }
        });

        this.loreFiles.forEach((f, i) => {
            f.life -= dt;
            if (f.life <= 0) this.loreFiles.splice(i, 1);
        });

        if (this.hunter && this.hunter.active) {
            const status = this.hunter.update(this.input.mouse.x, this.input.mouse.y, dt);
            if (status === 'damage') {
                this.state.score -= this.state.autoRate * dt * 2;
                if (this.state.score < 0) this.state.score = 0;
                this.shake = 5;
            }
        }
    }

    handleSpawns() {
        if (this.hunter && this.hunter.active) return; // Don't spawn if hunter active?

        // Hunter Spawn
        if (!this.hunter && this.state.corruption > 40 && Math.random() < 0.001) {
            this.hunter = new GlitchHunter(this.w, this.h);
            this.chat.addMessage('SYSTEM', 'WARNING: VIRUS DETECTED');
            this.events.emit('play_sound', 'error');
        }

        // Cursed Captcha
        if (this.state.corruption > 15 && Math.random() < 0.0005) {
            if (this.captchas.length < 1) {
                this.captchas.push(new CursedCaptcha(this.w, this.h));
                this.events.emit('play_sound', 'error');
            }
        }

        // Lore Files (Rare)
        if (this.state.corruption > 10 && Math.random() < 0.0003 && !this.activeNotepad) {
            if (this.loreFiles.length < 2) this.loreFiles.push(new LoreFile(this.w, this.h));
        }
    }

    draw() {
        this.renderer.draw(this.state, this, {
            fakeUI: this.fakeUI,
            upgrades: this.upgrades,
            debris: this.debris,
            particles: this.particles,
            popups: this.popups,
            captchas: this.captchas,
            loreFiles: this.loreFiles,
            hunter: this.hunter,
            chat: this.chat,
            activeNotepad: this.activeNotepad,
            mailWindow: this.mailWindow,
            mailSystem: this.mail
        });
    }
}
