export class AchievementPopup {
    constructor(game, achievement) {
        this.game = game;
        this.achievement = achievement;
        this.x = game.w / 2 - 150;
        this.y = -60; // Start off-screen
        this.targetY = 20;
        this.w = 300;
        this.h = 60;
        this.life = 4.0; // Seconds to display
        this.state = 'in'; // in, wait, out
        this.alpha = 1;
    }

    update(dt) {
        // Animation Logic
        if (this.state === 'in') {
            this.y += (this.targetY - this.y) * 5 * dt;
            if (Math.abs(this.y - this.targetY) < 1) {
                this.y = this.targetY;
                this.state = 'wait';
            }
        } else if (this.state === 'wait') {
            this.life -= dt;
            if (this.life <= 0) {
                this.state = 'out';
            }
        } else if (this.state === 'out') {
            this.y -= (this.y - (-80)) * 5 * dt; // Move back up (fix direction)
            // Actually, (this.y - (-80)) might be positive. 
            // If y=20, dest=-80. diff = 100. y -= 500*dt. Moves UP. Correct.
            if (this.y < -70) {
                this.life = -1; // Done
            }
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);

        // Background
        ctx.fillStyle = "rgba(0, 0, 0, 0.9)";
        ctx.strokeStyle = "#FFD700";
        ctx.lineWidth = 2;
        ctx.fillRect(0, 0, this.w, this.h);
        ctx.strokeRect(0, 0, this.w, this.h);

        // Icon / Text
        ctx.fillStyle = "#FFD700";
        ctx.font = "bold 16px Courier New";
        ctx.textAlign = "left";
        ctx.fillText("ACHIEVEMENT UNLOCKED", 10, 20);

        ctx.fillStyle = "#FFF";
        ctx.font = "14px Courier New";
        ctx.fillText(this.achievement.name, 10, 45);

        // Optional: Desc small
        /*
        ctx.font = "10px Courier New";
        ctx.fillStyle = "#AAA";
        ctx.fillText(this.achievement.desc, 150, 45); // Right align/fit?
        */

        ctx.restore();
    }

    checkClick(mx, my) {
        // Passthrough for now, maybe click to dismiss?
        return false;
    }
}
