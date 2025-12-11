export class Minigame {
    constructor(game) {
        this.game = game;
        this.active = false;
        this.title = "Minigame";
        this.gameOver = false;
        this.score = 0;
    }

    /**
     * @param {number} dt 
     * @param {Object} input - Game input handler
     */
    update(dt, input) {
        // Override me
    }

    /**
     * @param {CanvasRenderingContext2D} ctx 
     * @param {number} x 
     * @param {number} y 
     * @param {number} w 
     * @param {number} h 
     */
    draw(ctx, x, y, w, h) {
        // Override me
    }

    onKeyDown(key) {
        // Override me
    }

    onKeyUp(key) {
        // Override me
    }
}
