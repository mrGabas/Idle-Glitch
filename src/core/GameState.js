/**
 * Game State Manager
 * Uses Observer/Event pattern for reactivity.
 */

export class GameState {
    constructor() {
        this.data = {
            score: 0,
            clickPower: 1,
            autoRate: 0,
            corruption: 0,
            multiplier: 1.0,
            startTime: Date.now(),
            glitchIntensity: 0,
            crashed: false,
            rebooting: false,
            meta: {} // Persistent meta data
        };

        this.listeners = {}; // event -> [callbacks]
    }

    // --- Event System ---

    on(event, callback) {
        if (!this.listeners[event]) this.listeners[event] = [];
        this.listeners[event].push(callback);
    }

    emit(event, payload) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(cb => cb(payload));
        }
    }

    // --- State Mutators ---

    /**
     * Add score properly
     * @param {number} amount 
     */
    addScore(amount) {
        if (this.data.crashed || this.data.rebooting) return;
        this.data.score += amount;
        this.emit('score_changed', this.data.score);
    }

    /**
     * Modify corruption level
     * @param {number} amount 
     */
    addCorruption(amount) {
        this.data.corruption = Math.max(0, Math.min(100, this.data.corruption + amount));
        this.emit('corruption_changed', this.data.corruption);
        this.emit('glitch_intensity_update', this.data.corruption / 100);

        if (this.data.corruption >= 100 && !this.data.crashed) {
            this.setCrash(true);
        }
    }

    setCrash(isCrashed) {
        this.data.crashed = isCrashed;
        this.emit('crash_state_changed', isCrashed);
    }

    serialize() {
        return JSON.stringify(this.data);
    }

    deserialize(json) {
        try {
            const loaded = JSON.parse(json);
            // Merge carefully
            this.data = { ...this.data, ...loaded };
        } catch (e) {
            console.error("Failed to load save", e);
        }
    }
}
