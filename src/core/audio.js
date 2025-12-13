/**
 * AUDIO ENGINE
 * @module core/audio
 */
import { UTILS } from './config.js';
import { events } from './events.js';

export class SoundEngine {
    constructor() {
        this.ctx = null;
        this.master = null;
        this.sfxGain = null;
        this.musicGain = null;
        this.enabled = false;

        // Event Subscription
        events.on('play_sound', (type) => this.play(type));
    }

    init() {
        if (this.ctx) return;

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
    }

    resume() {
        // Strict Browser Policy: Context initialized only on user interaction (resume)
        if (!this.ctx) {
            this.init();
        }

        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
        this.enabled = true;
    }

    setSFXVolume(val) {
        if (this.sfxGain) {
            this.sfxGain.gain.value = Math.max(0, Math.min(1, val));
        }
    }

    setMusicVolume(val) {
        if (this.musicGain) {
            this.musicGain.gain.value = Math.max(0, Math.min(1, val));
        }
    }

    play(type) {
        // Guard: Context must be ready (initialized in resume())
        if (!this.ctx) return;
        if (!this.enabled) return;

        try {
            const t = this.ctx.currentTime;

            // Glitch Audio Logic
            let corruption = 0;
            if (window.game && window.game.state) {
                corruption = window.game.state.corruption || 0;
            }

            // Calculate audio degradation
            const chaosFactor = corruption / 100; // 0.0 to 1.0
            const detuneAmount = (Math.random() - 0.5) * (corruption * 25); // Pitch wobble
            const isVeryGlitchy = corruption > 80;
            const useHarshWaveform = Math.random() < chaosFactor;

            const osc = this.ctx.createOscillator();
            const g = this.ctx.createGain();

            // Apply general detune based on corruption
            osc.detune.value = detuneAmount;

            // Audio routing
            osc.connect(g);
            g.connect(this.sfxGain);

            if (type === 'click') {
                // Pleasant click -> Harsh mechanical clank
                osc.type = useHarshWaveform ? 'sawtooth' : 'sine';

                let freqStart = 600;
                let freqEnd = 100;
                let duration = 0.1;

                if (isVeryGlitchy) {
                    // Dying machine sound
                    freqStart = 300;
                    freqEnd = 50;
                    duration = 0.3; // Slower
                    osc.type = 'sawtooth'; // Always harsh
                    // Add some noise to frequency if possible, or just extreme drops
                    osc.frequency.setValueAtTime(freqStart, t);
                    osc.frequency.linearRampToValueAtTime(freqEnd, t + duration); // Linear sounds more mechanical/falling
                } else {
                    osc.frequency.setValueAtTime(freqStart, t);
                    osc.frequency.exponentialRampToValueAtTime(freqEnd, t + duration);
                }

                g.gain.setValueAtTime(0.5, t);
                g.gain.exponentialRampToValueAtTime(0.01, t + duration);

                osc.start(t); osc.stop(t + duration);
            }
            else if (type === 'buy') {
                // Success (8-bit coin) -> Distorted confirm
                osc.type = useHarshWaveform ? 'sawtooth' : 'square';

                let freq1 = 440;
                let freq2 = 880;
                let duration = 0.2;

                if (isVeryGlitchy) {
                    freq1 = 220; // Lower pitch
                    freq2 = 110; // Drop pitch instead of rise
                    duration = 0.4;
                }

                osc.frequency.setValueAtTime(freq1, t);
                // If glitchy, maybe slide down instead of up
                if (isVeryGlitchy) {
                    osc.frequency.linearRampToValueAtTime(freq2, t + duration);
                } else {
                    osc.frequency.setValueAtTime(freq2, t + 0.1);
                }

                g.gain.setValueAtTime(0.1, t);
                g.gain.linearRampToValueAtTime(0, t + duration);
                osc.start(t); osc.stop(t + duration);
            }
            else if (type === 'error') {
                // Windows error style
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(150 - (corruption), t); // Lower pitch with corruption
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
        } catch (e) {
            console.warn('Audio playback failed:', e);
        }
    }
}
