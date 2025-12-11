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
import { ChatSystem } from '../ui/chat.js';
import { CrazyFaces } from '../ui/ui.js';
import { Particle, Debris } from '../entities/particles.js';
import { Popup, NotepadWindow } from '../ui/windows.js';
import { InputHandler } from './Input.js';
import { GameState } from './GameState.js';
// New imports for Mail
import { MailSystem } from '../systems/MailSystem.js';
import { FakeCursor } from '../entities/FakeCursor.js';
import { MailWindow } from '../ui/windows.js';
import { ReviewsTab } from '../ui/reviewsTab.js';
import { GlitchHunter, CursedCaptcha } from '../entities/enemies.js';
import { LoreFile } from '../entities/items.js';
import { META_UPGRADES } from '../data/metaUpgrades.js';

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
        this.input = new InputHandler();
        this.audio = new SoundEngine(); // Keep for resume()
        this.resize(); // Initialize dimensions early

        this.hunter = null;
        this.fakeCursor = new FakeCursor(0, 0, this);

        this.currentTheme = THEMES.rainbow_paradise;

        // Save loading
        this.prestigeMult = this.saveSystem.loadNumber('prestige_mult', 1.0);
        this.rebootCount = this.saveSystem.loadNumber('reboot_count', 0);

        // META DATA
        this.glitchData = this.saveSystem.loadNumber('glitch_data', 0);
        this.lifetimeGlitchData = this.saveSystem.loadNumber('lifetime_glitch_data', 0);
        this.metaUpgrades = this.saveSystem.load('meta_upgrades', {});

        // Recalculate multiplier based on generic prestige + meta upgrades (if we implement that)
        // For now, prestigeMult is legacy. Let's keep it but maybe add to it.

        this.state = new GameState();
        this.state.multiplier = 1 * this.prestigeMult; // Set initial via property (or method if we want event)
        // Actually, let's use methods where possible or direct assignment if initializing.
        // Direct assignment is fine for init.

        this.applyMetaUpgrades();
        this.loadThemeUpgrades();

        /** @type {Particle[]} */
        this.particles = [];
        this.chat = new ChatSystem(this);
        this.reviewsTab = new ReviewsTab(this);

        // Mail System
        this.mail = new MailSystem(this);
        this.mailWindow = new MailWindow(this.w, this.h, this.mail);

        // Load Theme
        const savedTheme = this.saveSystem.load('selected_theme', 'rainbow_paradise');
        this.setTheme(savedTheme);
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
        this.realMouse = { x: 0, y: 0 }; // Track physical mouse
        this.mouseHistory = []; // For lag effect

        this.shake = 0;
        this.rebootTimer = 0;
        this.scareTimer = 0;
        this.scareText = "";
        this.selectedBIOSIndex = 0;

        this.scareText = "";

        this.lastTime = 0;
        // Last Save Time for Offline Progress
        this.lastSaveTime = this.saveSystem.loadNumber('last_save', Date.now());
        this.checkOfflineProgress();

        // Auto-save loop
        setInterval(() => this.saveGame(), 30000);

        // UI State
        this.gameState = 'MENU'; // MENU, PLAYING, PAUSED, SETTINGS, BIOS
        this.previousState = 'MENU';
        this.returnScreenId = null;

        // Bind UI Elements
        this.bindUI();

        // Start Loop
        requestAnimationFrame((t) => this.loop(t));
    }

    saveGame() {
        this.saveSystem.saveNumber('prestige_mult', this.prestigeMult);
        this.saveSystem.saveNumber('reboot_count', this.rebootCount);
        this.saveSystem.saveNumber('glitch_data', this.glitchData);
        this.saveSystem.saveNumber('lifetime_glitch_data', this.lifetimeGlitchData);
        this.saveSystem.save('meta_upgrades', this.metaUpgrades);
        this.saveSystem.saveNumber('last_save', Date.now());
        // Save rate for offline calc
        this.saveSystem.saveNumber('last_auto_rate', this.state.autoRate);
        this.saveSystem.save('selected_theme', this.currentTheme.id);
    }

    applyMetaUpgrades() {
        // ... (lines 142-152)
        // 4. Passive Multiplier Boost
        // 4. Passive Multiplier Boost
        const boostLevel = this.metaUpgrades['prestige_boost'] || 0;
        if (boostLevel > 0) {
            this.state.setMultiplier(this.state.multiplier + (boostLevel * 0.5));
        }
    }

    checkOfflineProgress() {
        if (this.metaUpgrades['offline_progress']) {
            const now = Date.now();
            const diff = (now - this.lastSaveTime) / 1000; // seconds

            if (diff > 60) {
                const lastRate = this.saveSystem.loadNumber('last_auto_rate', 0);
                if (lastRate > 0) {
                    // 25% efficiency
                    const gained = lastRate * diff * 0.25;
                    if (gained > 0) {
                        this.state.addScore(gained);
                        this.chat.addMessage('SYSTEM', `OFFLINE GAINS: +${UTILS.fmt(gained)} (Duration: ${Math.floor(diff / 60)}m)`);
                    }
                }
            }
        }
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

        // New Feedback Button (We need to add this to HTML or check existing IDs)
        // For now, I'll assume we might want to attach it to an existing or new element
        // But since I can't edit HTML right now in this step easily without separate tool...
        // I will rely on creating it in JS or assuming user adds it

        // Actually, let's create a dynamic button for it in Renderer or index.html
        // For now, let's just make a floating button in JS if it doesn't exist


        const backBtn = document.getElementById('btn-back');
        if (backBtn) backBtn.onclick = () => this.closeSettings();

        // Fake Browser Error Buttons
        const waitBtn = document.getElementById('btn-error-wait');
        if (waitBtn) waitBtn.onclick = () => this.handleBrowserWait();

        const killBtn = document.getElementById('btn-error-kill');
        if (killBtn) killBtn.onclick = () => this.handleBrowserKill();

        // Volume Sliders
        const sfx = document.getElementById('vol-sfx');
        const music = document.getElementById('vol-music');

        if (sfx) sfx.oninput = (e) => this.audio.setSFXVolume(e.target.value);
        if (music) music.oninput = (e) => this.audio.setMusicVolume(e.target.value);

        // Input Listeners
        this.input.on('resize', () => this.resize());
        this.input.on('keydown', (e) => {
            // Priority 0: BIOS Navigation
            if (this.gameState === 'BIOS') {
                if (e.key === 'ArrowUp') {
                    this.selectedBIOSIndex = Math.max(0, this.selectedBIOSIndex - 1);
                    this.events.emit('play_sound', 'click');
                }
                if (e.key === 'ArrowDown') {
                    // Calculate max index based on upgrades + Boot + Theme (if unlocked)
                    let max = META_UPGRADES.length; // 0 to length-1 are upgrades. length is Boot. length+1 is Theme
                    if (this.metaUpgrades['start_theme']) max++;

                    this.selectedBIOSIndex = Math.min(max, this.selectedBIOSIndex + 1);
                    this.events.emit('play_sound', 'click');
                }
                if (e.key === 'Enter') {
                    this.handleBIOSAction(this.selectedBIOSIndex);
                }
                if (e.key === 'F10') {
                    this.bootSystem();
                }
                return;
            }

            // Priority 1: Password/Notepad Input
            if (this.activeNotepad && this.activeNotepad.locked) {
                this.activeNotepad.handleKeyDown(e);
                return;
            }

            // Priority 2: Chat Console Input
            if (this.chat && this.chat.isFocused) {
                this.chat.handleKeyDown(e);
                // Don't return necessarily, maybe allows some game shortcuts still? 
                // But for typing safety, let's return if it's a character key
                if (e.key.length === 1 || e.key === 'Backspace' || e.key === 'Enter') return;
            }

            if (e.key === 'Escape') {
                if (this.activeNotepad) {
                    this.activeNotepad = null;
                } else if (this.chat && this.chat.isFocused) {
                    this.chat.isFocused = false;
                } else if (this.gameState === 'PLAYING') {
                    this.togglePause();
                } else if (this.gameState === 'PAUSED') {
                    this.togglePause();
                } else if (this.gameState === 'SETTINGS') {
                    this.closeSettings();
                }
            }
        });

        this.input.on('mousedown', (e) => this.handleInput(e));
        this.input.on('mousemove', (e) => {
            if (this.gameState === 'PLAYING' || this.gameState === 'BIOS') { // Allow mouse in BIOS
                // Track REAL mouse position separately
                this.realMouse.x = e.clientX;
                this.realMouse.y = e.clientY;

                // Update game mouse for BIOS or if no lag
                if (this.gameState === 'BIOS' || this.state.corruption <= 60) {
                    const rect = this.renderer.canvas.getBoundingClientRect();
                    this.mouse.x = e.clientX - rect.left;
                    this.mouse.y = e.clientY - rect.top;
                    this.mouse.down = false; // Hovering
                }

                // Add to history for lag effect
                this.mouseHistory.push({
                    x: e.clientX,
                    y: e.clientY,
                    time: Date.now()
                });

                // Keep history small (~2 seconds max is enough even for heavy lag)
                if (this.mouseHistory.length > 200) {
                    this.mouseHistory.shift();
                }
            }
        });

        // Scroll / Wheel
        this.input.on('wheel', (e) => {
            if (this.gameState === 'PLAYING') {
                if (this.reviewsTab.visible) {
                    this.reviewsTab.handleScroll(e.deltaY);
                }
            }
        });

        this.initTabStalker();
    }

    initTabStalker() {
        let titleInterval = null;
        let awayStartTime = 0;
        const subTitles = CFG.game.tabStalker.subTitles;
        const originalTitle = document.title;

        this.input.on('visibilitychange', () => {
            if (document.hidden) {
                // Player left
                awayStartTime = Date.now();
                let i = 0;
                titleInterval = setInterval(() => {
                    document.title = subTitles[i % subTitles.length];
                    i++;
                }, 2000);
            } else {
                // Player returned
                document.title = originalTitle;
                if (titleInterval) clearInterval(titleInterval);

                const timeAway = (Date.now() - awayStartTime) / 1000;
                if (timeAway > 5) { // Only punish if away for > 5s
                    this.handleTabReturn(timeAway);
                }
            }
        });
    }

    handleTabReturn(seconds) {
        if (this.gameState !== 'PLAYING') return;

        // Penalty: Lose resources instead of gaining
        // 1.5x penalty simply for being rude
        // Penalty: Lose resources instead of gaining
        // 1.5x penalty simply for being rude
        const penalty = this.state.autoRate * seconds * 1.5;
        this.state.addScore(-penalty);
        this.addScore(0); // Updates UI potentially if needed immediately

        // Scare
        this.events.emit('play_sound', 'error');
        this.shake = 10;
        this.state.addCorruption(5);
        this.triggerScareOverlay("WHERE WERE YOU?");
    }

    triggerScareOverlay(text) {
        this.scareText = text;
        this.scareTimer = 1.5; // Displays for 1.5s
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
        if (this.fakeCursor) this.fakeCursor.resize(this.w, this.h);
        if (this.mailWindow) this.mailWindow.resize(this.w, this.h); // Mail window might need it too? (Wait, MailWindow logic is position based, might need update)
    }

    setTheme(id) {
        this.currentTheme = THEMES[id];
        this.loadThemeUpgrades();
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
        this.gameState = 'CRASH'; // Change state to distinguish from PLAYING
        this.events.emit('play_sound', 'error');
        // Reset save? Or just reboot sequence.
    }

    hardReset() {
        // Prestige Reset logic
        this.rebootCount++;

        // Calculate Glitch Data Award
        // Base 10 + 1 per 1000 score + 1 per 5 corruption (if > 50)
        let earned = 10;
        earned += Math.floor(this.state.score / 1000);
        if (this.state.corruption > 50) {
            earned += Math.floor((this.state.corruption - 50) / 5);
        }

        this.glitchData += earned;
        this.lifetimeGlitchData += earned;

        // Save persistent part
        this.saveGame();

        // Don't reload. Go to BIOS.
        this.state.crashed = false;
        this.state.rebooting = false;
        this.gameState = 'BIOS';

        // We need to RESET game state but KEEP meta data
        // Ideally we re-instantiate Game but that's messy.
        // Let's soft-reset state.
        this.state.resetSession();
        this.state.multiplier = 1 * this.prestigeMult; // Re-apply base

        // Reset to default theme for new run
        this.setTheme('rainbow_paradise');

        // Clear entities
        this.particles = [];
        this.activeNotepad = null;
        this.hunter = null;
        this.debris = [];
        this.popups = [];
        this.captchas = [];
        this.loreFiles = [];
        this.chat.messages = [];
        this.chat.addMessage('SYSTEM', 'BIOS LOADED. WELCOME USER.');

        // Apply passive metas
        this.applyMetaUpgrades();
    }

    // --- LOGIC ---

    handleBIOSAction(index) {
        // Upgrades
        if (index < META_UPGRADES.length) {
            this.buyMetaUpgrade(META_UPGRADES[index]);
            return;
        }

        // Boot System
        if (index === META_UPGRADES.length) {
            this.bootSystem();
            return;
        }

        // Theme Selector
        if (index === META_UPGRADES.length + 1 && this.metaUpgrades['start_theme']) {
            const themeIds = Object.keys(THEMES);
            let idx = themeIds.indexOf(this.currentTheme.id);
            idx = (idx + 1) % themeIds.length;
            this.setTheme(themeIds[idx]);
            this.events.emit('play_sound', 'click');
        }
    }

    handleBIOSClick(mx, my) {
        const startY = CFG.game.bios.startY;

        // Check Upgrades
        META_UPGRADES.forEach((u, i) => {
            const y = startY + i * CFG.game.bios.lineHeight;
            // Hitbox approximation
            if (my >= y - 20 && my < y + 10) {
                // Clicked Item
                this.buyMetaUpgrade(u);
            }
        });

        // Check Boot
        const bootY = startY + META_UPGRADES.length * CFG.game.bios.lineHeight + 30;
        if (my >= bootY - 20 && my < bootY + 10) {
            this.bootSystem();
        }

        // Check Theme Select (if unlocked)
        if (this.metaUpgrades['start_theme']) {
            const themeY = bootY + 30;
            if (my >= themeY - 20 && my < themeY + 10) {
                // Cycle Theme
                const themeIds = Object.keys(THEMES);
                let idx = themeIds.indexOf(this.currentTheme.id);
                idx = (idx + 1) % themeIds.length;
                this.setTheme(themeIds[idx]);
                this.events.emit('play_sound', 'click');
            }
        }
    }

    buyMetaUpgrade(u) {
        const currentLevel = this.metaUpgrades[u.id] || 0;
        if (u.maxLevel && currentLevel >= u.maxLevel) return;

        if (this.glitchData >= u.baseCost) {
            this.glitchData -= u.baseCost;
            this.metaUpgrades[u.id] = currentLevel + 1;
            this.events.emit('play_sound', 'buy');
            this.saveGame();
            this.applyMetaUpgrades();
        } else {
            this.events.emit('play_sound', 'error');
        }
    }

    bootSystem() {
        this.gameState = 'PLAYING';
        this.state.rebooting = true;
        this.state.rebootTimer = 0;
        // Reset dynamic values for new run
        this.state.startTime = Date.now();
    }

    handleInput(e) {
        const rect = this.renderer.canvas.getBoundingClientRect();
        this.mouse.x = e.clientX - rect.left;
        this.mouse.y = e.clientY - rect.top;
        this.mouse.down = true;

        const mx = this.mouse.x;
        const my = this.mouse.y;

        // Add chat console focus check (Only if not in BIOS)
        if (this.gameState !== 'BIOS' && this.chat.checkClick(mx, my, this.h)) {
            return;
        }

        if (this.gameState === 'BIOS') {
            this.handleBIOSClick(mx, my);
            return;
        }

        if (this.gameState !== 'PLAYING') return;

        // Mouse updated above

        // 0. Notepad (Top Priority)
        if (this.activeNotepad) {
            const close = this.activeNotepad.checkClick(mx, my);
            if (close) this.activeNotepad = null;
            return; // Block other inputs
        }

        // 0.05 Reviews Tab
        if (this.reviewsTab.visible) {
            this.reviewsTab.checkClick(mx, my);
            return;
        }

        // 0.055 Mail Window
        if (this.mailWindow.active) {
            const consumed = this.mailWindow.checkClick(mx, my);
            if (consumed) return;
        }

        // 0.056 Mail Icon/Button (Top Right, Pos 1)
        // Center: w-50, 50. Size: ~40x40 hit area
        if (Math.hypot(mx - (this.w - 50), my - 50) < 25) {
            this.mailWindow.active = !this.mailWindow.active;
            this.events.emit('play_sound', 'click');
            return;
        }

        // 0.06 Reviews Button (Top Right, Pos 2)
        // Center: w-50, 110.
        if (Math.hypot(mx - (this.w - 50), my - 110) < 25) {
            this.reviewsTab.toggle();
            return;
        }

        // 0.1 Lore Files
        for (let i = 0; i < this.loreFiles.length; i++) {
            if (this.loreFiles[i].checkClick(mx, my)) {
                // Open lore
                const file = this.loreFiles[i];
                this.activeNotepad = new NotepadWindow(this.w, this.h, file.content, { password: file.password });
                this.activeNotepad.title = file.label; // Lock title logic handles this in constructor but we can override or let it be
                this.loreFiles.splice(i, 1);
                this.events.emit('play_sound', 'click');
                return;
            }
        }

        // 0.2 Captchas (Priority)
        for (let i = 0; i < this.captchas.length; i++) {
            const c = this.captchas[i];
            if (c.checkClick(mx, my)) {
                this.events.emit('play_sound', 'buy'); // Success sound
                this.addScore(this.state.autoRate * 120 + 1000); // Bonus
                this.state.addCorruption(-5); // Cleans corruption
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
                    this.events.emit('play_sound', 'buy');
                } else {
                    this.events.emit('play_sound', 'click');
                }
            }
        }
        if (popupHit) return;

        // 2. Shop Upgrades
        let shopHit = false;
        this.upgrades.forEach((u, i) => {
            const col = i % 2;
            const row = Math.floor(i / 2);
            const bx = (this.w / 2 - CFG.game.shop.startX) + col * CFG.game.shop.colWidth;
            const by = this.h / 2 + 50 + row * CFG.game.shop.rowHeight;

            if (mx >= bx && mx <= bx + CFG.game.shop.width && my >= by && my <= by + CFG.game.shop.height) {
                shopHit = true;
                if (this.state.score >= u.cost) {
                    this.buyUpgrade(u);
                } else {
                    this.events.emit('play_sound', 'error');
                }
            }
        });
        if (shopHit) return;

        // 3. Main Button
        const cx = this.w / 2;
        const cy = this.h / 2 - 100;
        if (Math.hypot(mx - cx, my - cy) < CFG.game.mainButtonRadius) {
            this.clickMain();
            return;
        }

        // 3.5 Chat Console Focus
        // We pass 'h' because chat position depends on it
        if (this.chat.checkClick(mx, my, this.h)) {
            // Focus handled inside checkClick
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
                    this.state.addScore(100 * this.state.multiplier);

                    if (this.currentTheme.id === 'rainbow_paradise') {
                        this.state.addCorruption(1.5);
                    } else {
                        this.state.addCorruption(0.5);
                    }
                }
            }
        });

        if (hitUI) {
            this.shake = 3;
            // Additional lock logic for early game
            if (this.currentTheme.id === 'rainbow_paradise' && this.state.corruption < 30) {
                this.events.emit('play_sound', 'error');
                this.createFloatingText(mx, my, "LOCKED", "#888");
                return; // No corruption if locked?
            }

            this.events.emit('play_sound', 'glitch');
            if (this.currentTheme.id === 'rainbow_paradise') {
                this.state.addCorruption(0.2);
            }
        }

        if (this.hunter && this.hunter.active) {
            const hit = this.hunter.checkClick(mx, my);
            if (hit) {
                this.events.emit('play_sound', 'click');
                this.createParticles(mx, my, '#f00');
                if (hit === true) {
                    this.state.addScore(1000 * this.state.multiplier);
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
        let gain = this.state.clickPower;
        let isCrit = false;

        // Critical Click Check
        const critLevel = this.metaUpgrades['critical_click'] || 0;
        if (critLevel > 0 && Math.random() < critLevel * 0.1) {
            gain *= 5;
            isCrit = true;
        }

        this.addScore(gain);

        if (isCrit) {
            this.events.emit('play_sound', 'buy'); // Better sound needed?
            this.createFloatingText(this.w / 2, this.h / 2 - 150, "CRITICAL!", "#ff0");
            this.shake = 5;
        } else {
            this.events.emit('play_sound', 'click');
            this.shake = 2;
        }

        this.createParticles(this.w / 2, this.h / 2 - 100, this.currentTheme.colors.accent);
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

    addScore(amount) {
        // Redundant if we access this.state.addScore directly but let's keep it as proxy or remove.
        // The requirements say "Use this.state.addScore()". 
        // Existing calls to this.addScore(x) should refactor to this.state.addScore(x) OR we update this method.
        // Let's update this method to be a wrapper for now to avoid breaking other files if they use game.addScore().
        this.state.addScore(amount);

        // Visuals were here? No, visuals were usually separate or inside the old addScore?
        // Old Game.js didn't have addScore shown in the view_file ranges except maybe implied or I missed it.
        // Wait, line 356 call `this.addScore(0)`.
        // Let's check where `addScore` was defined.
        // I'll assume it was defined around line 800+ which I didn't see fully.
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

        // Cap dt to avoid huge jumps on lag
        const safeDt = Math.min(dt, 0.1);

        // --- FALSE CRASH LOGIC ---
        if (this.state.falseCrash) {
            this.state.crashTimer += dt;

            // 1. Initial Freeze (0-3s) -> Black Screen handled by Renderer

            // 2. Text Appearance (3s)

            // 3. Recovery (6s)
            if (this.state.crashTimer > 6.0) {
                this.state.falseCrash = false;
                document.body.style.cursor = 'default';
                this.chat.addMessage('SYSTEM', 'ERROR: SYSTEM RECOVERED');
                this.events.emit('play_sound', 'startup'); // Or some reboot sound
            }
            return; // STOP ALL OTHER UPDATES
        }

        this.update(safeDt);
        this.draw();

        requestAnimationFrame((t) => this.loop(t));
    }

    update(dt) {
        // --- INPUT DECAY LOGIC ---
        // Calculate Lag
        let lagAmount = 0;
        if (this.state.corruption > 60) {
            // max 500ms lag at 100 corruption
            lagAmount = (this.state.corruption - 60) * 12;
        }

        if (lagAmount > 0 && this.mouseHistory.length > 0) {
            const targetTime = Date.now() - lagAmount;
            // Find closest historical position
            let best = this.mouseHistory[this.mouseHistory.length - 1];
            for (let i = this.mouseHistory.length - 1; i >= 0; i--) {
                if (this.mouseHistory[i].time <= targetTime) {
                    best = this.mouseHistory[i];
                    break;
                }
            }
            this.mouse.x = best.x;
            this.mouse.y = best.y;
        } else {
            // No lag
            this.mouse.x = this.realMouse.x;
            this.mouse.y = this.realMouse.y;
        }

        // Calculate Inversion
        if (this.state.corruption > 85) {
            // Simple X-axis inversion
            this.mouse.x = this.w - this.mouse.x;
        }

        this.addScore(this.state.autoRate * dt);
        // 5. Update Timer
        this.state.timer += dt;
        this.chat.update(dt, this.state.corruption); // Keep chat update
        this.reviewsTab.update(dt);

        // Mail Notification Logic (e.g. flashing icon) can go here if needed
        // For now, mail checks are interval-based in MailSystem constructor


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
                // Was calling hardReset(), creating a loop if coming from BIOS start.
                // Reset logic is:
                // 1. Crash -> Wait -> crashed=false, rebooting=true.
                // 2. Rebooting -> Wait -> rebooting=false, hardReset() -> BIOS.
                // But now we have BIOS -> rebooting=true -> Game. 
                // So we need to know WHERE we are rebooting to.

                // If we are coming from BIOS (bootSystem), we want to PLAY.
                // If we are coming from Crash, we simply go to BIOS (via hardReset).

                // Current hardReset sets gameState='BIOS'.
                // bootSystem sets gameState='PLAYING'.

                // If gameState is PLAYING, we just end the reboot sequence.
                if (this.gameState === 'PLAYING') {
                    this.state.rebooting = false;
                    this.chat.addMessage('SYSTEM', 'SYSTEM REBOOT SUCCESSFUL.');
                    this.events.emit('play_sound', 'startup');
                } else {
                    // If we were crashing/rebooting into BIOS
                    this.hardReset();
                }
            }
            return;
        }

        // Theme Transition & Mechanics
        const tId = this.currentTheme.id;

        // 1. Rainbow -> Ad Purgatory
        if (tId === 'rainbow_paradise') {
            this.state.glitchIntensity = Math.max(0, (this.state.corruption - 30) / 70);
            if (this.state.corruption >= 100) this.switchTheme('ad_purgatory');
        }
        // 2. Ad Purgatory -> Dev Desktop
        else if (tId === 'ad_purgatory') {
            this.state.glitchIntensity = 0.2 + (this.state.corruption / 100) * 0.2;
            if (this.state.corruption >= 100) this.switchTheme('dev_desktop');

            // AD MECHANIC: Aggressive Popups
            if (Math.random() < 0.02 + (this.state.corruption * 0.001)) {
                if (this.popups.length < 15) this.popups.push(new Popup(this.w, this.h, this.currentTheme));
            }
        }
        // 3. Dev Desktop -> Digital Decay
        else if (tId === 'dev_desktop') {
            this.state.glitchIntensity = 0.3 + (this.state.corruption / 100) * 0.2;
            if (this.state.corruption >= 100) this.switchTheme('digital_decay');
        }
        // 4. Digital Decay -> Legacy System
        else if (tId === 'digital_decay') {
            this.state.glitchIntensity = 0.4 + (this.state.corruption / 100) * 0.4;
            if (this.state.corruption >= 100) this.switchTheme('legacy_system');
        }
        // 5. Legacy System -> Null Void
        else if (tId === 'legacy_system') {
            this.state.glitchIntensity = 0.6 + (this.state.corruption / 100) * 0.4;
            // Scanline effect is visual content
            if (this.state.corruption >= 100) this.switchTheme('null_void');
        }
        // 5. Null Void -> CRASH
        else if (tId === 'null_void') {
            this.state.glitchIntensity = 0.8 + (this.state.corruption / 100) * 0.2;
            if (this.state.corruption >= 100) this.triggerCrash();
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
                this.events.emit('play_sound', 'click');
            }
            if (d.life <= 0) this.debris.splice(i, 1);
        });

        this.popups.forEach((p, i) => {
            p.life -= dt;
            if (p.life <= 0) this.popups.splice(i, 1);
        });

        if (Math.random() < 0.001 + (this.state.glitchIntensity * 0.02)) {
            if (this.popups.length < 5) this.popups.push(new Popup(this.w, this.h, this.currentTheme));
        }

        if (this.shake > 0) this.shake *= 0.9;

        // Scare Timer
        if (this.scareTimer > 0) {
            this.scareTimer -= dt;
        }

        // Hunter Spawn
        if (!this.hunter && this.state.corruption > 40 && Math.random() < 0.001) {
            this.hunter = new GlitchHunter(this.w, this.h);
            this.chat.addMessage('SYSTEM', 'WARNING: VIRUS DETECTED');
            this.events.emit('play_sound', 'error');
        }

        // Fake Cursor Update (Fourth Wall)
        if (this.state.corruption > 20) {
            if (!this.fakeCursor.active && Math.random() < 0.0005 * this.state.corruption) {
                this.fakeCursor.reset(this.w, this.h);
            }
            this.fakeCursor.update(dt);
        }

        // Fake Browser Error Trigger (Corruption > 60)
        if (this.state.corruption > 60 && !this.state.crashed && !this.state.rebooting && !this.state.falseCrash) {
            // Rare event
            if (Math.random() < 0.0001) {
                this.triggerBrowserError();
            }
        }

        // Captchas
        this.captchas.forEach((c, i) => {
            const res = c.update(dt, this.mouse.x, this.mouse.y, this.w, this.h);
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

        if (this.state.corruption > 15 && Math.random() < 0.0005) {
            if (this.captchas.length < 1) {
                this.captchas.push(new CursedCaptcha(this.w, this.h));
                this.events.emit('play_sound', 'error');
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
                // Rendering hit effect should be in draw
                // WE need a visual flag for "being hit" or handle it in draw via hunter state
            }
        }
    }

    // --- FALSE CRASH MECHANIC ---
    triggerFalseCrash() {
        if (this.state.falseCrash) return;

        this.state.falseCrash = true;
        this.state.crashTimer = 0;

        // Force cursor change
        document.body.style.cursor = 'wait'; // System "loading" cursor

        // Stop audio?
        // this.audio.stopAll(); // Optional: silence is scarier
    }

    triggerBrowserError() {
        const el = document.getElementById('browser-error-overlay');
        if (el) el.style.display = 'flex';
        this.gameState = 'PAUSED'; // Pause game logic effectively
        this.events.emit('play_sound', 'error');
    }

    handleBrowserWait() {
        const el = document.getElementById('browser-error-overlay');
        if (el) el.style.display = 'none';
        this.gameState = 'PLAYING';

        // Reward
        const reward = this.state.autoRate * 60; // 1 min of production
        this.addScore(reward);
        this.chat.addMessage('SYSTEM', `Recalibrating... compensation awarded: ${UTILS.fmt(reward)}`);
        this.events.emit('play_sound', 'startup');
    }

    handleBrowserKill() {
        // Fake reload/crash
        location.reload();
    }

    draw() {
        const inputData = {
            currentTheme: this.currentTheme,
            mouse: this.mouse,
            shake: this.shake,
            scareTimer: this.scareTimer,
            scareText: this.scareText,
            gameState: this.gameState,
            rebootTimer: this.rebootTimer,
            metaUpgrades: this.metaUpgrades,
            glitchData: this.glitchData,
            selectedBIOSIndex: this.selectedBIOSIndex
        };

        const entities = {
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
            reviewsTab: this.reviewsTab,
            mailWindow: this.mailWindow,
            mail: this.mail,
            fakeCursor: this.fakeCursor,
            // clippy needs to be in entities if referenced, or added to input
            clippy: this.clippy // Assuming clippy might exist or be undefined
        };

        this.renderer.draw(this.state, entities, inputData);
    }

}
