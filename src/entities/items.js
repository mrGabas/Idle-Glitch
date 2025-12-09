/**
 * INTERACTIVE ITEMS
 * @module entities/items
 */
import { UTILS } from '../core/config.js';

export class LoreFile {
    constructor(w, h) {
        this.w = 50;
        this.h = 60;
        // Spawn randomly but avoid center (gameplay area)
        let safe = false;
        while (!safe) {
            this.x = UTILS.rand(50, w - 100);
            this.y = UTILS.rand(50, h - 100);
            const cx = w / 2;
            const cy = h / 2;
            if (Math.hypot(this.x - cx, this.y - cy) > 300) safe = true;
        }

        this.label = UTILS.randArr(['PRIVATE', 'DONT_OPEN', 'secrets.txt', 'diary.log', 'passwords.txt']);
        this.active = true;
        this.life = 30.0; // Exist for 30 seconds
    }

    draw(ctx) {
        if (!this.active) return;

        ctx.save();
        ctx.translate(this.x, this.y);

        // Icon (Folder)
        ctx.fillStyle = '#ebb434'; // Folder yellow
        ctx.beginPath();
        ctx.moveTo(0, 5);
        ctx.lineTo(20, 5);
        ctx.lineTo(25, 0);
        ctx.lineTo(50, 0);
        ctx.lineTo(50, 40);
        ctx.lineTo(0, 40);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#c59218';
        ctx.stroke();

        // Label
        ctx.fillStyle = '#fff';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.shadowColor = '#000';
        ctx.shadowBlur = 4;
        ctx.fillText(this.label, 25, 55);
        ctx.shadowBlur = 0;

        ctx.restore();
    }

    checkClick(mx, my) {
        if (!this.active) return false;
        if (mx >= this.x && mx <= this.x + 50 && my >= this.y && my <= this.y + 60) {
            this.active = false; // Disappear after opening
            return true;
        }
        return false;
    }
}
