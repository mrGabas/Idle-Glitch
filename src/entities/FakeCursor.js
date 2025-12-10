/**
 * FAKE CURSOR ENTITY
 * Moves autonomously and interacts with the game
 * @module entities/FakeCursor
 */
import { UTILS } from '../core/config.js';

export class FakeCursor {
    constructor(w, h, game) {
        this.w = w;
        this.h = h;
        this.game = game;
        this.x = w / 2;
        this.y = h / 2;
        this.targetX = this.x;
        this.targetY = this.y;
        this.state = 'IDLE'; // IDLE, MOVING, CLICKING
        this.timer = 0;
        this.clickTimer = 0;
        this.active = false;

        // Visual
        this.cursorImage = new Image();
        // Base64 Simple Cursor (Windows pointer style)
        this.cursorImage.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAC0SURBVDhPpZPBDYMwEERTCaWRIqWRIqWRIqURN00EfwQfLzsWrD0k7x+Drx3b+Nl7/4G+7z/0ff9FwzB+Udd1k7ZtW3Rd90Xn83mi67on6rruE43jeKJhGJ6o53lP1PO8J+q574t6nvdEwzD8RMMwfFHf9x/0fP9Fz/Nf1LZt0TzPF83z/Bedz+eJjuOcqOu6JxqG4Ym6rnuicRyfqOd5T9TzvCfqed4T9TzviXqef6L/eZ7neQGUWixJk6xQ4gAAAABJRU5ErkJggg==';
    }

    reset(w, h) {
        this.w = w;
        this.h = h;
        this.x = Math.random() * w;
        this.y = Math.random() * h;
        this.active = true;
    }

    resize(w, h) {
        this.w = w;
        this.h = h;
    }

    update(dt) {
        if (!this.active) return;

        this.timer -= dt;

        // State Machine
        if (this.state === 'IDLE') {
            if (this.timer <= 0) {
                // Pick new target
                this.state = 'MOVING';
                this.targetX = Math.random() * this.w;
                this.targetY = Math.random() * this.h;
                // Sometimes target a specific UI element?
                if (Math.random() < 0.3 && this.game.popups.length > 0) {
                    const target = UTILS.randArr(this.game.popups);
                    this.targetX = target.x + target.w - 15; // Close button
                    this.targetY = target.y + 15;
                    this.targetElement = target;
                }
                this.timer = Math.random() * 2 + 1; // Move duration
            }
        } else if (this.state === 'MOVING') {
            // Lerp towards target
            const speed = 500 * dt; // pixels per sec
            const dx = this.targetX - this.x;
            const dy = this.targetY - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 10) {
                this.x = this.targetX;
                this.y = this.targetY;
                this.state = 'IDLE';
                this.timer = Math.random() * 2 + 0.5; // Wait before moving again

                // Click?
                if (Math.random() < 0.5) {
                    this.state = 'CLICKING';
                    this.clickTimer = 0.2;
                }
            } else {
                this.x += (dx / dist) * speed;
                this.y += (dy / dist) * speed;
            }
        } else if (this.state === 'CLICKING') {
            this.clickTimer -= dt;
            if (this.clickTimer <= 0) {
                // Perform click action
                this.performClick();
                this.state = 'IDLE';
                this.timer = 1.0;
            }
        }
    }

    performClick() {
        // fake click logic
        // If we targeted a popup
        if (this.targetElement && this.game.popups.includes(this.targetElement)) {
            // Close it
            const idx = this.game.popups.indexOf(this.targetElement);
            if (idx !== -1) {
                this.game.popups.splice(idx, 1);
                this.game.events.emit('play_sound', 'click');
                this.game.chat.addMessage('GHOST', 'Closed that for you.');
            }
            this.targetElement = null;
        }

        // Random clicks on screen
        // Could click Start button if in menu? Too annoying?
        // Let's just spawn a particle for effect
        this.game.createParticles(this.x, this.y, '#fff');
    }

    draw(ctx) {
        if (!this.active) return;

        ctx.save();
        ctx.translate(this.x, this.y);
        // Draw image or simple arrow
        // ctx.drawImage(this.cursorImage, 0, 0); 
        // Drawing manually fits style better maybe?
        ctx.fillStyle = "#fff";
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 1;

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(12, 12);
        ctx.lineTo(7, 12);
        ctx.lineTo(10, 18);
        ctx.lineTo(7, 19);
        ctx.lineTo(4, 13);
        ctx.lineTo(0, 17);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.restore();
    }
}
