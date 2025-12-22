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
import { CrazyFakes } from '../ui/ui.js';
import { Particle, Debris, FloatingText } from '../entities/particles.js';

import { Popup, NotepadWindow, ConfirmationWindow, CongratulationsWindow } from '../ui/windows.js';
import { PasswordWindow } from '../ui/PasswordWindow.js';
import { MinigameWindow } from '../ui/MinigameWindow.js';
import { InputHandler } from './Input.js';
import { GameState } from './GameState.js';
import { UIManager } from '../managers/UIManager.js';
import { EntityManager } from '../managers/EntityManager.js';
import { GlitchSystem } from '../systems/GlitchSystem.js';
import { META_UPGRADES } from '../data/metaUpgrades.js';
import { ThemeManager } from '../managers/ThemeManager.js';
import { AchievementSystem } from '../systems/AchievementSystem.js';
import { LoreSystem } from '../systems/LoreSystem.js';
import { AchievementPopup } from '../ui/notifications.js';
import { VirtualControls } from '../ui/VirtualControls.js';
import { TutorialSystem } from '../systems/TutorialSystem.js';
import { CollectionSystem } from '../systems/CollectionSystem.js';
import { EndingSequence } from './EndingSequence.js';
import { AdsManager } from '../managers/AdsManager.js';

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
        this.virtualControls = new VirtualControls(this);
        this.audio = new SoundEngine(); // Keep for resume()

        // Load Audio Settings
        const sfxVol = this.saveSystem.loadNumber('sfx_volume', 0.5);
        const musicVol = this.saveSystem.loadNumber('music_volume', 0.5);
        this.audio.setSFXVolume(sfxVol);
        this.audio.setMusicVolume(musicVol);

        // --- CrazyGames SDK Init ---
        this.playerName = "Unknown Operator";
        this.adsManager = new AdsManager(this);
        this.adsManager.init();

        this.resize(); // Initialize dimensions early



        // Save loading
        this.prestigeMult = this.saveSystem.loadNumber('prestige_mult', 1.0);
        this.rebootCount = this.saveSystem.loadNumber('reboot_count', 0);

        this.themeManager = new ThemeManager(this);


        this.economySystem = new EconomySystem(this);
        this.glitchSystem = new GlitchSystem(this);
        this.achievementSystem = new AchievementSystem(this);
        this.loreSystem = new LoreSystem(this);
        this.tutorialSystem = new TutorialSystem(this);
        this.collectionSystem = new CollectionSystem(this);
        this.endingSequence = new EndingSequence(this);

        this.events.on('achievement_unlocked', (ach) => {
            this.entities.add('ui', new AchievementPopup(this, ach));
        });

        // META DATA
        this.glitchData = this.saveSystem.loadNumber('glitch_data', 0);
        this.lifetimeGlitchData = this.saveSystem.loadNumber('lifetime_glitch_data', 0);
        this.lastBiosAdTime = this.saveSystem.loadNumber('last_bios_ad_time', 0);
        this.metaUpgrades = this.saveSystem.load('meta_upgrades', {});
        this.storyFlags = this.saveSystem.load('story_flags', { hasWitnessedCollapse: false });

        // Load Lore Data
        this.loreSystem.load(this.saveSystem.load('lore_data', null));

        // Load Tutorial Data
        this.tutorialSystem.init(this.saveSystem.load('tutorial_data', []));

        this.state = new GameState();

        this.state.multiplier = 1 * this.prestigeMult;


        this.economySystem.applyMetaUpgrades();

        this.uiManager = new UIManager(this);
        this.fakeUI = new CrazyFakes(this);

        // Load Theme
        const savedTheme = this.saveSystem.load('selected_theme', 'rainbow_paradise');
        this.themeManager.setTheme(savedTheme);

        // NEW: Load Theme Upgrades (Must be after setTheme)
        const themeData = this.saveSystem.load('theme_data', null);
        if (themeData) {
            this.themeManager.loadThemeUpgrades(themeData);
        }

        // --- LOAD GAME STATE ---
        const savedState = this.saveSystem.load('game_state', null);
        if (savedState) {
            this.state.import(savedState);
        } else {
            // Apply initial multipliers if no save
            this.state.multiplier = 1 * this.prestigeMult;
        }

        this.entities = new EntityManager();


        this.mouse = { x: 0, y: 0, down: false };
        this.realMouse = { x: 0, y: 0 }; // Track physical mouse
        this.mouseHistory = []; // For lag effect

        this.shake = 0;
        this.rebootTimer = 0;
        this.scareTimer = 0;
        this.scareText = "";
        this.selectedBIOSIndex = 0;



        this.lastTime = 0;
        // Last Save Time for Offline Progress
        this.lastSaveTime = this.saveSystem.loadNumber('last_save', Date.now());
        this.economySystem.checkOfflineProgress();

        // BIOS UI State
        this.biosState = {
            openDescriptions: new Set(),
            scrollOffset: 0,
            maxScroll: 0
        };

        // NEW: Load Mail Data
        const mailData = this.saveSystem.load('mail_data', null);
        if (this.uiManager && this.uiManager.mail && mailData) {
            this.uiManager.mail.importData(mailData);
        }

        // NEW: Load Archive Data
        const archiveData = this.saveSystem.load('archive_data', null);
        if (archiveData) {
            this.state.archive = archiveData;
        }

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
        this.saveSystem.saveNumber('last_bios_ad_time', this.lastBiosAdTime);
        this.saveSystem.save('meta_upgrades', this.metaUpgrades);
        this.saveSystem.save('story_flags', this.storyFlags);
        this.saveSystem.saveNumber('last_save', Date.now());
        // Save rate for offline calc
        this.saveSystem.saveNumber('last_auto_rate', this.state.autoRate);
        this.saveSystem.save('selected_theme', this.themeManager.currentTheme.id);

        // SAVE GAME STATE
        this.saveSystem.save('game_state', this.state.export());

        // NEW: Save Theme Upgrades
        this.saveSystem.save('theme_data', this.themeManager.getSaveData());

        // NEW: Save Mail Data
        if (this.uiManager && this.uiManager.mail) {
            this.saveSystem.save('mail_data', this.uiManager.mail.exportData());
        }

        // Save Lore Data
        this.saveSystem.save('lore_data', this.loreSystem.getSaveData());

        // Save Tutorial Data
        // Save Tutorial Data
        this.saveSystem.save('tutorial_data', this.tutorialSystem.getSaveData());

        // Save Audio Settings
        this.saveSystem.saveNumber('sfx_volume', this.audio.sfxVolume);
        this.saveSystem.saveNumber('music_volume', this.audio.musicVolume);
    }



    // Helper: Is the destruction narrative active? (Level 1 + First Time)
    get isDestructionNarrativeValid() {
        return this.themeManager.currentTheme.id === 'rainbow_paradise' && !this.storyFlags.hasWitnessedCollapse;
    }

    // Helper: Is the Corruption Glitch active?
    get canTriggerDestruction() {
        return this.isDestructionNarrativeValid && this.state.corruption >= 60;
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

        const backBtn = document.getElementById('btn-back');
        if (backBtn) backBtn.onclick = () => this.closeSettings();

        // Volume Sliders
        const sfx = document.getElementById('vol-sfx');
        const music = document.getElementById('vol-music');

        if (sfx) {
            sfx.value = this.audio.sfxVolume;
            sfx.oninput = (e) => this.audio.setSFXVolume(e.target.value);
        }
        if (music) {
            music.value = this.audio.musicVolume;
            music.oninput = (e) => this.audio.setMusicVolume(e.target.value);
        }



        // Input Listeners
        this.input.on('resize', () => this.resize());
        this.input.on('keydown', (e) => {
            // Priority -1: Minigame text input (if any) - snake handles its own polling now
            // But if text input needed for other minigames... keep for now

            // Priority 1: Password/Notepad Input (Text Interaction)
            // Check top-most window
            const activeWindow = this.uiManager.windowManager.windows[this.uiManager.windowManager.windows.length - 1];
            if (activeWindow instanceof PasswordWindow) {
                activeWindow.handleKeyDown(e);
                return;
            }
            if (activeWindow instanceof NotepadWindow && activeWindow.locked) {
                activeWindow.handleKeyDown(e);
                return;
            }

            // Priority 2: Chat Console Input (Text Interaction)
            if (this.uiManager.chat && this.uiManager.chat.isFocused) {
                this.uiManager.chat.handleKeyDown(e);
                if (e.key.length === 1 || e.key === 'Backspace' || e.key === 'Enter') return;
            }
        });

        this.input.on('mousedown', (e) => {
            const target = e.target;
            const isShift = e.shiftKey;

            // Check rigid narrative constraints
            // We allow Shift+Click (God Mode) ONLY if we are in the correct narrative phase?
            // OR do we allow God Mode always? "Only on the first location and only once" seems strict.

            // 1. Is the feature enabled narratively?
            const narrativeValid = this.isDestructionNarrativeValid;
            // 2. Is the corruption high enough?
            const corruptionActive = this.canTriggerDestruction;

            // UNIVERSAL DESTRUCTION
            // Trigger: (SHIFT + Click + Narrative) OR (Corruption Active)
            if ((narrativeValid && isShift) || corruptionActive) {

                // Exclude body/html
                if (target !== document.body && target !== document.documentElement) {

                    // SAFETY: If NOT using Shift, PROTECT THE CANVAS
                    if (!isShift && target.id === 'gameCanvas') {
                        this.handleInput(e);
                        return;
                    }

                    // 1. Play Break Sound
                    this.events.emit('play_sound', 'break');

                    // 2. Add visual destruction
                    target.classList.add('broken-ui');

                    // 3. Shake Screen
                    this.shake = 10;

                    // 4. Remove after animation
                    setTimeout(() => {
                        target.style.display = 'none';
                    }, 2800);

                    e.preventDefault();
                    e.stopPropagation();
                    return;
                }
            }

            this.handleInput(e);
        });
        this.input.on('mouseup', (e) => {
            if (this.uiManager.handleMouseUp()) return;
            this.mouse.down = false;
        });

        this.input.on('mousemove', (e) => {
            const rect = this.renderer.canvas.getBoundingClientRect();
            const mx = e.clientX - rect.left;
            const my = e.clientY - rect.top;

            if (this.gameState === 'ENDING') {
                this.mouse.x = mx;
                this.mouse.y = my;
                this.endingSequence.handleMouseMove(mx, my);
                return;
            }

            if (this.uiManager.handleMouseMove(mx, my)) return;

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
            if (this.gameState === 'BIOS') {
                this.handleBIOSScroll(e.deltaY);
                return;
            }

            if (this.gameState === 'PLAYING') {
                // Check Chat
                const rect = this.renderer.canvas.getBoundingClientRect();
                const mouseX = e.clientX - rect.left;
                const mouseY = e.clientY - rect.top;

                if (this.uiManager.chat && this.uiManager.chat.isMouseOver(mouseX, mouseY, this.h)) {
                    this.uiManager.chat.handleWheel(e.deltaY);
                    return;
                }

                if (this.uiManager.reviewsTab.visible) {
                    this.uiManager.reviewsTab.handleScroll(e.deltaY);
                } else if (this.uiManager.achievementsWindow && this.uiManager.achievementsWindow.visible) {
                    this.uiManager.achievementsWindow.handleScroll(e.deltaY);
                }
            }
        });

        this.initTabStalker();

        // Save on exit
        window.addEventListener('beforeunload', () => {
            this.saveGame();
        });
    }

    initTabStalker() {
        let titleInterval = null;
        let awayStartTime = 0;
        const subTitles = CFG.game.tabStalker.subTitles;
        const originalTitle = document.title;

        this.input.on('visibilitychange', () => {
            if (document.hidden) {
                // Player left
                this.adsManager.gameplayStop();
                awayStartTime = Date.now();
                let i = 0;
                titleInterval = setInterval(() => {
                    document.title = subTitles[i % subTitles.length];
                    i++;
                }, 2000);
            } else {
                // Player returned
                this.adsManager.gameplayStart();
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

        // Penalty removed for retention
        // const penalty = this.state.autoRate * seconds * 1.5;
        // this.state.addScore(-penalty);
        this.state.addScore(0); // Force UI update if needed

        // Scare
        // this.events.emit('play_sound', 'error'); // Removed to avoid generated sound
        this.shake = 10;
        this.state.addCorruption(1);
        this.triggerScareOverlay("WHERE WERE YOU?");
    }

    triggerScareOverlay(text) {

        this.events.emit('play_sound', 'screamer');
        this.scareText = text;
        this.scareTimer = 1.5; // Displays for 1.5s
    }

    /**
     * Starts the gameplay loop.
     */
    startGame() {
        // Init Audio Context (Interaction required)
        this.audio.resume();
        this.setScreen(null);
        this.gameState = 'PLAYING';

        // SDK Hook
        this.adsManager.gameplayStart();

        // Check Tutorial
        if (!this.tutorialSystem.completedTutorials.has('intro')) {
            this.tutorialSystem.startSequence('intro');
        } else {
            // If tutorial finished, ensure shop is open
            this.economySystem.openShop();
        }
    }

    /**
     * Toggles between PLAYING and PAUSED states.
     */
    togglePause() {
        if (this.gameState === 'PLAYING') {
            this.gameState = 'PAUSED';
            this.setScreen('pause-menu');
            this.adsManager.gameplayStop();
        } else if (this.gameState === 'PAUSED') {
            this.gameState = 'PLAYING';
            this.setScreen(null);
            this.adsManager.gameplayStart();
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

        // Reset Cursor (Hide system cursor, use game cursor)
        this.renderer.canvas.style.cursor = 'none';

        // Restore Volume (Fixes fade out from Ending)
        this.audio.setMusicVolume(this.audio.musicVolume);
        this.audio.setSFXVolume(this.audio.sfxVolume);

        // Signal Audio Engine to stop music for BIOS
        this.events.emit('theme_changed', 'bios');

        this.entities.clear();
        // Clear entities

        // For now, new instance is safe.
        this.entities = new EntityManager();

        this.uiManager.activeNotepad = null;

        this.uiManager.chat.messages = [];
        this.uiManager.chat.addMessage('SYSTEM', 'BIOS LOADED. WELCOME USER.');

        // Apply passive metas
        this.economySystem.applyMetaUpgrades();
        // Re-apply Achievement Rewards (Persistent)
        this.achievementSystem.applyRewards();
    }

    // --- LOGIC ---

    handleGlobalInput() {
        // Minigames are handled in their own update loop via EntityManager -> MinigameWindow

        // BIOS Navigation
        if (this.gameState === 'BIOS') {
            if (this.input.isActionPressed('UP')) {
                this.selectedBIOSIndex = Math.max(0, this.selectedBIOSIndex - 1);
                this.events.emit('play_sound', 'click');
            }
            if (this.input.isActionPressed('DOWN')) {
                // Calculate max index based on upgrades + Boot + Theme (if unlocked)
                let max = META_UPGRADES.length;
                if (this.metaUpgrades['start_theme']) max++;

                this.selectedBIOSIndex = Math.min(max, this.selectedBIOSIndex + 1);
                this.events.emit('play_sound', 'click');
            }
            if (this.input.isActionPressed('CONFIRM')) {
                this.handleBIOSAction(this.selectedBIOSIndex);
            }
            // F10 is usually special, not in default action map, but we can check raw key if needed or map it
            // Let's assume F10 is raw check for now or add to 'START' action?
            // "Boot" is essentially confirm on the boot button, which is index driven.
        }

        // Global Cancel/Pause
        if (this.input.isActionPressed('CANCEL')) {
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
    }

    handleBIOSScroll(deltaY) {
        const speed = 20; // Scroll speed
        if (deltaY > 0) {
            this.biosState.scrollOffset = Math.min(this.biosState.maxScroll, this.biosState.scrollOffset + speed);
        } else {
            this.biosState.scrollOffset = Math.max(0, this.biosState.scrollOffset - speed);
        }
    }

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
        console.log(`BIOS Click: ${mx}, ${my}`);
        // View Area Check (Clipping)
        // Renderer draws box from roughly 50 to h-50.
        const viewTop = 50;
        const viewBottom = this.h - 50;

        // If click is outside the scrollable content area, ignore (or handle header/footer clicks if any)
        if (my < viewTop || my > viewBottom) return;

        const startY = CFG.game.bios.startY;
        // Check Header Button (Watch Ad)
        if (my >= 60 && my <= 86 && mx >= 400 && mx <= 600) {
            // Check Cooldown
            const now = Date.now();
            if (now - this.lastBiosAdTime < 120000) { // 2 Minutes
                this.events.emit('play_sound', 'error');
                return;
            }

            const win = new ConfirmationWindow(
                this.w,
                this.h,
                "SYSTEM UPGRADE",
                "Watch ad sequence for\n+300 MB Glitch Data?",
                () => {
                    this.adsManager.watchBIOSAd(() => {
                        this.glitchData += 300;
                        this.lastBiosAdTime = Date.now();
                        this.saveGame();
                        this.events.emit('play_sound', 'success');
                    });
                },
                'bios' // Style
            );
            this.uiManager.windowManager.add(win);
            this.events.emit('play_sound', 'click');
            return;
        }

        // Apply Scroll Offset to virtual Y
        // Screen Y = Virtual Y - Scroll
        // Virtual Y = Screen Y + Scroll

        // However, the loop logic calculates "currentY" as Screen Y.
        // Let's adjust startY by scrollOffset
        let currentY = startY - this.biosState.scrollOffset;

        // Check Upgrades
        for (let i = 0; i < META_UPGRADES.length; i++) {
            const u = META_UPGRADES[i];
            const isExpanded = this.biosState.openDescriptions.has(u.id);
            const itemHeight = isExpanded ? 60 : 30; // 30px base + 30px desc

            // Check Row Hit
            if (my >= currentY && my < currentY + itemHeight) {
                // Check Button Click (Right side)
                // Renderer draws button at x=400, w=200 (400-600)
                if (mx >= 400 && mx <= 600) {
                    this.economySystem.buyMetaUpgrade(u);
                } else if (mx < 400) {
                    // Toggle Description (Left side only)
                    if (this.biosState.openDescriptions.has(u.id)) {
                        this.biosState.openDescriptions.delete(u.id);
                    } else {
                        this.biosState.openDescriptions.add(u.id);
                    }
                    this.events.emit('play_sound', 'click');
                }
                return; // Handled
            }

            // Advance Y
            currentY += itemHeight;
        }

        // Check Boot
        // Add spacing
        currentY += 30;

        if (my >= currentY && my < currentY + 30) {
            this.bootSystem();
            return;
        }
        currentY += 30;

        // Check Theme Select (if unlocked)
        if (this.metaUpgrades['start_theme']) {
            currentY += 10; // Extra spacing
            if (my >= currentY && my < currentY + 30) {
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

        // META: RAM_EXPANSION (Start Bonus)
        const ramLevel = this.metaUpgrades['start_bonus'] || 0;
        if (ramLevel > 0) {
            this.state.addScore(ramLevel * 500);
        }

        // Resume Music (Sync with current theme)
        this.events.emit('theme_changed', this.themeManager.currentTheme.id);

        // Check for Ending Congratulation
        if (this.state.endingSeen && !this.state.congratsShown) {
            setTimeout(() => {
                const win = new CongratulationsWindow(this.w, this.h, () => { });
                this.uiManager.windowManager.add(win);
                this.events.emit('play_sound', 'success');

                this.state.congratsShown = true;
                this.saveGame();
            }, 1000);
        }
    }

    /**
     * Handles the specific "Great Collapse" transition event from Level 1.
     */
    triggerLevelCollapse() {
        if (this.isCollapsing) return;

        // Condition: Level 1 (Rainbow Paradise) + Max Corruption
        if (this.themeManager.currentTheme.id === 'rainbow_paradise' && this.state.corruption >= 100) {

            // Scenario A: First Time (Witnessing the collapse)
            if (!this.storyFlags.hasWitnessedCollapse) {
                this.isCollapsing = true;

                // 1. Audio Impact
                this.events.emit('play_sound', 'break');
                this.shake = 50; // Violent shake

                // 2. Visual Chaos (Animation)
                // Select critical UI elements
                const selectors = [
                    '#ui-layer > *',       // All UI windows/overlays
                    '.menu-btn',           // Buttons
                    'canvas',              // The game view itself
                    '.fake-ui-element'     // Any remaining fake UI
                ];

                const elements = document.querySelectorAll(selectors.join(','));

                // Apply 'broken-ui' class with randomized staggering for chaos
                elements.forEach(el => {
                    if (el.style.display !== 'none') {
                        // Random delay between 0 and 500ms
                        el.style.animationDelay = (Math.random() * 0.5) + 's';
                        el.classList.add('broken-ui');
                    }
                });

                // 3. Transition Logic after animation
                setTimeout(() => {
                    this.storyFlags.hasWitnessedCollapse = true;
                    this.saveGame();

                    // Switch Theme
                    this.themeManager.switchTheme('ad_purgatory');

                    // Cleanup CSS
                    elements.forEach(el => {
                        el.classList.remove('broken-ui');
                        el.style.animationDelay = '0s';
                        // Reset transforms if needed, but class removal should suffice
                    });

                    this.isCollapsing = false;
                    // corruption reset handled by switchTheme

                }, 3000); // 3 seconds matching CSS animation

            }
            // Scenario B: Replay (Skip animation)
            else {
                this.themeManager.switchTheme('ad_purgatory');
            }
        }
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

        // Mouse Inversion Fix
        if (this.state.corruption > 85) {
            this.mouse.x = this.w - this.mouse.x;
        }

        const mx = this.mouse.x;
        const my = this.mouse.y;

        if (this.gameState === 'BIOS') {
            if (this.uiManager.windowManager.handleInput(mx, my)) return;
            this.handleBIOSClick(mx, my);
            return;
        }

        if (this.gameState === 'ENDING') {
            this.endingSequence.handleInput(mx, my);
            return;
        }

        if (this.uiManager.handleInput(mx, my)) return;

        // META: DEBUG PANEL Click Handling
        const hasSafeMode = this.metaUpgrades['safe_mode'];
        const hasAutoBuy = this.metaUpgrades['auto_buy'];

        if (hasSafeMode || hasAutoBuy) {
            const px = (this.w * CFG.game.shop.startXRatio) - 120;
            const py = 20;

            const btnW = 90;
            const btnH = 25;
            const gap = 5;
            const padY = 8;

            let currentY = py + padY;

            // --- SAFE MODE CONTROLS ---
            if (hasSafeMode) {
                // -10% COR
                const b1x = px + 10;
                const b1y = currentY;

                if (mx >= b1x && mx <= b1x + btnW && my >= b1y && my <= b1y + btnH) {
                    this.state.corruption = Math.max(0, this.state.corruption - 10);
                    this.events.emit('play_sound', 'click');
                    this.createFloatingText(mx, my, "-10% COR", "#0f0");
                    return;
                }

                // +10% COR
                const b2y = b1y + btnH + gap;
                if (mx >= b1x && mx <= b1x + btnW && my >= b2y && my <= b2y + btnH) {
                    this.state.corruption = Math.min(100, this.state.corruption + 10);
                    this.events.emit('play_sound', 'click');
                    this.createFloatingText(mx, my, "+10% COR", "#f00");
                    return;
                }

                // PAUSE/RESUME
                const b3y = b2y + btnH + gap;
                if (mx >= b1x && mx <= b1x + btnW && my >= b3y && my <= b3y + btnH) {
                    this.state.corruptionPaused = !this.state.corruptionPaused;
                    this.events.emit('play_sound', 'click');
                    const txt = this.state.corruptionPaused ? "PAUSED" : "RESUMED";
                    const col = this.state.corruptionPaused ? "#f00" : "#0f0";
                    this.createFloatingText(mx, my, txt, col);
                    return;
                }

                currentY = b3y + btnH + gap;
            }

            // --- AUTO BUY CONTROLS ---
            if (hasAutoBuy) {
                const b4x = px + 10;
                const b4y = currentY;

                if (mx >= b4x && mx <= b4x + btnW && my >= b4y && my <= b4y + btnH) {
                    this.state.autoBuyEnabled = !this.state.autoBuyEnabled;
                    this.events.emit('play_sound', 'click');
                    const txt = this.state.autoBuyEnabled ? "AUTO: ON" : "AUTO: OFF";
                    this.createFloatingText(mx, my, txt, "#0f0");
                    return;
                }
            }
        }

        if (this.gameState !== 'PLAYING') return;

        // Mouse updated above

        // --- THEME MECHANICS: INPUT ---
        const theme = this.themeManager.currentTheme;
        const mechanics = theme.mechanics || {};

        // 1. Beta Build: Input Lag (Failure)
        if (mechanics.inputLag) {
            // 20% chance to ignore click
            if (Math.random() < 0.2) {
                // Visual feedback for missed click?
                this.createFloatingText(mx, my, "MISS", "#888");
                return;
            }
        }

        // 2. Server Farm: Overheating
        if (mechanics.overheat) {
            this.state.temperature = Math.min(100, this.state.temperature + 5);
            if (this.state.temperature >= 100) {
                this.state.throttled = true;
                this.throttleTimer = 3.0; // 3 seconds penalty
            }
        }

        // 0.1 Handle Entity/Glitch Clicks
        if (this.glitchSystem.handleClick(mx, my)) return;
        if (this.collectionSystem.checkClick(mx, my)) return;

        // 1. Popups
        let popupHit = false;
        const popups = this.entities.getAll('ui');
        for (let p of popups) {
            const res = p.checkClick(mx, my);
            if (res) {
                popupHit = true;
                if (res === 'bonus') {
                    this.state.addScore(this.state.autoRate * 20 + 500);
                    this.createParticles(mx, my, this.themeManager.currentTheme.colors.accent);
                    this.events.emit('play_sound', 'buy');
                } else if (res === 'drag') {
                    this.uiManager.startDrag(p, mx, my);
                } else {
                    this.events.emit('play_sound', 'click');
                }
            }
        }
        if (popupHit) return;

        // 2. Shop & Main Button checks delegated to EconomySystem
        if (this.economySystem.handleClick(mx, my)) return;



        // 4. DESTRUCTION OF FAKE UI
        // Restriction: Only works in Rainbow Paradise
        if (this.themeManager.currentTheme.id === 'rainbow_paradise') {
            let hitUI = false;
            // Iterate backwards to hit top elements first (buttons are added last)
            for (let i = this.fakeUI.elements.length - 1; i >= 0; i--) {
                const el = this.fakeUI.elements[i];
                if (el.active && mx > el.x && mx < el.x + el.w && my > el.y && my < el.y + el.h) {

                    // Global restriction: Needs 60 Corruption to interact
                    if (this.state.corruption < 60) {
                        this.events.emit('play_sound', 'error');
                        this.createFloatingText(mx, my, "Need 60 happiness", "#888");
                        return;
                    }

                    if (el.locked) {
                        this.events.emit('play_sound', 'error');
                        this.createFloatingText(mx, my, "LOCKED", "#888");
                        // Stop propagation (don't click elements underneath)
                        return;
                    }

                    hitUI = true;
                    // Damage UI logic moved to CrazyFakes class partly, but effect logic here
                    const destroyed = this.fakeUI.damage(el);

                    // Spawn debris
                    for (let j = 0; j < 3; j++) {
                        this.entities.add('debris', new Debris(mx, my, el.color));
                    }

                    if (destroyed) {
                        // Big debris explosion
                        for (let j = 0; j < 15; j++) {
                            this.entities.add('debris', new Debris(el.x + el.w / 2, el.y + el.h / 2, el.color));
                        }
                        this.state.addScore(100 * this.state.multiplier);
                        this.state.addCorruption(1.5);
                    }

                    // Stop propagation after hitting one element
                    break;
                }
            }

            if (hitUI) {
                this.shake = 3;


                this.events.emit('play_sound', 'glitch');
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
        this.entities.add('particles', new FloatingText(x, y, text, color));
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

        // Track Playtime
        this.state.totalPlayTime += dt;
        this.lastTime = t;

        if (this.gameState !== 'PLAYING' && this.gameState !== 'BIOS' && this.gameState !== 'ENDING' && !this.state.crashed && !this.state.rebooting) {
            // Still draw even if paused, just don't update
            this.draw();
            this.input.update(); // Update input even when paused to prevent stuck keys
            requestAnimationFrame((t) => this.loop(t));
            return;
        }

        // Cap dt to avoid huge jumps on lag
        const safeDt = Math.min(dt, 0.1);

        this.themeManager.update(safeDt);
        this.uiManager.update(safeDt);
        this.tutorialSystem.update(safeDt);
        this.update(safeDt);
        this.draw();

        this.input.update(); // Update input at end of frame

        requestAnimationFrame((t) => this.loop(t));
    }

    /**
     * Updates game logic.
     * @param {number} dt - Delta time in seconds.
     */
    update(dt) {
        if (this.gameState === 'ENDING') {
            this.endingSequence.update(dt);
            return;
        }

        this.handleGlobalInput();

        // Update Virtual Controls Context
        if (this.virtualControls && this.virtualControls.active) {
            let context = 'none';
            if (this.gameState === 'BIOS') {
                context = 'bios';
            } else if (this.gameState === 'SETTINGS' || this.gameState === 'PAUSED') {
                context = 'menu';
            } else if (this.gameState === 'PLAYING') {
                // Check minigames
                const snake = this.uiManager.windowManager.windows.find(el => el instanceof MinigameWindow && el.active && el.title === "SNAKE.EXE");
                if (snake) {
                    context = 'snake';
                }
            }
            this.virtualControls.setContext(context);
        }

        // BIOS Logic Gate: Only process input and return
        if (this.gameState === 'BIOS') {
            return;
        }

        // Glitch System Logic (Lag, Crashes, Spawning)
        this.glitchSystem.update(dt);

        // Stop updates if crashed
        if (this.state.falseCrash || this.state.crashed || this.state.rebooting) return;

        this.economySystem.update(dt);
        this.collectionSystem.update(dt);
        this.achievementSystem.update(dt);
        this.tutorialSystem.update(dt);
        // 5. Update Timer
        this.state.timer += dt;

        this.state.timer += dt;

        // --- THEME MECHANICS: UPDATE ---
        const mechanics = this.themeManager.currentTheme.mechanics || {};

        if (mechanics.overheat && this.state.temperature > 0) {
            this.state.temperature = Math.max(0, this.state.temperature - dt * 15); // Decay
        }

        if (this.state.throttled) {
            this.throttleTimer -= dt;
            if (this.throttleTimer <= 0) {
                this.state.throttled = false;
                this.state.temperature = 50; // Cool down to half
            }
        }

        // Mail Notification Logic (e.g. flashing icon) can go here if needed
        // For now, mail checks are interval-based in MailSystem constructor


        // Crash Logic handled by GlitchSystem
        // Theme Transition & Mechanics handled by Manager
        this.themeManager.update(dt);
        this.triggerLevelCollapse();

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
            metaUpgrades: this.metaUpgrades,
            glitchData: this.glitchData,
            selectedBIOSIndex: this.selectedBIOSIndex,
            shopOpen: this.economySystem.shopOpen,
            activeHighlightTarget: this.tutorialSystem.activeHighlightTarget,
            biosState: this.biosState,
            lastBiosAdTime: this.lastBiosAdTime
        };

        const entities = {
            fakeUI: this.fakeUI,
            upgrades: this.themeManager.upgrades,
            debris: this.entities.getAll('debris'),
            particles: this.entities.getAll('particles'),
            popups: this.entities.getAll('ui'),
            captchas: [], // Captchas and hunter are now in generic 'enemies' list
            hunter: null,
            loreFiles: this.entities.getAll('items'),
            enemies: this.entities.getAll('enemies'),
            fakeCursor: this.glitchSystem.fakeCursor,
            clippy: this.clippy
        };

        this.renderer.draw(this.state, entities, inputData, this.uiManager);

        if (this.gameState === 'ENDING') {
            this.endingSequence.draw(this.renderer.ctx);
        }
    }

}
