/**
 * UI Manager
 * Handles HTML Overlays and high-level Canvas UI windows
 */
import { NotepadWindow, MailWindow } from '../ui/windows.js';

export class UIManager {
    constructor(game) {
        this.game = game;
        this.windows = []; // Active windows (Mail, Notepad)
        this.hud = {
            // Placeholders for HTML references
            score: document.getElementById('score-display'),
            corruption: document.getElementById('corruption-bar'),
        };

        this.activeScreen = null; // 'settings', 'pause', etc.
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
        // Assuming Audio engine is accessible via Game or we need to add it
        // this.game.audio... (need to ensure Game has audio)
    }

    startGame() {
        this.game.setMode('PLAYING');
        this.setScreen(null); // Hide all
    }

    togglePause() {
        if (this.game.mode === 'PLAYING') {
            this.game.setMode('PAUSED');
            this.setScreen('pause-menu');
        } else if (this.game.mode === 'PAUSED') {
            this.game.setMode('PLAYING');
            this.setScreen(null);
        }
    }

    openSettings(fromIds) {
        this.returnScreenId = fromIds;
        this.game.setMode('SETTINGS');
        this.setScreen('settings-menu');
    }

    closeSettings() {
        if (this.returnScreenId === 'start-menu') {
            this.game.setMode('MENU');
            this.setScreen('start-menu');
        } else {
            this.game.setMode('PAUSED');
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
}
