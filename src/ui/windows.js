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

export class MailWindow {
    constructor(w, h, mailSystem) {
        this.w = 500;
        this.h = 400;
        this.x = (w - this.w) / 2;
        this.y = (h - this.h) / 2;
        this.mailSystem = mailSystem;
        this.active = false;
        this.title = "Outlook_Express_Pirated_Edition.exe";
        this.selectedId = null;
        this.scroll = 0;
    }

    draw(ctx) {
        if (!this.active) return;

        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(this.x + 8, this.y + 8, this.w, this.h);

        // Window BG
        ctx.fillStyle = '#c0c0c0'; // Win95 Grey
        ctx.fillRect(this.x, this.y, this.w, this.h);

        // Borders
        this.drawBevel(ctx, this.x, this.y, this.w, this.h, true);

        // Title Bar
        ctx.fillStyle = '#000080';
        ctx.fillRect(this.x + 3, this.y + 3, this.w - 6, 20);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(this.title, this.x + 6, this.y + 17);

        // Close Button
        const bx = this.x + this.w - 20;
        const by = this.y + 5;
        this.drawButton(ctx, bx, by, 16, 16, "X");

        // Layout: Left (List) 40%, Right (View) 60%
        const listW = this.w * 0.4 - 10;
        const viewW = this.w * 0.6 - 15;
        const contentH = this.h - 40;
        const listX = this.x + 10;
        const viewX = this.x + 10 + listW + 5;
        const contentY = this.y + 30;

        // Draw List BG
        ctx.fillStyle = '#fff';
        ctx.fillRect(listX, contentY, listW, contentH);
        this.drawBevel(ctx, listX, contentY, listW, contentH, false);

        // Draw View BG
        ctx.fillStyle = '#fff';
        ctx.fillRect(viewX, contentY, viewW, contentH);
        this.drawBevel(ctx, viewX, contentY, viewW, contentH, false);

        // Draw List Items
        const inbox = this.mailSystem.inbox;
        const itemH = 30;

        ctx.font = '12px Arial';
        ctx.textAlign = 'left';

        inbox.forEach((mail, i) => {
            const iy = contentY + 2 + i * itemH;
            if (iy + itemH > contentY + contentH) return; // Simple occlusion

            // Selection
            if (this.selectedId === mail.id) {
                ctx.fillStyle = '#000080';
                ctx.fillRect(listX + 2, iy, listW - 4, itemH);
                ctx.fillStyle = '#fff';
            } else {
                ctx.fillStyle = mail.read ? '#000' : '#0000aa'; // Bold blue for unreadish visual (actually logic below)
            }

            // Text
            const sender = mail.sender.substring(0, 15);
            ctx.fillText(sender, listX + 5, iy + 14);

            // Icon or status?
            if (!mail.read) {
                ctx.fillStyle = '#ff0000';
                ctx.fillText("!", listX + listW - 15, iy + 14);
            }
        });

        // Draw Selected View
        if (this.selectedId) {
            const mail = inbox.find(m => m.id === this.selectedId);
            if (mail) {
                ctx.fillStyle = '#000';
                ctx.font = 'bold 14px Arial';
                ctx.textAlign = 'left';
                ctx.fillText(mail.subject, viewX + 10, contentY + 20);

                ctx.font = '12px Arial';
                ctx.fillStyle = '#666';
                ctx.fillText(`From: ${mail.sender}`, viewX + 10, contentY + 40);

                // Body
                ctx.fillStyle = '#000';
                ctx.font = "14px 'Courier New', monospace";
                const lines = this.getLines(ctx, mail.body, viewW - 20);
                let ly = contentY + 70;
                lines.forEach(line => {
                    ctx.fillText(line, viewX + 10, ly);
                    ly += 18;
                });
            }
        } else {
            ctx.fillStyle = '#888';
            ctx.font = 'italic 12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText("Select a message to read", viewX + viewW / 2, contentY + contentH / 2);
        }
    }

    drawBevel(ctx, x, y, w, h, up) {
        ctx.fillStyle = up ? '#fff' : '#888';
        ctx.fillRect(x, y, w, 1);
        ctx.fillRect(x, y, 1, h);
        ctx.fillStyle = up ? '#888' : '#fff';
        ctx.fillRect(x + w - 1, y, 1, h);
        ctx.fillRect(x, y + h - 1, w, 1);
    }

    drawButton(ctx, x, y, w, h, text) {
        ctx.fillStyle = '#c0c0c0';
        ctx.fillRect(x, y, w, h);
        this.drawBevel(ctx, x, y, w, h, true);
        ctx.fillStyle = '#000';
        ctx.font = 'bold 10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(text, x + w / 2, y + h - 3);
    }

    checkClick(mx, my) {
        if (!this.active) return false;

        // Window Drag/Interaction area
        if (mx < this.x || mx > this.x + this.w || my < this.y || my > this.y + this.h) {
            return false;
        }

        // Close Button
        const bx = this.x + this.w - 20;
        const by = this.y + 5;
        if (mx >= bx && mx <= bx + 16 && my >= by && my <= by + 16) {
            this.active = false;
            return true;
        }

        // List Click
        const listW = this.w * 0.4 - 10;
        const subY = this.y + 30; // contentY
        if (mx >= this.x + 10 && mx <= this.x + 10 + listW && my >= subY) {
            const listY = my - subY;
            const index = Math.floor(listY / 30);
            const inbox = this.mailSystem.inbox;
            if (index >= 0 && index < inbox.length) {
                this.selectedId = inbox[index].id;
                this.mailSystem.markRead(this.selectedId);
                return true;
            }
        }

        return true; // Click consumed
    }

    getLines(ctx, text, maxWidth) {
        var words = text.split(/[\s\n]+/);
        let paragraphs = text.split('\n');
        let lines = [];

        paragraphs.forEach(para => {
            var words = para.split(" ");
            var currentLine = words[0] || "";
            for (var i = 1; i < words.length; i++) {
                var width = ctx.measureText(currentLine + " " + words[i]).width;
                if (width < maxWidth) {
                    currentLine += " " + words[i];
                } else {
                    lines.push(currentLine);
                    currentLine = words[i];
                }
            }
            lines.push(currentLine);
            lines.push(""); // Paragraph break
        });
        return lines;
    }
}
