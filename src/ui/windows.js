/**
 * UI WINDOWS
 * @module ui/windows
 */
import { UTILS } from '../core/config.js';

export class Popup {
    constructor(w, h) {
        this.w = 240; this.h = 140;
        this.x = UTILS.rand(50, w - 290);
        this.y = UTILS.rand(50, h - 190);
        this.type = Math.random() > 0.3 ? 'error' : 'bonus';
        this.title = this.type === 'error' ? 'SYSTEM ALERT' : 'WINNER!';
        this.msg = this.type === 'error' ? 'Unauthorized access.' : 'Free BITCOIN found!';
        this.btnText = this.type === 'error' ? 'CLOSE' : 'GET';
        this.life = 5.0;
        this.active = true;
    }

    draw(ctx) {
        if (!this.active) return;
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(this.x + 5, this.y + 5, this.w, this.h);

        // Win95 Style
        ctx.fillStyle = '#c0c0c0';
        ctx.fillRect(this.x, this.y, this.w, this.h);

        // Borders (Bevel)
        ctx.fillStyle = '#fff'; // Top/Left light
        ctx.fillRect(this.x, this.y, this.w, 2);
        ctx.fillRect(this.x, this.y, 2, this.h);
        ctx.fillStyle = '#000'; // Bottom/Right shadow
        ctx.fillRect(this.x + this.w - 2, this.y, 2, this.h);
        ctx.fillRect(this.x, this.y + this.h - 2, this.w, 2);

        // Header
        const headerColor = this.type === 'error' ? '#800000' : '#000080';
        ctx.fillStyle = headerColor;
        ctx.fillRect(this.x + 4, this.y + 4, this.w - 8, 20);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 12px Arial';
        ctx.fillText(this.title, this.x + 8, this.y + 18);

        // Content
        ctx.fillStyle = '#000';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.msg, this.x + this.w / 2, this.y + 60);

        // Button
        const bx = this.x + this.w / 2 - 40;
        const by = this.y + 90;
        ctx.fillStyle = '#c0c0c0';
        ctx.fillRect(bx, by, 80, 24);
        // Button bevel
        ctx.fillStyle = '#fff';
        ctx.fillRect(bx, by, 80, 2); ctx.fillRect(bx, by, 2, 24);
        ctx.fillStyle = '#000';
        ctx.fillRect(bx + 78, by, 2, 24); ctx.fillRect(bx, by + 22, 80, 2);

        ctx.fillStyle = '#000';
        ctx.font = 'bold 12px Arial';
        ctx.fillText(this.btnText, bx + 40, by + 16);
    }

    checkClick(mx, my) {
        if (!this.active) return false;
        const bx = this.x + this.w / 2 - 40;
        const by = this.y + 90;
        if (mx >= bx && mx <= bx + 80 && my >= by && my <= by + 24) {
            this.active = false;
            return this.type;
        }
        return null;
    }
}

export class NotepadWindow {
    constructor(w, h, content) {
        this.w = 400;
        this.h = 300;
        this.x = (w - this.w) / 2;
        this.y = (h - this.h) / 2;
        this.content = content || "Error: Corrupted File";
        this.active = true;
        this.title = "Notepad.exe";
    }

    draw(ctx) {
        if (!this.active) return;

        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(this.x + 5, this.y + 5, this.w, this.h);

        // Main Window
        ctx.fillStyle = '#fff';
        ctx.fillRect(this.x, this.y, this.w, this.h);
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;
        ctx.strokeRect(this.x, this.y, this.w, this.h);

        // Title Bar
        ctx.fillStyle = '#000080'; // Navy blue
        ctx.fillRect(this.x + 2, this.y + 2, this.w - 4, 18);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(this.title, this.x + 6, this.y + 16);

        // Close Button [X]
        const bx = this.x + this.w - 18;
        const by = this.y + 4;
        ctx.fillStyle = '#c0c0c0';
        ctx.fillRect(bx, by, 14, 14);
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(bx, by + 14); ctx.lineTo(bx, by); ctx.lineTo(bx + 14, by); ctx.stroke();
        ctx.strokeStyle = '#000';
        ctx.beginPath(); ctx.moveTo(bx + 14, by); ctx.lineTo(bx + 14, by + 14); ctx.lineTo(bx, by + 14); ctx.stroke();

        ctx.fillStyle = '#000';
        ctx.font = 'bold 10px Arial';
        ctx.fillText('X', bx + 3, by + 11);

        // Menu Bar
        ctx.fillStyle = '#000';
        ctx.font = '12px Arial';
        ctx.fillText("File   Edit   Format   View   Help", this.x + 6, this.y + 35);
        ctx.strokeStyle = '#ccc';
        ctx.beginPath(); ctx.moveTo(this.x, this.y + 40); ctx.lineTo(this.x + this.w, this.y + 40); ctx.stroke();

        // Content Area
        ctx.fillStyle = '#000';
        ctx.font = "16px 'Courier New', monospace";
        const lines = this.getLines(ctx, this.content, this.w - 20);
        let ly = this.y + 60;
        lines.forEach(line => {
            ctx.fillText(line, this.x + 10, ly);
            ly += 20;
        });
    }

    getLines(ctx, text, maxWidth) {
        var words = text.split(" ");
        var lines = [];
        var currentLine = words[0];

        for (var i = 1; i < words.length; i++) {
            var word = words[i];
            var width = ctx.measureText(currentLine + " " + word).width;
            if (width < maxWidth) {
                currentLine += " " + word;
            } else {
                lines.push(currentLine);
                currentLine = word;
            }
        }
        lines.push(currentLine);
        return lines;
    }

    checkClick(mx, my) {
        if (!this.active) return false;

        // Check Close Button
        const bx = this.x + this.w - 18;
        const by = this.y + 4;
        if (mx >= bx && mx <= bx + 14 && my >= by && my <= by + 14) {
            this.active = false;
            return true;
        }

        // Consume click inside window (prevent clicking game behind it)
        if (mx >= this.x && mx <= this.x + this.w && my >= this.y && my <= this.y + this.h) {
            return true;
        }

        return false;
    }
}
