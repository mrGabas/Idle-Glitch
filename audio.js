/**
 * AUDIO ENGINE (Synth)
 */

class SoundEngine {
    constructor() {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.master = this.ctx.createGain();
        this.master.gain.value = 0.2;
        this.master.connect(this.ctx.destination);
        this.enabled = false;
    }

    resume() {
        if (!this.enabled) {
            this.ctx.resume();
            this.enabled = true;
            document.getElementById('start-overlay').style.display = 'none';
        }
    }

    play(type) {
        if (!this.enabled) return;
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.connect(g);
        g.connect(this.master);

        if (type === 'click') {
            // Приятный клик
            osc.type = 'sine';
            osc.frequency.setValueAtTime(600, t);
            osc.frequency.exponentialRampToValueAtTime(100, t + 0.1);
            g.gain.setValueAtTime(0.5, t);
            g.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
            osc.start(t); osc.stop(t + 0.1);
        }
        else if (type === 'buy') {
            // Успешная покупка (8-bit coin)
            osc.type = 'square';
            osc.frequency.setValueAtTime(440, t);
            osc.frequency.setValueAtTime(880, t + 0.1);
            g.gain.setValueAtTime(0.1, t);
            g.gain.linearRampToValueAtTime(0, t + 0.2);
            osc.start(t); osc.stop(t + 0.2);
        }
        else if (type === 'error') {
            // Ошибка Windows style
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(150, t);
            g.gain.setValueAtTime(0.5, t);
            g.gain.exponentialRampToValueAtTime(0.01, t + 0.3);
            osc.start(t); osc.stop(t + 0.3);
        }
        else if (type === 'glitch') {
            // Шум
            osc.type = 'sawtooth';
            // Случайная частота для хаоса
            osc.frequency.setValueAtTime(UTILS.rand(50, 1000), t);
            // LFO эффект
            osc.frequency.linearRampToValueAtTime(UTILS.rand(50, 1000), t + 0.2);
            g.gain.setValueAtTime(0.2, t);
            g.gain.linearRampToValueAtTime(0, t + 0.2);
            osc.start(t); osc.stop(t + 0.2);
        }
    }
}
