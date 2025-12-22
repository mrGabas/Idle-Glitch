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
            this.upgrades = this.currentTheme.upgrades.map(u => ({ ...u, count: 0, cost: u.baseCost, isBroken: false }));

            // If we have saved data, restore counts and costs
            if (savedData && savedData.upgrades) {
                savedData.upgrades.forEach(savedUpgrade => {
                    const upgrade = this.upgrades.find(u => u.id === savedUpgrade.id);
                    if (upgrade) {
                        upgrade.count = savedUpgrade.count;
                        // Restore broken state
                        upgrade.isBroken = savedUpgrade.isBroken || false;

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
                count: u.count,
                isBroken: u.isBroken
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


        // Reset Destruction State
        this.game.state.mainButtonBroken = false;
        this.game.state.mainButtonPhysics = null;
        this.game.state.bgBroken = false;
        this.game.state.bgLayerPhysics = null;
        this.game.state.hudBroken = [false, false, false, false, false];

        // NEW: UI Physics Reset
        this.game.state.scorePhysics = null;
        this.game.state.barPhysics = null;
        this.game.state.sidebarPhysics = null;
        this.game.state.vignettePhysics = null;
        this.game.state.hudPhysics = [null, null, null, null, null]; // Sparse array for 5 icons

        // Also reset debris? Usually they life-out naturally.
        // Reset trigger flag (Game Logic should handle when it comes back on)
        // this.game.canTriggerDestruction = false; // Managed by Game.js loop usually

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
            // SPECIAL: Rainbow Paradise handled by Game.js (Collapse Event)
            if (currentId === 'rainbow_paradise') {
                return;
            }

            const currentIndex = THEME_ORDER.indexOf(currentId);
            if (currentIndex !== -1 && currentIndex < THEME_ORDER.length - 1) {
                // Transition to next theme
                const nextThemeId = THEME_ORDER[currentIndex + 1];
                this.switchTheme(nextThemeId);
            } else if (currentId === 'null_void' && !state.crashed && !state.rebooting && this.game.gameState !== 'ENDING') {
                // Check if we've already seen the ending
                if (state.endingSeen) {
                    // Standard Crash behavior (Prestige loop)
                    this.triggerCrash();
                } else {
                    // First time? Trigger True Ending
                    this.game.gameState = 'ENDING';
                    try {
                        this.game.endingSequence.start();
                    } catch (e) {
                        console.error("THEME MANAGER: Error starting EndingSequence:", e);
                    }
                }
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
