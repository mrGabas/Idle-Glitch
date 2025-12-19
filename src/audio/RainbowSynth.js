/**
 * RainbowSynth
 * Procedural audio generator for the 'Rainbow Paradise' theme.
 * Creates a happy, fast-paced 8-bit chiptune atmosphere.
 */
export class RainbowSynth {
    constructor(audioContext) {
        this.ctx = audioContext;
        this.masterGain = null;
        this.destination = null;

        this.isPlaying = false;
        this.tempo = 120;
        this.lookahead = 25.0; // ms
        this.scheduleAheadTime = 0.1; // s
        this.nextNoteTime = 0.0;
        this.notesInQueue = [];
        this.timerID = null;

        // C Major Pentatonic Scale frequencies (approx)
        // C4, D4, E4, G4, A4, C5
        this.scale = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25];
        this.bassScale = [65.41, 73.42, 82.41, 98.00, 110.00]; // C2 scale

        // Current note index
        this.noteIndex = 0;
    }

    play() {
        if (this.isPlaying) return;
        this.isPlaying = true;

        if (!this.ctx) return;

        // Setup graph
        const dest = this.destination || this.ctx.destination;
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = 0.4;
        this.masterGain.connect(dest);

        this.nextNoteTime = this.ctx.currentTime + 0.1;
        this.scheduler();
    }

    scheduler() {
        if (!this.isPlaying) return;

        // while there are notes that will need to play before the next interval, 
        // schedule them and advance the pointer.
        while (this.nextNoteTime < this.ctx.currentTime + this.scheduleAheadTime) {
            this.scheduleNote(this.noteIndex, this.nextNoteTime);
            this.nextNote();
        }

        this.timerID = setTimeout(() => this.scheduler(), this.lookahead);
    }

    nextNote() {
        const secondsPerBeat = 60.0 / this.tempo;
        // fast arpeggios usually 16th notes
        this.nextNoteTime += 0.25 * secondsPerBeat;

        this.noteIndex++;
        if (this.noteIndex >= 16) {
            this.noteIndex = 0;
        }
    }

    scheduleNote(beatNumber, time) {
        if (!this.ctx || !this.masterGain) return;

        // Push note to queue for visualization if needed (skipping for now)
        this.notesInQueue.push({ note: beatNumber, time: time });

        // --- SOUND GENERATION ---

        // Randomize notes slightly to keep it fresh
        const isArpeggio = true;

        // 1. Lead (Pulse/Square) - The melody
        // Play on most beats, but skip some random ones for rhythm variety
        if (Math.random() > 0.1) {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'square';

            // Pick a random note from the Pentatonic Scale
            // To make it an "Arpeggio", we might want to walk up/down, but random is easier for "infinite" variety
            // Let's bias it towards walking up 
            const noteIdx = Math.floor(Math.random() * this.scale.length);
            const freq = this.scale[noteIdx];

            osc.frequency.setValueAtTime(freq, time);

            // Envelope (ADSR) - Plucky 8-bit
            gain.gain.setValueAtTime(0, time);
            gain.gain.linearRampToValueAtTime(0.1, time + 0.01); // Attack
            gain.gain.exponentialRampToValueAtTime(0.01, time + 0.1); // Decay
            // Short pulse length
            osc.connect(gain);
            gain.connect(this.masterGain);

            osc.start(time);
            osc.stop(time + 0.15);
        }

        // 2. Bass (Triangle) - Every quarter note (beats 0, 4, 8, 12)
        if (beatNumber % 4 === 0) {
            const bassOsc = this.ctx.createOscillator();
            const bassGain = this.ctx.createGain();

            bassOsc.type = 'triangle';
            // Random bass note
            const bassFreq = this.bassScale[Math.floor(Math.random() * this.bassScale.length)];
            bassOsc.frequency.setValueAtTime(bassFreq, time);

            bassGain.gain.setValueAtTime(0, time);
            bassGain.gain.linearRampToValueAtTime(0.3, time + 0.02);
            bassGain.gain.linearRampToValueAtTime(0, time + 0.2);

            bassOsc.connect(bassGain);
            bassGain.connect(this.masterGain);

            bassOsc.start(time);
            bassOsc.stop(time + 0.25);
        }
    }

    stop() {
        this.isPlaying = false;
        if (this.timerID) {
            clearTimeout(this.timerID);
            this.timerID = null;
        }

        // Stop master
        if (this.masterGain) {
            // Quick fade out
            const t = this.ctx.currentTime;
            try {
                this.masterGain.gain.cancelScheduledValues(t);
                this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, t);
                this.masterGain.gain.linearRampToValueAtTime(0, t + 0.1);
            } catch (e) { }

            setTimeout(() => {
                try {
                    this.masterGain.disconnect();
                } catch (e) { }
                this.masterGain = null;
            }, 150);
        }
    }

    setVolume(val) {
        if (this.masterGain) {
            this.masterGain.gain.value = val * 0.4; // Scale down a bit as squares are loud
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
