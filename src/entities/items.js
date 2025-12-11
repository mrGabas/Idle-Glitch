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

        const type = Math.random();
        if (type < 0.3) {
            this.label = 'passwords.txt';
            this.content = "SYSTEM PASSWORDS:\n\nUser: admin\nPass: *********\n\nUser: guest\nPass: guest123\n\nSECRET_ARCHIVE: 7719";
            this.password = "guest123";
        } else if (type < 0.6) {
            this.label = 'diary.log';
            this.content = "Day 45:\nThe glitches are getting worse. I saw a face in the monitor reflection today. It wasn't mine.";
            this.password = null;
        } else {
            this.label = UTILS.randArr(['PRIVATE', 'secrets.txt', 'notes.txt']);
            this.content = "REMINDER: Buy more RAM.\nREMINDER: Feed the cat.\nREMINDER: DON'T LOOK BEHIND YOU.";
            this.password = null;
        }

        this.active = true;
        this.life = 30.0; // Exist for 30 seconds
    }

    update(dt) {
        if (this.active) {
            this.life -= dt;
        }
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
