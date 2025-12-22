/**
 * GAME STATE MANAGER
 * Centralized state with event emission
 * @module core/GameState
 */

import { events } from './events.js';
import { UTILS } from './config.js';

export class GameState {
    constructor() {
        /** @type {number} Current currency amount */
        this._score = 0;
        /** @type {number} Currency per click */
        this.clickPower = 1;
        /** @type {number} Currency generated per second */
        this.autoRate = 0;
        /** @type {number} Global corruption level (0-100) */
        this.corruption = 0;
        /** @type {number} Prestige multiplier applied to gains */
        this.multiplier = 1;
        /** @type {number} Corruption gain reduction (0.0 to 1.0) */
        this.corruptionResistance = 0;

        // Session State
        /** @type {number} Timestamp when the current session started */
        this.startTime = Date.now();
        /** @type {number} Intensity of visual glitches (0.0 to 1.0) */
        this.glitchIntensity = 0;

        // Flags
        /** @type {boolean} Whether the game is currently showing a BSOD */
        this.crashed = false;
        /** @type {boolean} Whether the game is in the reboot sequence */
        this.rebooting = false;
        /** @type {boolean} Whether a fake crash is active */
        this.falseCrash = false;
        /** @type {number} Timer for the crash effect */
        this.crashTimer = 0;

        // Mechanics State
        /** @type {number} System temperature (0-100) for Server Farm */
        this.temperature = 0;
        /** @type {boolean} Whether click power is currently throttled */
        this.throttled = false;

        // Statistics
        /** @type {number} Cumulative manual clicks */
        this.totalClicks = 0;
        /** @type {number} Cumulative time played in seconds */
        this.totalPlayTime = 0;
        /** @type {number} Highest score in Snake */
        this.snakeHighScore = 0;
        /** @type {number} Number of hacks/passwords solved */
        this.hacksSolved = 0;

        // System Purge State
        /** @type {boolean} Whether the system is currently purged (debuffed) */
        this.isPurged = false;
        /** @type {number} Timer for the purge debuff */
        this.purgeTimer = 0;

        // Toggles
        this.corruptionPaused = false;
        this.autoBuyEnabled = true;

        /** @type {boolean} Whether the player has seen the true ending */
        this.endingSeen = false;
        /** @type {boolean} Whether the post-game congratulatory message has been shown */
        this.congratsShown = false;

        // Overclock State
        /** @type {number} Timestamp when overclock effect ends */
        this.overclockEndTime = 0;
        /** @type {number} Current overclock multiplier (1 or 2 typically) */
        this.overclockMultiplier = 1;
    }

    get score() {
        return this._score;
    }

    set score(val) {
        this._score = Math.max(0, val);
    }

    /**
     * Increases the player's score by the specified amount.
     * @param {number} amount - The amount of currency to add.
     */
    addScore(amount) {
        if (isNaN(amount)) return;
        this.score += amount;
        events.emit('score_gained', amount);
        events.emit('state_updated', this); // Generic update for UI
    }

    /**
     * Modifies the corruption level, clamping it between 0 and 100.
     * @param {number} amount - The amount to change corruption by (can be negative).
     */
    addCorruption(amount) {
        if (this.corruptionPaused && amount > 0) return; // Paused

        if (amount > 0 && this.corruptionResistance > 0) {
            amount *= (1 - this.corruptionResistance);
        }
        this.corruption = Math.max(0, Math.min(100, this.corruption + amount));
        events.emit('corruption_changed', this.corruption);
        events.emit('state_updated', this);
    }

    /**
     * Sets the corruption level directly.
     * @param {number} val - The new corruption percentage (0-100).
     */
    setCorruption(val) {
        this.corruption = Math.max(0, Math.min(100, val));
        events.emit('corruption_changed', this.corruption);
        events.emit('state_updated', this);
    }

    /**
     * Sets the global prestige multiplier.
     * @param {number} val - The new multiplier value.
     */
    setMultiplier(val) {
        this.multiplier = val;
        events.emit('multiplier_changed', this.multiplier);
        events.emit('state_updated', this);
    }

    /**
     * Sets the click power (currency per click).
     * @param {number} val - The new click power.
     */
    setClickPower(val) {
        this.clickPower = val;
        events.emit('state_updated', this);
    }

    /**
     * Sets the auto-production rate.
     * @param {number} val - The new currency per second.
     */
    setAutoRate(val) {
        this.autoRate = val;
        events.emit('state_updated', this);
    }

    /**
     * Resets the current session state (score, corruption) but keeps meta-progression.
     */
    resetSession() {
        this.score = 0;
        this.clickPower = 1;
        this.autoRate = 0;
        this.autoRate = 0;
        this.corruption = 0;
        // Keep resistance active if set by meta upgrades
        // this.corruptionResistance = 0; 
        this.startTime = Date.now();
        this.glitchIntensity = 0;
        this.crashed = false;
        this.rebooting = false;
        this.falseCrash = false;
        this.falseCrash = false;
        this.crashTimer = 0;
        this.crashTimer = 0;
        this.temperature = 0;
        this.throttled = false;
        // Do not reset cumulative stats on session reset usually, 
        // but if this is PRESTIGE, we might want to keep them?
        // Usually achievements persist across prestiges.
        // GameState.resetSession() is called on Prestige. 
        // If these are "Lifetime" stats, we should NOT reset them here.
        // Leaving them alone.

        this.isPurged = false;
        this.purgeTimer = 0;
        events.emit('state_reset', this);
    }

    // --- ARCHIVE METHODS ---

    /**
     * Exports current state to a JSON-serializable object.
     */
    export() {
        return {
            score: this.score,
            clickPower: this.clickPower,
            autoRate: this.autoRate,
            corruption: this.corruption,
            multiplier: this.multiplier,
            startTime: this.startTime,
            isPurged: this.isPurged,
            temperature: this.temperature,
            // Stats
            totalClicks: this.totalClicks,
            totalPlayTime: this.totalPlayTime,
            snakeHighScore: this.snakeHighScore,
            totalPlayTime: this.totalPlayTime,
            snakeHighScore: this.snakeHighScore,
            hacksSolved: this.hacksSolved,
            hacksSolved: this.hacksSolved,
            endingSeen: this.endingSeen,
            congratsShown: this.congratsShown,
            overclockEndTime: this.overclockEndTime
        };
    }

    /**
     * Imports state from a data object.
     * @param {Object} data 
     */
    import(data) {
        if (!data) return;
        this.score = data.score || 0;
        this.clickPower = data.clickPower || 1;
        this.autoRate = data.autoRate || 0;
        this.corruption = data.corruption || 0;
        this.multiplier = data.multiplier || 1;
        this.startTime = data.startTime || Date.now();
        this.isPurged = data.isPurged || false;
        this.temperature = data.temperature || 0;

        this.totalClicks = data.totalClicks || 0;
        this.totalPlayTime = data.totalPlayTime || 0;
        this.snakeHighScore = data.snakeHighScore || 0;
        this.snakeHighScore = data.snakeHighScore || 0;
        this.hacksSolved = data.hacksSolved || 0;
        this.hacksSolved = data.hacksSolved || 0;
        this.endingSeen = data.endingSeen || false;
        this.congratsShown = data.congratsShown || false;
        this.overclockEndTime = data.overclockEndTime || 0;

        events.emit('state_updated', this);
    }
}
