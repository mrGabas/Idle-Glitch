/**
 * THEME MANAGER
 * Handles theme transitions, glitch intensity calculations, and theme-specific mechanics.
 */

import { THEMES, THEME_ORDER } from '../data/themes.js';
import { Popup } from '../ui/windows.js';

export class ThemeManager {
    constructor(game) {
        this.game = game;
        this.currentTheme = THEMES.rainbow_paradise;
        this.upgrades = [];

        // Initialize upgrades for the default theme
        this.loadThemeUpgrades();
    }

    loadThemeUpgrades(savedData = null) {
        if (this.currentTheme && this.currentTheme.upgrades) {
            this.upgrades = this.currentTheme.upgrades.map(u => ({ ...u, count: 0, cost: u.baseCost }));

            // If we have saved data, restore counts and costs
            if (savedData && savedData.upgrades) {
                savedData.upgrades.forEach(savedUpgrade => {
                    const upgrade = this.upgrades.find(u => u.id === savedUpgrade.id);
                    if (upgrade) {
                        upgrade.count = savedUpgrade.count;
                        // Recalculate cost: base * (1.4 ^ count)
                        upgrade.cost = upgrade.baseCost;
                        for (let i = 0; i < upgrade.count; i++) {
                            upgrade.cost = Math.floor(upgrade.cost * 1.4);
                        }
                    }
                });
            }
        } else {
            this.upgrades = [];
        }
    }

    getSaveData() {
        return {
            upgrades: this.upgrades.map(u => ({
                id: u.id,
                count: u.count
            }))
        };
    }

    setTheme(id, silent = false) {
        if (THEMES[id]) {
            this.currentTheme = THEMES[id];
            this.loadThemeUpgrades();
            if (this.game.fakeUI) this.game.fakeUI.init(this.game.w, this.game.h);
            if (!silent) this.game.events.emit('theme_changed', id);
        }
    }

    switchTheme(newThemeId) {
        this.setTheme(newThemeId);

        // Reset corruption for the new theme
        this.game.state.corruption = 0;

        // Boot Sequence Lore
        if (this.currentTheme.bootSequence && this.game.uiManager && this.game.uiManager.chat) {
            this.currentTheme.bootSequence.forEach((msg, index) => {
                setTimeout(() => {
                    this.game.uiManager.chat.addMessage('SYS_CORE', msg);
                }, index * 1200 + 500); // Slight initial delay + stagged lines
            });
        }

        // Flash effect
        const flash = document.createElement('div');
        flash.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:#fff;z-index:999;transition:opacity 2s;';
        document.body.appendChild(flash);
        setTimeout(() => { flash.style.opacity = '0'; setTimeout(() => flash.remove(), 2000); }, 100);
    }

    update(dt) {
        const currentId = this.currentTheme.id;
        const state = this.game.state;

        // Dynamic Glitch Intensity based on Corruption
        // Dynamic Glitch Intensity based on Corruption
        let baseIntensity = 0.2 + (state.corruption / 100) * 0.6;

        // Custom Intensity Tweaks
        if (currentId === 'rainbow_paradise') baseIntensity = Math.max(0, (state.corruption - 30) / 70);

        state.glitchIntensity = baseIntensity;

        // Theme Transition Logic
        if (state.corruption >= 100) {
            const currentIndex = THEME_ORDER.indexOf(currentId);
            if (currentIndex !== -1 && currentIndex < THEME_ORDER.length - 1) {
                // Transition to next theme
                const nextThemeId = THEME_ORDER[currentIndex + 1];
                this.switchTheme(nextThemeId);
            } else if (currentId === 'null_void' && !state.crashed && !state.rebooting) {
                // End of the line
                this.triggerCrash();
            }
        }

        // --- THEME SPECIFIC UPDATE MECHANICS ---

        // Corporate Network: Boring Popups handled in GlitchSystem

        // Server Farm: Overheating decay?
        // Server Farm: Overheating decay in Game.js
    }

    triggerCrash() {
        this.game.state.crashed = true;
        this.game.gameState = 'CRASH';
        this.game.rebootTimer = 3.0; // 3 seconds BSOD
        this.game.events.emit('play_sound', 'bsod_error');
    }

    reset() {
        // Reset to default theme silently to avoid triggering audio before BIOS
        this.setTheme('rainbow_paradise', true);
    }
}
