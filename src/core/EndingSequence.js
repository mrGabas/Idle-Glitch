/**
 * ENDING SEQUENCE
 * Handles the final cutscene/endpoint of the game.
 * @module core/EndingSequence
 */
export class EndingSequence {
    constructor(game) {
        this.game = game;
        this.timer = 0;
        this.alpha = 0;
    }

    update(dt) {
        this.timer += dt;
        // Simple fade in effect
        if (this.alpha < 1) {
            this.alpha += dt * 0.5;
        }
    }

    draw(ctx) {
        const w = ctx.canvas.width;
        const h = ctx.canvas.height;

        // Black background
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, w, h);

        // Text
        ctx.save();
        ctx.globalAlpha = Math.min(1, this.alpha);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 40px Courier New';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        ctx.fillText("SYSTEM FAILURE", w / 2, h / 2);

        ctx.font = '20px Courier New';
        ctx.fillText("The simulation has ended.", w / 2, h / 2 + 50);

        ctx.restore();
    }

    handleInput(x, y) {
        // Potential logic to restart or return to menu
        if (this.alpha >= 1) {
            // Click to return to menu/bios?
            // this.game.hardReset();
        }
    }
}
