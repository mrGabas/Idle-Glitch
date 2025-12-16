
import { UTILS } from '../core/config.js';

export class TerminalHack {
    constructor() {
        this.reset();
    }

    reset() {
        this.active = true;
        this.won = false;
        this.lost = false;
        this.sequence = [];
        this.currentIndex = 0;

        // Difficulty scaling could be passed in, but for now hardcoded basics
        const length = UTILS.rand(4, 6);
        for (let i = 0; i < length; i++) {
            this.sequence.push(this.randomHex());
        }

        this.maxTime = length * 1.5; // 1.5s per code
        this.timer = this.maxTime;

        this.particles = []; // For visual flair
    }

    randomHex() {
        const hex = "0123456789ABCDEF";
        return hex[Math.floor(Math.random() * 16)] + hex[Math.floor(Math.random() * 16)];
    }

    update(dt, input) {
        if (!this.active || this.won || this.lost) return;

        this.timer -= dt;
        if (this.timer <= 0) {
            this.timer = 0;
            this.lost = true;
            this.active = false;
            return;
        }

        if (input) {
            // Polling for text input
            const keys = input.getPressedKeys();
            for (const key of keys) {
                // Ignore non-character keys (codes like KeyA, Enter, etc)
                // We only want typed characters for Hex entry
                if (key.length !== 1) continue;

                const targetStr = this.sequence.join("");
                const expectedChar = targetStr[this.currentIndex];
                const inputChar = key.toUpperCase();

                if (inputChar === expectedChar) {
                    this.timer += 1.0;
                    this.currentIndex++;
                    if (this.currentIndex >= targetStr.length) {
                        this.won = true;
                        this.active = false;
                        return; // Stop processing 
                    }
                } else {
                    // Mistake penalty
                    this.timer -= 1.0;
                }
            }
        }
    }

    // onKeyDown removed - input handled via poll in update

    draw(ctx, x, y, w, h) {
        // CRT / Terminal Look
        ctx.fillStyle = '#000';
        ctx.fillRect(x, y, w, h);

        // Header
        ctx.fillStyle = this.timer < 3 ? '#f00' : '#0f0';
        ctx.font = 'bold 14px "Courier New", monospace';
        ctx.textAlign = 'left';
        ctx.fillText(`Override Sequence Active...  ${this.timer.toFixed(1)}s`, x + 10, y + 20);

        // Matrix Background Effect (Optional simplified)

        // Sequence Display
        // We display the codes. Completed parts in one color, remaining in another.
        // Because we flattened the matching logic, we need to map currentIndex back to display.

        let flatIndex = 0;
        let drawX = x + 20;
        let drawY = y + 60;

        ctx.font = '24px "Courier New", monospace';

        for (let i = 0; i < this.sequence.length; i++) {
            const code = this.sequence[i];

            for (let j = 0; j < code.length; j++) {
                const char = code[j];
                const isMatched = flatIndex < this.currentIndex;
                const isCurrent = flatIndex === this.currentIndex;

                if (isMatched) {
                    ctx.fillStyle = '#444'; // Dimmed / Typed
                } else if (isCurrent) {
                    // Blink cursor effect
                    ctx.fillStyle = (Math.floor(Date.now() / 200) % 2 === 0) ? '#fff' : '#0f0';
                } else {
                    ctx.fillStyle = '#0f0';
                }

                ctx.fillText(char, drawX, drawY);
                drawX += 16;
                flatIndex++;
            }

            drawX += 16; // Space between codes
        }

        // Status Text
        if (this.won) {
            ctx.fillStyle = '#0f0';
            ctx.fillText("ACCESS GRANTED", x + 20, y + 100);
        } else if (this.lost) {
            ctx.fillStyle = '#f00';
            ctx.fillText("ACCESS DENIED", x + 20, y + 100);
        }
    }
}
