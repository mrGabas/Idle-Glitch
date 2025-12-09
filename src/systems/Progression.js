/**
 * PROGRESSION SYSTEM
 * Handles theme transitions, difficulty scaling, and game stages
 * @module systems/Progression
 */
import { Popup } from '../ui/windows.js';

export class ProgressionSystem {
    constructor(game) {
        this.game = game;
    }

    update(dt) {
        const game = this.game;
        const state = game.state;

        // Crash Logic
        if (state.crashed) {
            game.rebootTimer -= dt;
            if (game.rebootTimer <= 0) {
                state.crashed = false;
                state.rebooting = true;
                game.rebootTimer = 5.0; // 5s BIOS
            }
            return;
        }

        if (state.rebooting) {
            game.rebootTimer -= dt;
            if (game.rebootTimer <= 0) {
                game.hardReset();
            }
            return;
        }

        // Theme Transition & Mechanics
        const tId = game.currentTheme.id;

        // 1. Rainbow -> Ad Purgatory
        if (tId === 'rainbow_paradise') {
            state.glitchIntensity = Math.max(0, (state.corruption - 30) / 70);
            if (state.corruption >= 100) game.switchTheme('ad_purgatory');
        }
        // 2. Ad Purgatory -> Digital Decay
        else if (tId === 'ad_purgatory') {
            state.glitchIntensity = 0.2 + (state.corruption / 100) * 0.3;
            if (state.corruption >= 100) game.switchTheme('digital_decay');

            // AD MECHANIC: Aggressive Popups
            if (Math.random() < 0.02 + (state.corruption * 0.001)) {
                if (game.popups.length < 15) game.popups.push(new Popup(game.w, game.h));
            }
        }
        // 3. Digital Decay -> Legacy System
        else if (tId === 'digital_decay') {
            state.glitchIntensity = 0.4 + (state.corruption / 100) * 0.4;
            if (state.corruption >= 100) game.switchTheme('legacy_system');
        }
        // 4. Legacy System -> Null Void
        else if (tId === 'legacy_system') {
            state.glitchIntensity = 0.6 + (state.corruption / 100) * 0.4;
            // Scanline effect is handled in Renderer
            if (state.corruption >= 100) game.switchTheme('null_void');
        }
        // 5. Null Void -> CRASH
        else if (tId === 'null_void') {
            state.glitchIntensity = 0.8 + (state.corruption / 100) * 0.2;
            if (state.corruption >= 100) game.triggerCrash();
        }

        // Random Glitch Popups (Global mechanic)
        if (Math.random() < 0.001 + (state.glitchIntensity * 0.02)) {
            if (game.popups.length < 5) game.popups.push(new Popup(game.w, game.h));
        }
    }
}
