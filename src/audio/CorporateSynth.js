/**
 * CorporateSynth
 * Procedural audio generator for 'Corporate Network' and 'Ad Purgatory'.
 * Creates a boring, uneasy office atmosphere with Muzak and AC hum.
 */
export class CorporateSynth {
    constructor(audioContext) {
        this.ctx = audioContext;
        this.masterGain = null;
        this.destination = null;
        this.nodes = [];
        this.isPlaying = false;

        this.timerID = null;

        // Whole Tone Scale (Dreamy/Unsettled) 
        // C, D, E, F#, G#, A#
        this.scale = [261.63, 293.66, 329.63, 369.99, 415.30, 466.16];
    }

    play() {
        if (this.isPlaying || !this.ctx) return;
        this.isPlaying = true;

        const dest = this.destination || this.ctx.destination;
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(0, this.ctx.currentTime);
        this.masterGain.gain.linearRampToValueAtTime(0.5, this.ctx.currentTime + 2);
        this.masterGain.connect(dest);

        // Start Layers
        this.startACUnit();
        this.scheduleNextNote();
        this.startClock();
    }

    startACUnit() {
        // Pink Noise approximation (White Noise + LowPass)
        const bufferSize = this.ctx.sampleRate * 2;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        let lastOut = 0;

        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            data[i] = (lastOut + (0.02 * white)) / 1.02; // Simple pinking filter
            lastOut = data[i];
            data[i] *= 3.5; // Compensate gain
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        noise.loop = true;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 300; // Deep rumble / Air

        const gain = this.ctx.createGain();
        gain.gain.value = 0.15; // Background level

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        noise.start();
        this.nodes.push(noise, filter, gain);
    }

    startClock() {
        // Ticking every second
        const tick = () => {
            if (!this.isPlaying) return;
            const t = this.ctx.currentTime;

            // Short burst of noise
            const osc = this.ctx.createOscillator();
            osc.type = 'square'; // or noise buffer, let's use tiny click
            osc.frequency.setValueAtTime(800, t); // High tick

            const gain = this.ctx.createGain();
            gain.gain.setValueAtTime(0.05, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

            osc.connect(gain);
            gain.connect(this.masterGain);

            osc.start(t);
            osc.stop(t + 0.05);

            this.clockTimer = setTimeout(tick, 1000);
        };
        tick();
    }

    scheduleNextNote() {
        if (!this.isPlaying) return;

        // FM Synth Note
        const playNote = () => {
            if (!this.isPlaying) return;
            const t = this.ctx.currentTime;

            // Random Note
            const freq = this.scale[Math.floor(Math.random() * this.scale.length)];

            // FM Synthesis
            // Carrier
            const carrier = this.ctx.createOscillator();
            carrier.type = 'sine';
            carrier.frequency.value = freq;

            // Modulator
            const modulator = this.ctx.createOscillator();
            modulator.type = 'sine';
            modulator.frequency.value = freq * 2.0; // Harmonic ratio

            const modGain = this.ctx.createGain();
            modGain.gain.value = 200; // Modulation Index depth

            // Envelope
            const env = this.ctx.createGain();
            env.gain.setValueAtTime(0, t);
            env.gain.linearRampToValueAtTime(0.2, t + 0.5); // Slow attack
            env.gain.exponentialRampToValueAtTime(0.01, t + 4.0); // Long decay (electric piano sustain)

            // Connections
            modulator.connect(modGain);
            modGain.connect(carrier.frequency); // FM Magic
            carrier.connect(env);
            env.connect(this.masterGain);

            carrier.start(t);
            modulator.start(t);
            carrier.stop(t + 4.5);
            modulator.stop(t + 4.5);

            // Store for glitching? (Optional, skipping tracking individual notes for simplicity unless glitch requested)
            // If glitch is requested, we'd need to track active carriers.
            // For now, let's keep it simple.
        };

        playNote();

        // Wait 3-5 seconds
        const wait = 3000 + Math.random() * 2000;
        this.timerID = setTimeout(() => this.scheduleNextNote(), wait);
    }

    glitch() {
        // Implement glitch effect if needed (detune global master or active nodes)
        // For simplicity, maybe wobble volume?
        if (this.masterGain) {
            const t = this.ctx.currentTime;
            this.masterGain.gain.cancelScheduledValues(t);
            this.masterGain.gain.setValueAtTime(0.5, t);
            this.masterGain.gain.linearRampToValueAtTime(0, t + 0.1);
            this.masterGain.gain.linearRampToValueAtTime(0.5, t + 0.2);
        }
    }

    stop() {
        this.isPlaying = false;
        if (this.timerID) clearTimeout(this.timerID);
        if (this.clockTimer) clearTimeout(this.clockTimer);

        if (this.masterGain) {
            const t = this.ctx.currentTime;
            try {
                this.masterGain.gain.cancelScheduledValues(t);
                this.masterGain.gain.linearRampToValueAtTime(0, t + 1);
            } catch (e) { }

            setTimeout(() => {
                this.nodes.forEach(n => {
                    try { n.stop(); n.disconnect(); } catch (e) { }
                });
                this.nodes = [];
                if (this.masterGain) this.masterGain.disconnect();
                this.masterGain = null;
            }, 1100);
        }
    }

    connect(node) {
        this.destination = node;
        if (this.masterGain) {
            this.masterGain.disconnect();
            this.masterGain.connect(node);
        }
    }
}
