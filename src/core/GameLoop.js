/**
 * Game Loop
 * Handles the main requestAnimationFrame cycle and fixed timesteps.
 */
import { CFG } from '../data/config.js';

export class GameLoop {
    constructor(game) {
        this.game = game;
        this.running = false;
        this.lastTime = 0;
        this.accumulator = 0;
        this.step = 1 / CFG.FPS;
        this.rafId = null;
    }

    start() {
        if (this.running) return;
        this.running = true;
        this.lastTime = performance.now();
        this.rafId = requestAnimationFrame((t) => this.loop(t));
    }

    stop() {
        this.running = false;
        if (this.rafId) cancelAnimationFrame(this.rafId);
    }

    loop(timestamp) {
        if (!this.running) return;

        const deltaTime = (timestamp - this.lastTime) / 1000;
        this.lastTime = timestamp;

        // Prevent spiral of death on lag spikes
        if (deltaTime > 0.25) {
            this.rafId = requestAnimationFrame((t) => this.loop(t));
            return;
        }

        this.accumulator += deltaTime;

        while (this.accumulator >= this.step) {
            this.game.update(this.step);
            this.accumulator -= this.step;
        }

        this.game.draw(this.accumulator / this.step); // Interpolation alpha

        this.rafId = requestAnimationFrame((t) => this.loop(t));
    }
}
