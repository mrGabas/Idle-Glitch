/**
 * AUDIO ENGINE
 * @module core/audio
 */
import { UTILS } from './config.js';
import { events } from './events.js';

export class SoundEngine {
    constructor() {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.master = this.ctx.createGain();
        this.master.gain.value = 0.5; // Master volume
        this.master.connect(this.ctx.destination);

        // SFX Channel
        this.sfxGain = this.ctx.createGain();
        this.sfxGain.gain.value = 0.5;
        this.sfxGain.connect(this.master);

        // Music Channel
        this.musicGain = this.ctx.createGain();
        this.musicGain.gain.value = 0.5;
        this.musicGain.connect(this.master);

        this.enabled = false;

        // Event Subscription
        events.on('play_sound', (type) => this.play(type));
    }

    resume() {
        if (!this.enabled) {
            this.ctx.resume();
            this.enabled = true;
        }
    }

    setSFXVolume(val) {
        this.sfxGain.gain.value = Math.max(0, Math.min(1, val));
    }

    setMusicVolume(val) {
        this.musicGain.gain.value = Math.max(0, Math.min(1, val));
    }

    play(type) {
        if (!this.enabled) return;
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();

        // Connect to SFX channel
        osc.connect(g);
        g.connect(this.sfxGain);

        if (type === 'click') {
            // Pleasant click
            osc.type = 'sine';
            osc.frequency.setValueAtTime(600, t);
            osc.frequency.exponentialRampToValueAtTime(100, t + 0.1);
            g.gain.setValueAtTime(0.5, t);
            g.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
            osc.start(t); osc.stop(t + 0.1);
        }
        else if (type === 'buy') {
            // Success (8-bit coin)
            osc.type = 'square';
            osc.frequency.setValueAtTime(440, t);
            osc.frequency.setValueAtTime(880, t + 0.1);
            g.gain.setValueAtTime(0.1, t);
            g.gain.linearRampToValueAtTime(0, t + 0.2);
            osc.start(t); osc.stop(t + 0.2);
        }
        else if (type === 'error') {
            // Windows error style
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(150, t);
            g.gain.setValueAtTime(0.5, t);
            g.gain.exponentialRampToValueAtTime(0.01, t + 0.3);
            osc.start(t); osc.stop(t + 0.3);
        }
        else if (type === 'glitch') {
            // Noise
            osc.type = 'sawtooth';
            // Random freq
            osc.frequency.setValueAtTime(UTILS.rand(50, 1000), t);
            // Sliding pitch
            osc.frequency.linearRampToValueAtTime(UTILS.rand(50, 1000), t + 0.2);
            g.gain.setValueAtTime(0.2, t);
            g.gain.linearRampToValueAtTime(0, t + 0.2);
            osc.start(t); osc.stop(t + 0.2);
        }
    }
}
