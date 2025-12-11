/**
 * UI WINDOWS
 * @module ui/windows
 */
import { UTILS } from '../core/config.js';
import { Window } from './Window.js';

export class Popup extends Window {
    constructor(w, h, theme) {
        const pW = 240;
        const pH = 140;
        const x = UTILS.rand(50, w - 290);
        const y = UTILS.rand(50, h - 190);

        super(x, y, pW, pH, "System Alert"); // Title overridden later essentially

        this.type = Math.random() > 0.3 ? 'error' : 'bonus';

        // Dynamic Text from Theme
        this.title = this.type === 'error' ? 'SYSTEM ALERT' : 'WINNER!';
        this.msg = this.type === 'error' ? 'Unauthorized access.' : 'Free BITCOIN found!';
        this.btnText = this.type === 'error' ? 'CLOSE' : 'GET';
        this.isHorror = false;

        if (theme && theme.fakeUI && theme.fakeUI.length > 0) {
            // Pick random fakeUI element
            const el = UTILS.randArr(theme.fakeUI);
            this.msg = el.text;
            if (el.horror) {
                this.isHorror = true;
                this.title = "WARNING";
                this.btnText = "NO ESCAPE";
                this.type = 'error'; // Horror is always bad
            }
        }

        this.life = 5.0;
        this.isClosable = false; // Custom close button
    }

    update(dt) {
        if (this.active) {
            this.life -= dt;
        }
    }

    drawContent(ctx, x, y, w, h) {
        // Content Area BG (Standard Window Grey from frame is under this, but we can fill white or similar)
        // Check Popup style: it was full grey. 'Window' draws grey background.
        // We just need to draw text and button.

        // Header Color Override (Hack: Draw over the standard blue/grey header drawn by Window.draw)
        // Window frame header is at this.y + 3, height 18.
        // We are inside drawContent which starts at y+24.

        // If we want to override the header color, we have to do it crudely outside this rect or accept the standard header.
        // Let's accept standard header for now to be "System/Win95" compliant, OR drawing over it.
        // Drawing over:
        let headerColor = this.type === 'error' ? '#800000' : '#000080';
        if (this.isHorror) headerColor = '#000';

        ctx.fillStyle = headerColor;
        ctx.fillRect(this.x + 3, this.y + 3, this.w - 6, 18); // Overpaint header
        ctx.fillStyle = this.isHorror ? '#f00' : '#fff';
        ctx.font = 'bold 12px Arial';
        ctx.fillText(this.title, this.x + 6, this.y + 16);

        // Message
        ctx.fillStyle = '#000';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.msg, this.x + this.w / 2, this.y + 60);

        // Button
        const bx = this.x + this.w / 2 - 40;
        const by = this.y + 90;

        this.drawBevelButton(ctx, bx, by, 80, 24, this.btnText);
    }

    checkClick(mx, my) {
        const baseRes = super.checkClick(mx, my);
        if (baseRes === 'drag') return 'drag';

        // Check Button
        const bx = this.x + this.w / 2 - 40;
        const by = this.y + 90;
        if (mx >= bx && mx <= bx + 80 && my >= by && my <= by + 24) {
            this.active = false;
            return this.type; // 'error' or 'bonus'
        }

        if (baseRes === 'consumed') return 'consumed';
        return null;
    }
}

export class NotepadWindow extends Window {
    constructor(gameW, gameH, content, options) {
        const w = 400;
        const h = 300;
        const x = (gameW - w) / 2;
        const y = (gameH - h) / 2;

        super(x, y, w, h, options?.title || "Notepad.exe");

        this.content = content || "Error: Corrupted File";
        this.password = options?.password || null;
        this.locked = !!this.password;
        this.inputBuffer = "";

        // Locked title handling
        if (this.locked) {
            this.title = "ENCRYPTED FILE";
        }

        this.shake = 0;
    }

    drawContent(ctx, x, y, w, h) {
        // Shake logic affects whole window position in theory, 
        // but Window.draw uses this.x/y. 
        // If we want shake, we should modify this.x/y temporarily or use context translation?
        // Changing actual x/y makes dragging weird.
        // Let's just shake content or use ctx.translate before calling super.draw?
        // Too late, super.draw calls this.

        // Let's just shake the content for now.
        let sx = 0;
        if (this.shake > 0) {
            sx = (Math.random() - 0.5) * this.shake;
            this.shake *= 0.9;
            if (this.shake < 0.5) this.shake = 0;
        }

        // Menu Bar
        ctx.fillStyle = '#000';
        ctx.font = '12px Arial';
        ctx.textAlign = 'left';
        ctx.fillText("File   Edit   Format   View   Help", x + 2 + sx, y + 12);
        ctx.strokeStyle = '#ccc';
        ctx.beginPath(); ctx.moveTo(x, y + 18); ctx.lineTo(x + w, y + 18); ctx.stroke();

        // Text Area
        const ty = y + 25;
        const th = h - 30;

        ctx.fillStyle = '#fff';
        ctx.fillRect(x, ty, w, th);
        ctx.strokeStyle = '#000';
        ctx.strokeRect(x, ty, w, th);

        // Content
        ctx.fillStyle = '#000';
        ctx.font = "16px 'Courier New', monospace";

        if (this.locked) {
            // Password Prompt
            ctx.textAlign = 'center';
            ctx.fillText("ENTER PASSWORD:", x + w / 2 + sx, ty + 40);

            // Input Box
            ctx.strokeStyle = '#000';
            ctx.strokeRect(x + 50 + sx, ty + 60, w - 100, 30);

            // Masked Password
            const masked = "*".repeat(this.inputBuffer.length);
            ctx.fillText(masked + (Math.floor(Date.now() / 500) % 2 === 0 ? "_" : ""), x + w / 2 + sx, ty + 80);

            ctx.fillStyle = '#f00';
            ctx.font = '12px Arial';
            ctx.fillText("ACCESS DENIED - ENCRYPTED CONTENT", x + w / 2 + sx, ty + 150);
        } else {
            // Normal Content
            ctx.textAlign = 'left';
            const lines = this.getLines(ctx, this.content, w - 20);
            let ly = ty + 20;
            lines.forEach(line => {
                ctx.fillText(line, x + 10 + sx, ly);
                ly += 20;
            });
        }
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

    handleKeyDown(e) {
        if (!this.active || !this.locked) return;

        if (e.key === 'Enter') {
            if (this.inputBuffer === this.password) {
                this.locked = false;
                this.title = "Notepad.exe [DECRYPTED]";
                // Play unlock sound?
            } else {
                this.shake = 10;
                this.inputBuffer = "";
                // Play error sound?
            }
        } else if (e.key === 'Backspace') {
            this.inputBuffer = this.inputBuffer.slice(0, -1);
        } else if (e.key.length === 1) {
            if (this.inputBuffer.length < 20) {
                this.inputBuffer += e.key;
            }
        }
    }
}

export class MailWindow extends Window {
    constructor(gameW, gameH, mailSystem) {
        const w = 500;
        const h = 400;
        const x = (gameW - w) / 2;
        const y = (gameH - h) / 2;

        super(x, y, w, h, "Outlook_Express_Pirated_Edition.exe");

        this.mailSystem = mailSystem;
        this.selectedId = null;
    }

    resize(w, h) {
        this.x = (w - this.w) / 2;
        this.y = (h - this.h) / 2;
    }

    drawContent(ctx, x, y, w, h) {
        // Layout: Left (List) 40%, Right (View) 60%
        const listW = w * 0.4 - 5;
        const viewW = w * 0.6 - 5;

        // List Area
        ctx.fillStyle = '#fff';
        ctx.fillRect(x, y, listW, h);
        ctx.strokeStyle = '#888';
        ctx.strokeRect(x, y, listW, h);

        // View Area
        ctx.fillStyle = '#fff';
        ctx.fillRect(x + listW + 10, y, viewW, h);
        ctx.strokeStyle = '#888';
        ctx.strokeRect(x + listW + 10, y, viewW, h);

        // Draw List Items
        const inbox = this.mailSystem.inbox;
        const itemH = 30;

        ctx.font = '12px Arial';
        ctx.textAlign = 'left';

        inbox.forEach((mail, i) => {
            const iy = y + 2 + i * itemH;
            if (iy + itemH > y + h) return;

            // Selection
            if (this.selectedId === mail.id) {
                ctx.fillStyle = '#000080';
                ctx.fillRect(x + 2, iy, listW - 4, itemH);
                ctx.fillStyle = '#fff';
            } else {
                ctx.fillStyle = mail.read ? '#000' : '#0000aa';
            }

            // Text
            const sender = mail.sender.substring(0, 15);
            ctx.fillText(sender, x + 5, iy + 14);

            // Icon
            if (!mail.read) {
                ctx.fillStyle = '#ff0000';
                ctx.fillText("!", x + listW - 15, iy + 14);
            }
        });

        // Draw Selected View
        if (this.selectedId) {
            const mail = inbox.find(m => m.id === this.selectedId);
            if (mail) {
                const vx = x + listW + 15;
                const vy = y;

                ctx.fillStyle = '#000';
                ctx.font = 'bold 14px Arial';
                ctx.textAlign = 'left';
                ctx.fillText(mail.subject, vx, vy + 20);

                ctx.font = '12px Arial';
                ctx.fillStyle = '#666';
                ctx.fillText(`From: ${mail.sender}`, vx, vy + 40);

                // Body
                ctx.fillStyle = '#000';
                ctx.font = "14px 'Courier New', monospace";
                const lines = this.getLines(ctx, mail.body, viewW - 20);
                let ly = vy + 70;
                lines.forEach(line => {
                    ctx.fillText(line, vx, ly);
                    ly += 18;
                });
            }
        } else {
            ctx.fillStyle = '#888';
            ctx.font = 'italic 12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText("Select a message", x + listW + 10 + viewW / 2, y + h / 2);
        }
    }

    getLines(ctx, text, maxWidth) {
        // Simple wrap
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
        });
        return lines;
    }

    checkClick(mx, my) {
        const baseRes = super.checkClick(mx, my);
        if (baseRes === 'close' || baseRes === 'drag') return baseRes;

        if (baseRes === 'consumed') {
            // Check List Click
            // Calc list bounds
            const listW = this.w * 0.4 - 5; // Matches draw
            const listX = this.x + 4; // contentX = x + 4
            const listY = this.y + 24; // contentY = y + 24

            if (mx >= listX && mx <= listX + listW && my >= listY && my <= listY + (this.h - 28)) {
                const iy = my - listY;
                const index = Math.floor(iy / 30);
                const inbox = this.mailSystem.inbox;
                if (index >= 0 && index < inbox.length) {
                    this.selectedId = inbox[index].id;
                    this.mailSystem.markRead(this.selectedId);
                }
            }
            return 'consumed';
        }
        return null;
    }
}

