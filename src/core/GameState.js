/**
 * GAME STATE MANAGER
 * Centralized state with event emission
 * @module core/GameState
 */

import { events } from './events.js';
import { UTILS } from './config.js';

export class GameState {
    constructor() {
        // Persistent/Core State
        this.score = 0;
        this.clickPower = 1;
        this.autoRate = 0;
        this.corruption = 0;
        this.multiplier = 1;

        // Session State
        this.startTime = Date.now();
        this.glitchIntensity = 0;

        // Flags
        this.crashed = false;
        this.rebooting = false;
        this.falseCrash = false;
        this.crashTimer = 0;
    }

    /**
     * Add score (currency)
     * @param {number} amount 
     */
    addScore(amount) {
        if (isNaN(amount)) return;
        this.score += amount;
        events.emit('score_gained', amount);
        events.emit('state_updated', this); // Generic update for UI
    }

    /**
     * modify corruption
     * @param {number} amount 
     */
    addCorruption(amount) {
        this.corruption = Math.max(0, Math.min(100, this.corruption + amount));
        events.emit('corruption_changed', this.corruption);
        events.emit('state_updated', this);
    }

    setCorruption(val) {
        this.corruption = Math.max(0, Math.min(100, val));
        events.emit('corruption_changed', this.corruption);
        events.emit('state_updated', this);
    }

    setMultiplier(val) {
        this.multiplier = val;
        events.emit('multiplier_changed', this.multiplier);
        events.emit('state_updated', this);
    }

    setClickPower(val) {
        this.clickPower = val;
        events.emit('state_updated', this);
    }

    setAutoRate(val) {
        this.autoRate = val;
        events.emit('state_updated', this);
    }

    resetSession() {
        this.score = 0;
        this.clickPower = 1;
        this.autoRate = 0;
        this.corruption = 0;
        this.startTime = Date.now();
        this.glitchIntensity = 0;
        this.crashed = false;
        this.rebooting = false;
        this.falseCrash = false;
        this.crashTimer = 0;
        events.emit('state_reset', this);
    }
}
