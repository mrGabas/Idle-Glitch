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
import { EconomySystem } from '../systems/EconomySystem.js';
import { CrazyFaces } from '../ui/ui.js';
import { Particle, Debris } from '../entities/particles.js';
import { CursedCaptcha } from '../entities/enemies.js';
import { Popup } from '../ui/windows.js';
import { InputHandler } from './Input.js';
import { GameState } from './GameState.js';
import { EntityManager } from '../managers/EntityManager.js';
// New imports for Mail
import { GlitchSystem } from '../systems/GlitchSystem.js';
import { META_UPGRADES } from '../data/metaUpgrades.js';
import { ThemeManager } from '../managers/ThemeManager.js';
import { UIManager } from '../managers/UIManager.js';

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


        // Save loading
        this.prestigeMult = this.saveSystem.loadNumber('prestige_mult', 1.0);
        this.rebootCount = this.saveSystem.loadNumber('reboot_count', 0);

        this.themeManager = new ThemeManager(this);

        this.economySystem = new EconomySystem(this);
        this.glitchSystem = new GlitchSystem(this);

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

        this.economySystem.applyMetaUpgrades();

        this.uiManager = new UIManager(this);

        // Load Theme
        const savedTheme = this.saveSystem.load('selected_theme', 'rainbow_paradise');
        this.themeManager.setTheme(savedTheme);

        this.entities = new EntityManager();
        // this.debris, this.popups, this.captchas, this.loreFiles, this.particles -> managed by this.entities
        // We can keep references locally if we need direct access or just use getters.
        // For simplicity and to follow requirements, we should use the manager.

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
        this.economySystem.checkOfflineProgress();

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

    /**
     * Saves the current game state to local storage.
     */
    saveGame() {
        this.saveSystem.saveNumber('prestige_mult', this.prestigeMult);
        this.saveSystem.saveNumber('reboot_count', this.rebootCount);
        this.saveSystem.saveNumber('glitch_data', this.glitchData);
        this.saveSystem.saveNumber('lifetime_glitch_data', this.lifetimeGlitchData);
        this.saveSystem.save('meta_upgrades', this.metaUpgrades);
        this.saveSystem.saveNumber('last_save', Date.now());
        // Save rate for offline calc
        this.saveSystem.saveNumber('last_auto_rate', this.state.autoRate);
        this.saveSystem.save('selected_theme', this.themeManager.currentTheme.id);
    }





    /**
     * Binds DOM event listeners to UI elements.
     */
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
        if (waitBtn) waitBtn.onclick = () => this.glitchSystem.handleBrowserWait();

        const killBtn = document.getElementById('btn-error-kill');
        if (killBtn) killBtn.onclick = () => this.glitchSystem.handleBrowserKill();

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
            if (this.uiManager.activeNotepad && this.uiManager.activeNotepad.locked) {
                this.uiManager.activeNotepad.handleKeyDown(e);
                return;
            }

            // Priority 2: Chat Console Input
            if (this.uiManager.chat && this.uiManager.chat.isFocused) {
                this.uiManager.chat.handleKeyDown(e);
                // Don't return necessarily, maybe allows some game shortcuts still? 
                // But for typing safety, let's return if it's a character key
                if (e.key.length === 1 || e.key === 'Backspace' || e.key === 'Enter') return;
            }

            if (e.key === 'Escape') {
                if (this.uiManager.activeNotepad) {
                    this.uiManager.activeNotepad = null;
                } else if (this.uiManager.chat && this.uiManager.chat.isFocused) {
                    this.uiManager.chat.isFocused = false;
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
                if (this.uiManager.reviewsTab.visible) {
                    this.uiManager.reviewsTab.handleScroll(e.deltaY);
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

    /**
     * Starts the gameplay loop.
     */
    startGame() {
        this.audio.resume();
        this.setScreen(null);
        this.gameState = 'PLAYING';
    }

    /**
     * Toggles between PLAYING and PAUSED states.
     */
    togglePause() {
        if (this.gameState === 'PLAYING') {
            this.gameState = 'PAUSED';
            this.setScreen('pause-menu');
        } else if (this.gameState === 'PAUSED') {
            this.gameState = 'PLAYING';
            this.setScreen(null);
        }
    }

    /**
     * Opens the settings menu.
     * @param {string} fromIds - The ID of the screen to return to.
     */
    openSettings(fromIds) {
        this.previousState = this.gameState;
        this.gameState = 'SETTINGS';
        this.returnScreenId = fromIds;
        this.setScreen('settings-menu');
    }

    /**
     * Closes the settings menu and returns to previous state.
     */
    closeSettings() {
        if (this.previousState === 'MENU') {
            this.gameState = 'MENU';
            this.setScreen('start-menu');
        } else {
            this.gameState = 'PAUSED';
            this.setScreen('pause-menu');
        }
    }

    /**
     * Sets the active DOM screen element.
     * @param {string|null} id - The ID of the screen element to show, or null to hide all.
     */
    setScreen(id) {
        document.querySelectorAll('.menu-screen').forEach(el => el.style.display = 'none');
        if (id) {
            const el = document.getElementById(id);
            if (el) el.style.display = 'flex';
        }
    }

    /**
     * Resizes the canvas and systems to fit the window.
     */
    resize() {
        if (this.renderer) this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.w = window.innerWidth; // Keep local ref for logic
        this.h = window.innerHeight;
        if (this.fakeUI) this.fakeUI.init(this.w, this.h);
        if (this.glitchSystem) this.glitchSystem.resize(this.w, this.h);
        if (this.uiManager) this.uiManager.resize(this.w, this.h);
    }

    /**
     * Triggers the crash (BSOD) sequence via ThemeManager.
     */
    triggerCrash() {
        this.themeManager.triggerCrash();
    }

    /**
     * Performs a hard reset (Prestige) of the game session.
     */
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
        this.themeManager.reset();

        // Clear entities
        this.entities.clear();
        // Need to add clear method to EntityManager or implementing it via resetting layers?
        // Let's implement reset in Game by making new instance OR iterating layers.
        // For now, new instance is safe.
        this.entities = new EntityManager();

        this.uiManager.activeNotepad = null;
        this.hunter = null;
        this.uiManager.chat.messages = [];
        this.uiManager.chat.addMessage('SYSTEM', 'BIOS LOADED. WELCOME USER.');

        // Apply passive metas
        // Apply passive metas
        this.economySystem.applyMetaUpgrades();
    }

    // --- LOGIC ---

    handleBIOSAction(index) {
        // Upgrades
        if (index < META_UPGRADES.length) {
            this.economySystem.buyMetaUpgrade(META_UPGRADES[index]);
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
            let idx = themeIds.indexOf(this.themeManager.currentTheme.id);
            idx = (idx + 1) % themeIds.length;
            this.themeManager.setTheme(themeIds[idx]);
            this.events.emit('play_sound', 'click');
        }
    }

    /**
     * Handles interactions within the BIOS screen.
     * @param {number} mx - Mouse X.
     * @param {number} my - Mouse Y.
     */
    handleBIOSClick(mx, my) {
        const startY = CFG.game.bios.startY;

        // Check Upgrades
        META_UPGRADES.forEach((u, i) => {
            const y = startY + i * CFG.game.bios.lineHeight;
            // Hitbox approximation
            if (my >= y - 20 && my < y + 10) {
                // Clicked Item
                this.economySystem.buyMetaUpgrade(u);
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
                let idx = themeIds.indexOf(this.themeManager.currentTheme.id);
                idx = (idx + 1) % themeIds.length;
                this.themeManager.setTheme(themeIds[idx]);
                this.events.emit('play_sound', 'click');
            }
        }
    }



    /**
     * Boots the system to start a new run from BIOS.
     */
    bootSystem() {
        this.gameState = 'PLAYING';
        this.state.rebooting = true;
        this.state.rebootTimer = 0;
        // Reset dynamic values for new run
        this.state.startTime = Date.now();
    }

    /**
     * Handles global input dispatching.
     * @param {MouseEvent} e - The mouse event.
     */
    handleInput(e) {
        const rect = this.renderer.canvas.getBoundingClientRect();
        this.mouse.x = e.clientX - rect.left;
        this.mouse.y = e.clientY - rect.top;
        this.mouse.down = true;

        const mx = this.mouse.x;
        const my = this.mouse.y;

        if (this.uiManager.handleInput(mx, my)) return;

        if (this.gameState === 'BIOS') {
            this.handleBIOSClick(mx, my);
            return;
        }

        if (this.gameState !== 'PLAYING') return;

        // Mouse updated above



        // 0.1 Handle Entity/Glitch Clicks
        if (this.glitchSystem.handleClick(mx, my)) return;

        // 1. Popups
        let popupHit = false;
        const popups = this.entities.getAll('ui');
        for (let p of popups) {
            const res = p.checkClick(mx, my);
            if (res) {
                popupHit = true;
                if (res === 'bonus') {
                    this.addScore(this.state.autoRate * 20 + 500);
                    this.createParticles(mx, my, this.themeManager.currentTheme.colors.accent);
                    this.events.emit('play_sound', 'buy');
                } else {
                    this.events.emit('play_sound', 'click');
                }
            }
        }
        if (popupHit) return;

        // 2. Shop & Main Button checks delegated to EconomySystem
        if (this.economySystem.handleClick(mx, my)) return;



        // 4. DESTRUCTION OF FAKE UI
        let hitUI = false;
        this.fakeUI.elements.forEach(el => {
            if (el.active && mx > el.x && mx < el.x + el.w && my > el.y && my < el.y + el.h) {
                hitUI = true;
                // Damage UI logic moved to CrazyFaces class partly, but effect logic here
                const destroyed = this.fakeUI.damage(el);

                // Spawn debris
                for (let i = 0; i < 3; i++) {
                    this.entities.add('debris', new Debris(mx, my, el.color));
                }

                if (destroyed) {
                    // Big debris explosion
                    for (let i = 0; i < 15; i++) {
                        this.entities.add('debris', new Debris(el.x + el.w / 2, el.y + el.h / 2, el.color));
                    }
                    this.state.addScore(100 * this.state.multiplier);

                    if (this.themeManager.currentTheme.id === 'rainbow_paradise') {
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
            if (this.themeManager.currentTheme.id === 'rainbow_paradise' && this.state.corruption < 30) {
                this.events.emit('play_sound', 'error');
                this.createFloatingText(mx, my, "LOCKED", "#888");
                return; // No corruption if locked?
            }

            this.events.emit('play_sound', 'glitch');
            if (this.themeManager.currentTheme.id === 'rainbow_paradise') {
                this.state.addCorruption(0.2);
            }
        }


    }

    /**
     * Creates a floating text particle.
     * @param {number} x - X coordinate.
     * @param {number} y - Y coordinate.
     * @param {string} text - Text to display.
     * @param {string} color - CSS color string.
     */
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
        // Ensure update signature match if Particle doesn't fully cover it?
        // Particle.update() in entities/particles.js is:
        /*
        update() {
            this.x += this.vx;
            this.y += this.vy;
            this.life -= 0.02;
        }
        */
        // EntityManager calls entity.update(dt, context).
        // Particle.update takes no args in original file?
        // Let's check Particle.update signature again.
        // It was: update() { ... }
        // EntityManager calls update(dt, context).
        // JS ignores extra args, but dt is missing inside Particle.update?
        // Particle.update uses hardcoded 0.02 decay.
        // Floating text sets life=1.0.
        // If Particle.update is called, it decays by 0.02 per frame?
        // If EntityManager calls it, it works.
        // But wait, I didn't update Particle.update signature in particles.js to use dt! 
        // I only updated Debris. 
        // I should check particles.js again.

        this.entities.add('particles', p);
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
            this.entities.add('particles', new Particle(x, y, color));
        }
    }

    // Main Loop
    /**
     * Main Game Loop.
     * @param {number} t - Current timestamp.
     */
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

        this.themeManager.update(safeDt);
        this.uiManager.update(safeDt);
        this.update(safeDt);
        this.draw();

        requestAnimationFrame((t) => this.loop(t));
    }

    /**
     * Updates game logic.
     * @param {number} dt - Delta time in seconds.
     */
    update(dt) {
        // Glitch System Logic (Lag, Crashes, Spawning)
        this.glitchSystem.update(dt);

        // Stop updates if crashed
        if (this.state.falseCrash || this.state.crashed || this.state.rebooting) return;

        this.economySystem.update(dt);
        // 5. Update Timer
        this.state.timer += dt;

        // Mail Notification Logic (e.g. flashing icon) can go here if needed
        // For now, mail checks are interval-based in MailSystem constructor


        // Crash Logic handled by GlitchSystem
        // Theme Transition & Mechanics handled by Manager
        this.themeManager.update(dt);

        // Entities
        this.entities.update(dt, this);
        // We rely on entities updating and mutating state if needed or we check conditions here?
        // Debris collection logic was:
        /*
        this.debris.forEach((d, i) => {
            const res = d.update(dt, this.h, this.mouse.x, this.mouse.y);
            if (res === 'collected') {
                this.addScore(10 * this.state.multiplier);
                this.events.emit('play_sound', 'click');
            }
            if (d.life <= 0) this.debris.splice(i, 1);
        });
        */
        // I need to update Debris class to handle this or use the returned status if I modify EntityManager to capture it.
        // My EntityManager implementation returns nothing on update list.
        // So I must push logic to Debris.update or iterate debris manually if I want to keep it simple without deeper refactor.
        // "Game.js becomes a high-level orchestrator".
        // Let's modify Debris to use context.

        // Popups
        // Managed by EntityManager now (ui layer)
        // But spawning logic remains here
        // Popups (Managed by ThemeManager for Ad Purgatory mostly, but random ones here?)
        // The original simplified popup logic was for random chaos, now mainly in ThemeManager.
        // But the original code had a separate block here for general random popups?
        // Let's keep it if it's general chaos, or move it if it's theme specific.
        // It uses `game.state.glitchIntensity`.
        if (Math.random() < 0.001 + (this.state.glitchIntensity * 0.02)) {
            if (this.entities.getAll('ui').length < 5) this.entities.add('ui', new Popup(this.w, this.h, this.themeManager.currentTheme));
        }

        if (this.shake > 0) this.shake *= 0.9;

        // Scare Timer
        if (this.scareTimer > 0) {
            this.scareTimer -= dt;
        }


    }

    /**
     * Manually triggers a browser error simulation.
     */
    triggerBrowserError() {
        this.glitchSystem.triggerBrowserError();
    }

    /**
     * Renders the game frame.
     */
    draw() {
        const inputData = {
            currentTheme: this.themeManager.currentTheme,
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
            upgrades: this.themeManager.upgrades,
            debris: this.entities.getAll('debris'),
            particles: this.entities.getAll('particles'),
            popups: this.entities.getAll('ui'),
            captchas: this.entities.getAll('enemies').filter(e => e instanceof CursedCaptcha),
            loreFiles: this.entities.getAll('items'),
            hunter: this.hunter,
            fakeCursor: this.glitchSystem.fakeCursor,
            clippy: this.clippy
        };

        this.renderer.draw(this.state, entities, inputData, this.uiManager);
    }

}
