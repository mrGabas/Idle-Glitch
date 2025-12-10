/**
 * Glitch System
 * Handles Corruption, RNG Events, Fake UI, and BSOD
 */
import { UTILS } from '../data/config.js';
import { Debris } from '../entities/particles.js';

export class GlitchSystem {
    constructor(game) {
        this.game = game;
        this.state = game.state;
        this.rngTimer = 0;
    }

    update(dt) {
        if (this.state.data.crashed) return;

        // Passive Corruption
        // Defined in theme or config
        // For now, let's say minimal passive accumulation

        this.handleRNG(dt);
    }

    handleRNG(dt) {
        this.rngTimer -= dt;
        if (this.rngTimer <= 0) {
            this.rngTimer = UTILS.rand(5, 15);
            this.triggerEvent();
        }
    }

    triggerEvent() {
        // Decide event based on corruption level
        const corruption = this.state.data.corruption;

        if (corruption > 50 && Math.random() < 0.3) {
            // Trigger Glitch Popup or Entity
            // this.game.entityManager.add('ui', new GlitchPopup(...))
            console.log("Random Glitch Event Triggered");
            this.game.events.emit('glitch_event', 'random');
        }
    }

    triggerBSOD() {
        this.state.setCrash(true);
        this.game.audio.play('error');
        // Additional cleanup/setup for BSOD screen
    }
}
