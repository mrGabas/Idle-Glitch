/**
 * THEME MANAGER
 * Handles theme transitions, glitch intensity calculations, and theme-specific mechanics.
 */

import { THEMES } from '../data/themes.js';
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
                        // Or iteratively to match EconomySystem exactly if needed, but power works if formula is consistent
                        // EconomySystem uses Math.floor(prev * 1.4).
                        // Let's re-simulate the cost increase to be safe and exact.
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

    setTheme(id) {
        if (THEMES[id]) {
            this.currentTheme = THEMES[id];
            this.loadThemeUpgrades();
            if (this.game.fakeUI) this.game.fakeUI.init(this.game.w, this.game.h);
        }
    }

    switchTheme(newThemeId) {
        this.setTheme(newThemeId);

        // Reset corruption for the new theme
        this.game.state.corruption = 0;

        // Flash effect
        const flash = document.createElement('div');
        flash.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:#fff;z-index:999;transition:opacity 2s;';
        document.body.appendChild(flash);
        setTimeout(() => { flash.style.opacity = '0'; setTimeout(() => flash.remove(), 2000); }, 100);

        // Re-init fake UI for new theme colors - handled in setTheme but good to be explicit if logic diverges
    }

    update(dt) {
        const tId = this.currentTheme.id;
        const state = this.game.state;

        // Theme Transition Logic & Glitch Intensity

        // 1. Rainbow -> Ad Purgatory
        if (tId === 'rainbow_paradise') {
            state.glitchIntensity = Math.max(0, (state.corruption - 30) / 70);
            if (state.corruption >= 100) this.switchTheme('ad_purgatory');
        }
        // 2. Ad Purgatory -> Dev Desktop
        else if (tId === 'ad_purgatory') {
            state.glitchIntensity = 0.2 + (state.corruption / 100) * 0.2;
            if (state.corruption >= 100) this.switchTheme('dev_desktop');

            // AD MECHANIC: Aggressive Popups
            if (Math.random() < 0.02 + (state.corruption * 0.001)) {
                if (this.game.entities.getAll('ui').length < 15) {
                    this.game.entities.add('ui', new Popup(this.game.w, this.game.h, this.currentTheme));
                }
            }
        }
        // 3. Dev Desktop -> Digital Decay
        else if (tId === 'dev_desktop') {
            state.glitchIntensity = 0.3 + (state.corruption / 100) * 0.2;
            if (state.corruption >= 100) this.switchTheme('digital_decay');
        }
        // 4. Digital Decay -> Legacy System
        else if (tId === 'digital_decay') {
            state.glitchIntensity = 0.4 + (state.corruption / 100) * 0.4;
            if (state.corruption >= 100) this.switchTheme('legacy_system');
        }
        // 5. Legacy System -> Null Void
        else if (tId === 'legacy_system') {
            state.glitchIntensity = 0.6 + (state.corruption / 100) * 0.4;
            if (state.corruption >= 100) this.switchTheme('null_void');
        }
        // 6. Null Void -> CRASH
        else if (tId === 'null_void') {
            state.glitchIntensity = 0.8 + (state.corruption / 100) * 0.2;
            if (state.corruption >= 100 && !state.crashed && !state.rebooting) this.triggerCrash();
        }
    }

    triggerCrash() {
        this.game.state.crashed = true;
        this.game.gameState = 'CRASH';
        this.game.rebootTimer = 3.0; // 3 seconds BSOD
        this.game.events.emit('play_sound', 'error');
    }

    reset() {
        // Reset to default theme
        this.setTheme('rainbow_paradise');
    }
}
