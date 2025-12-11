/**
 * UI WINDOWS
 * @module ui/windows
 */
import { UTILS } from '../core/config.js';

export class Popup {
    constructor(w, h, theme) {
        this.w = 240; this.h = 140;
        this.x = UTILS.rand(50, w - 290);
        this.y = UTILS.rand(50, h - 190);
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
            if (el.color) {
                // We could use el.color, but Popup has specific styling. 
                // Maybe used for header?
                this.customColor = el.color;
            }
        }

        this.life = 5.0;
        this.active = true;
    }

    update(dt) {
        if (this.active) {
            this.life -= dt;
        }
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
        let headerColor = this.type === 'error' ? '#800000' : '#000080';
        if (this.isHorror) headerColor = '#000'; // Black header for horror

        ctx.fillStyle = headerColor;
        ctx.fillRect(this.x + 4, this.y + 4, this.w - 8, 20);
        ctx.fillStyle = this.isHorror ? '#f00' : '#fff'; // Red text for horror
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

        // Header Drag
        if (mx >= this.x && mx <= this.x + this.w && my >= this.y && my <= this.y + 24) {
            return 'drag';
        }

        const bx = this.x + this.w / 2 - 40;
        const by = this.y + 90;
        if (mx >= bx && mx <= bx + 80 && my >= by && my <= by + 24) {
            this.active = false;
            return this.type;
        }

        // Consume click in body
        if (mx >= this.x && mx <= this.x + this.w && my >= this.y && my <= this.y + this.h) {
            return 'consumed';
        }
        return null;
    }
}

export class NotepadWindow {
    constructor(w, h, content, options) {
        this.w = 400;
        this.h = 300;
        this.x = (w - this.w) / 2;
        this.y = (h - this.h) / 2;
        this.content = content || "Error: Corrupted File";
        this.password = options?.password || null;
        this.locked = !!this.password;
        this.inputBuffer = "";
        this.active = true;
        this.title = this.locked ? "ENCRYPTED FILE" : "Notepad.exe";
        this.shake = 0;
    }

    draw(ctx) {
        if (!this.active) return;

        // Shake effect
        let sx = 0;
        if (this.shake > 0) {
            sx = (Math.random() - 0.5) * this.shake;
            this.shake *= 0.9;
            if (this.shake < 0.5) this.shake = 0;
        }
        const tx = this.x + sx;

        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(tx + 5, this.y + 5, this.w, this.h);

        // Main Window
        ctx.fillStyle = '#fff';
        ctx.fillRect(tx, this.y, this.w, this.h);
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;
        ctx.strokeRect(tx, this.y, this.w, this.h);

        // Title Bar
        ctx.fillStyle = this.locked ? '#800000' : '#000080'; // Red if locked
        ctx.fillRect(tx + 2, this.y + 2, this.w - 4, 18);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(this.title, tx + 6, this.y + 16);

        // Close Button [X]
        const bx = tx + this.w - 18;
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
        ctx.textAlign = 'left';
        ctx.fillText("File   Edit   Format   View   Help", tx + 6, this.y + 35);
        ctx.strokeStyle = '#ccc';
        ctx.beginPath(); ctx.moveTo(tx, this.y + 40); ctx.lineTo(tx + this.w, this.y + 40); ctx.stroke();

        // Content Area
        ctx.fillStyle = '#000';
        ctx.font = "16px 'Courier New', monospace";

        if (this.locked) {
            // Password Prompt
            ctx.textAlign = 'center';
            ctx.fillText("ENTER PASSWORD:", tx + this.w / 2, this.y + 100);

            // Input Box
            ctx.strokeStyle = '#000';
            ctx.strokeRect(tx + 50, this.y + 120, this.w - 100, 30);

            // Masked Password
            const masked = "*".repeat(this.inputBuffer.length);
            ctx.fillText(masked + (Math.floor(Date.now() / 500) % 2 === 0 ? "_" : ""), tx + this.w / 2, this.y + 140);

            ctx.fillStyle = '#f00';
            ctx.font = '12px Arial';
            ctx.fillText("ACCESS DENIED - ENCRYPTED CONTENT", tx + this.w / 2, this.y + 250);
        } else {
            // Normal Content
            ctx.textAlign = 'left';
            const lines = this.getLines(ctx, this.content, this.w - 20);
            let ly = this.y + 60;
            lines.forEach(line => {
                ctx.fillText(line, tx + 10, ly);
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

    checkClick(mx, my) {
        if (!this.active) return false;

        // Check Close Button
        const bx = this.x + this.w - 18;
        const by = this.y + 4;
        if (mx >= bx && mx <= bx + 14 && my >= by && my <= by + 14) {
            this.active = false;
            return 'close';
        }

        // Header Drag
        if (mx >= this.x && mx <= this.x + this.w && my >= this.y && my <= this.y + 24) {
            return 'drag';
        }

        // Consume click inside window (prevent clicking game behind it)
        if (mx >= this.x && mx <= this.x + this.w && my >= this.y && my <= this.y + this.h) {
            return true;
        }

        return false;
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

    resize(w, h) {
        this.x = (w - this.w) / 2;
        this.y = (h - this.h) / 2;
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
            return 'close';
        }

        // Header Drag
        if (my < this.y + 24) {
            return 'drag';
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
