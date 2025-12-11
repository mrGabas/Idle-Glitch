import { Minigame } from './Minigame.js';

export class SnakeGame extends Minigame {
    constructor(game) {
        super(game);
        this.title = "SNAKE.EXE";
        this.reset();
    }

    reset() {
        this.active = true;
        this.lost = false;
        this.gameOver = false; // Sync with base property

        // Grid
        this.cols = 20;
        this.rows = 15;
        this.cellSize = 16;

        this.snake = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
        this.dir = { x: 1, y: 0 };
        this.nextDir = { x: 1, y: 0 };

        this.food = this.spawnFood();

        this.score = 0; // Local score for display
        this.timer = 0;
        this.moveInterval = 0.15;

        this.foodEaten = 0;
        this.shake = 0;
    }

    spawnFood() {
        let valid = false;
        let p = { x: 0, y: 0 };
        while (!valid) {
            p.x = Math.floor(Math.random() * this.cols);
            p.y = Math.floor(Math.random() * this.rows);
            valid = !this.snake.some(s => s.x === p.x && s.y === p.y);
        }
        return p;
    }

    update(dt, input) {
        if (!this.active) return;

        // Restart on input if lost
        if (this.lost) {
            if (input && input.isActionPressed('CONFIRM')) {
                this.reset();
            }
            return;
        }

        // Input Handling
        if (input) {
            // Check for both Actions (Game Input) and Raw Keys if needed, 
            // but Action Mapping is preferred.
            if (input.isActionDown('UP') && this.dir.y === 0) this.nextDir = { x: 0, y: -1 };
            if (input.isActionDown('DOWN') && this.dir.y === 0) this.nextDir = { x: 0, y: 1 };
            if (input.isActionDown('LEFT') && this.dir.x === 0) this.nextDir = { x: -1, y: 0 };
            if (input.isActionDown('RIGHT') && this.dir.x === 0) this.nextDir = { x: 1, y: 0 };
        }

        if (this.shake > 0) this.shake *= 0.9;

        this.timer += dt;
        if (this.timer >= this.moveInterval) {
            this.timer = 0;
            this.move();
        }
    }

    move() {
        this.dir = { ...this.nextDir }; // Apply next direction
        const head = { x: this.snake[0].x + this.dir.x, y: this.snake[0].y + this.dir.y };

        // Wall Collision
        if (head.x < 0 || head.x >= this.cols || head.y < 0 || head.y >= this.rows) {
            this.die();
            return;
        }

        // Self Collision
        if (this.snake.some(s => s.x === head.x && s.y === head.y)) {
            this.die();
            return;
        }

        this.snake.unshift(head);

        // Eat Food
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score += 10;
            if (this.game) this.game.state.addScore(10); // Reward Real Currency

            this.foodEaten++;
            this.food = this.spawnFood();

            // Speed up slightly
            this.moveInterval = Math.max(0.05, this.moveInterval * 0.98);

            // Audio
            if (this.game) this.game.events.emit('play_sound', 'buy');

            // Glitch Effect every 5th food
            if (this.foodEaten % 5 === 0) {
                this.shake = 10;
                if (this.game) this.game.events.emit('play_sound', 'glitch');
            }

            return 'eat';
        } else {
            this.snake.pop(); // Remove tail
        }
    }

    die() {
        this.lost = true;
        this.shake = 20;
        if (this.game) this.game.events.emit('play_sound', 'error');
    }

    // Optional: Raw Key Handler if actions aren't enough (e.g. specialized keys)
    onKeyDown(key) {
        if (this.lost) {
            if (key === 'Enter' || key === ' ') this.reset();
            return;
        }
        // Redundant if using update(input), but good for reliability
        if (key === 'ArrowUp' && this.dir.y === 0) this.nextDir = { x: 0, y: -1 };
        if (key === 'ArrowDown' && this.dir.y === 0) this.nextDir = { x: 0, y: 1 };
        if (key === 'ArrowLeft' && this.dir.x === 0) this.nextDir = { x: -1, y: 0 };
        if (key === 'ArrowRight' && this.dir.x === 0) this.nextDir = { x: 1, y: 0 };
    }

    draw(ctx, x, y, w, h) {
        // Calculate cell size based on window
        const cw = w / this.cols;
        const ch = h / this.rows;

        // Shake offset
        let sx = 0, sy = 0;
        if (this.shake > 0) {
            sx = (Math.random() - 0.5) * this.shake;
            sy = (Math.random() - 0.5) * this.shake;
        }

        ctx.save();
        ctx.translate(x + sx, y + sy);

        // BG - already drawn by MinigameWindow usually, but safe to redraw specific area
        // ctx.fillStyle = '#000'; 
        // ctx.fillRect(0, 0, w, h);

        // Grid (Optional - make it faint)
        ctx.strokeStyle = '#111';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let i = 0; i <= this.cols; i++) { ctx.moveTo(i * cw, 0); ctx.lineTo(i * cw, h); }
        for (let i = 0; i <= this.rows; i++) { ctx.moveTo(0, i * ch); ctx.lineTo(w, i * ch); }
        ctx.stroke();

        // Snake
        this.snake.forEach((s, i) => {
            if (i === 0) ctx.fillStyle = '#aff'; // Head
            else ctx.fillStyle = '#0f0';
            ctx.fillRect(s.x * cw + 1, s.y * ch + 1, cw - 2, ch - 2);
        });

        // Food
        ctx.fillStyle = '#f00';
        ctx.beginPath();
        const fx = this.food.x * cw + cw / 2;
        const fy = this.food.y * ch + ch / 2;
        ctx.arc(fx, fy, cw / 3, 0, Math.PI * 2);
        ctx.fill();

        // UI
        ctx.fillStyle = '#fff';
        ctx.font = '10px "Courier New"';
        ctx.textAlign = 'left';
        ctx.fillText(`SCORE: ${this.score}`, 5, 10);

        if (this.lost) {
            ctx.fillStyle = '#f00';
            ctx.font = '20px "Courier New"';
            ctx.textAlign = 'center';
            ctx.fillText("GAME OVER", w / 2, h / 2);
            ctx.font = '12px "Courier New"';
            ctx.fillText("Press Enter or A to Restart", w / 2, h / 2 + 20);
        }

        ctx.restore();
    }
}
