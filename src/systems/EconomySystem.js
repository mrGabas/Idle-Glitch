/**
 * Economy System
 * Handles Score, Clicking, Auto-generation, Offline Progress
 */
import { UTILS, CFG } from '../data/config.js';

export class EconomySystem {
    constructor(state, events) {
        this.state = state;
        this.events = events;

        // Listeners
        this.events.on('click_main', () => this.handleClick());
    }

    update(dt) {
        this._handleAutoProduction(dt);
    }

    _handleAutoProduction(dt) {
        if (this.state.data.autoRate > 0) {
            const amount = this.state.data.autoRate * dt;
            this.state.addScore(amount);
        }
    }

    handleClick() {
        let gain = this.state.data.clickPower;

        // Critical Hit Logic (can be extracted to separate calculator if complex)
        // For now, simple implementation
        if (this.state.data.meta['critical_click']) {
            const chance = this.state.data.meta['critical_click'] * 0.1;
            if (Math.random() < chance) {
                gain *= 5;
                this.events.emit('spawn_critical', gain); // For visuals
            }
        }

        gain *= this.state.data.multiplier;
        this.state.addScore(gain);
        this.events.emit('score_gained_manual', gain);
    }

    // Offline Progress
    checkOffline(lastSaveTime) {
        const now = Date.now();
        const diff = (now - lastSaveTime) / 1000;

        if (diff > CFG.OFFLINE_PROGRESS_MIN_TIME) {
            if (this.state.data.meta['offline_progress']) {
                const gained = this.state.data.autoRate * diff * 0.25; // 25% efficiency
                if (gained > 0) {
                    this.state.addScore(gained);
                    return gained;
                }
            }
        }
        return 0;
    }
}
