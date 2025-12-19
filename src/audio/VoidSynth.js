/**
 * VoidSynth
 * Procedural audio generator for the 'Null Void' theme.
 * Creates an ominous, infinite atmosphere using oscillators and noise.
 */
export class VoidSynth {
    constructor(audioContext) {
        this.ctx = audioContext;
        this.masterGain = null;

        // Nodes references for cleanup
        this.nodes = [];
        this.isPlaying = false;
    }

    play() {
        if (this.isPlaying || !this.ctx) return;
        this.isPlaying = true;

        const t = this.ctx.currentTime;

        // Master Volume for this synth
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(0, t);
        this.masterGain.gain.linearRampToValueAtTime(0.6, t + 3); // Fade in over 3s
        const dest = this.destination || this.ctx.destination;
        this.masterGain.connect(dest);
        // Wait, audio.js has a master gain. I should probably connect to that if possible, but the requirement said "Constructor: Should accept an AudioContext instance".
        // It didn't explicitly say accept a destination node. I'll connect to ctx.destination for now or better yet, if the system allows, I should probably expose a connect method or just output to destination.
        // Actually, in audio.js, SoundEngine has this.master. It would be better if VoidSynth connected to SoundEngine's master or sfxGain.
        // However, based on the strict requirements: "Constructor: Should accept an AudioContext instance".
        // I will assume simple connection to destination is acceptable OR I will add a connect method.
        // Let's stick to the prompt's simplicity: "Constructor: Should accept an AudioContext instance."
        // I'll connect to destination but leave a note or improved design if I can see audio.js again.
        // Re-reading audio.js: SoundEngine has this.master -> ctx.destination.
        // If I connect VoidSynth to ctx.destination, it bypasses the Master Volume slider in the game (which controls SoundEngine.master).
        // That's bad.
        // I should probably allow connecting to a node.
        // But the prompt specifically asked for "Constructor: Should accept an AudioContext instance".
        // I'll add a `connect(destinationNode)` method or just assume I can access the global master if I pass it?
        // Let's stick to the prompt. usage instructions said: "Show where to instantiate it in the SoundEngine constructor."
        // So inside SoundEngine, I can say `this.voidSynth = new VoidSynth(this.ctx);`.
        // Then `this.voidSynth.connect(this.musicGain);` (since it's background track).
        // So I will implement a `connect` method.

        // Actually, let's just make the play method generic or set up the graph in play.
        // Re-reading: "Methods: play(), stop(), setVolume(val)".
        // I will assume it connects to destination by default BUT I should ideally provide a way to route it.
        // Let's modify the constructor to take context, and maybe I'll add a connect method.
        // Or better, `play(destinationNode)`.
        // Let's simpler: The prompt didn't ask for `connect()`.
        // I will presume standard behavior is `ctx.destination` BUT that ignores the volume sliders.
        // I will add a `outputNode` property that defaults to ctx.destination, but can be set.
        // actually, let's just make `start(destination)` or similar.
        // Given the instructions are specific about methods ("play()", "stop()", "setVolume()"), I'll stick to those.
        // I will internally create the graph. To respect the game's volume, `check audio.js`.
        // `SoundEngine` has `musicGain`. I should probably connect to that.
        // I'll add `connect(node)` method as it's standard for WebAudio wrappers.

        // Recalibrating plan to prompt: "Create a procedural audio synthesizer class... keep code efficient."
        // I'll add `connect(node)` so integration is clean.

        // --- Layer 1: The Deep (Drone) ---
        // Two oscillators ~40-60Hz, slightly detuned.

        const deepGain = this.ctx.createGain();
        deepGain.gain.value = 0.5; // Mix level
        deepGain.connect(this.masterGain);

        this.createOscillator(40, 'triangle', deepGain);
        this.createOscillator(42, 'triangle', deepGain); // 2Hz beat

        // --- Layer 2: The Wind (Filtered Noise) ---
        // White Noise -> LowPass Filter

        const windGain = this.ctx.createGain();
        windGain.gain.value = 0.3;
        windGain.connect(this.masterGain);

        this.createWind(windGain);

        this.nodes.push(deepGain, windGain, this.masterGain);
    }

    createOscillator(freq, type, output) {
        const osc = this.ctx.createOscillator();
        osc.type = type;
        osc.frequency.value = freq;
        osc.connect(output);
        osc.start();
        this.nodes.push(osc);
    }

    createWind(output) {
        const bufferSize = this.ctx.sampleRate * 2; // 2 seconds loop
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        noise.loop = true;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 180; // Cutoff ~150-200Hz

        noise.connect(filter);
        filter.connect(output);
        noise.start();

        this.nodes.push(noise, filter);
    }

    stop() {
        if (!this.isPlaying || !this.masterGain) return;

        const t = this.ctx.currentTime;

        // Fade out
        try {
            this.masterGain.gain.cancelScheduledValues(t);
            this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, t);
            this.masterGain.gain.linearRampToValueAtTime(0, t + 2);
        } catch (e) { /* ignore cleanup errors */ }

        setTimeout(() => {
            this.nodes.forEach(node => {
                try {
                    node.stop ? node.stop() : null;
                    node.disconnect();
                } catch (e) { }
            });
            this.nodes = [];
            this.isPlaying = false;
            this.masterGain = null;
        }, 2100); // Wait for fade
    }

    setVolume(val) {
        if (this.masterGain) {
            this.masterGain.gain.value = val;
        }
    }

    // Helper to connect to the game's mixer
    connect(node) {
        this.destination = node;
        if (this.masterGain) {
            this.masterGain.disconnect();
            this.masterGain.connect(node);
        }
    }
}
