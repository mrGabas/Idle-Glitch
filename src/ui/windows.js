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

export class NotepadWindowOld extends Window {
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
                let currentX = x + 10 + sx;
                const words = line.split(" ");

                words.forEach((word, index) => {
                    // Add space after word if it's not the last word in line
                    // Note: getLines joins by " ", so we need to account for that space in measurement?
                    // Actually, we should draw the word, then add space width. 
                    // But wait, if we assume single space separation:

                    let drawText = word;
                    let drawColor = '#000';

                    // Parse Custom Color Tags: {color|text}
                    if (word.startsWith('{') && word.includes('|') && word.endsWith('}')) {
                        const parts = word.slice(1, -1).split('|');
                        if (parts.length === 2) {
                            drawColor = parts[0];
                            drawText = parts[1];
                        }
                    }

                    ctx.fillStyle = drawColor;
                    ctx.fillText(drawText, currentX, ly);

                    // Update cursor position
                    // We need to add the width of the word + a space
                    // But we don't want to add a space after the very last word of the line effectively if we want to be perfect, 
                    // though for simple left align it matters less visually if there is trailing transparent space.
                    const metric = ctx.measureText(drawText + " ");
                    currentX += metric.width;
                });

                ly += 20;
            });
        }
    }

    tokenize(text) {
        const tokens = [];
        const parts = text.split(/({[^|]+\|[^}]+})/g);

        parts.forEach(part => {
            if (!part) return;

            let partText = part;
            let partColor = '#000';

            if (part.startsWith('{') && part.includes('|') && part.endsWith('}')) {
                const content = part.slice(1, -1);
                const pipeIndex = content.indexOf('|');
                if (pipeIndex !== -1) {
                    partColor = content.substring(0, pipeIndex);
                    partText = content.substring(pipeIndex + 1);
                }
            }

            const subParts = partText.split(/(\s+)/);

            subParts.forEach(sub => {
                if (sub.length > 0) {
                    tokens.push({
                        text: sub,
                        color: partColor
                    });
                }
            });
        });

        return tokens;
    }

    getLines(ctx, tokens, maxWidth) {
        const lines = [];
        let currentLine = [];
        let currentLineWidth = 0;

        for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i];

            if (token.text.includes('\n')) {
                lines.push(currentLine);
                currentLine = [];
                currentLineWidth = 0;
                continue;
            }

            const tokenWidth = ctx.measureText(token.text).width;

            if (currentLineWidth + tokenWidth > maxWidth && currentLineWidth > 0) {
                lines.push(currentLine);

                if (!/^\s+$/.test(token.text)) {
                    currentLine = [token];
                    currentLineWidth = tokenWidth;
                } else {
                    currentLine = [];
                    currentLineWidth = 0;
                }
            } else {
                currentLine.push(token);
                currentLineWidth += tokenWidth;
            }
        }

        if (currentLine.length > 0) {
            lines.push(currentLine);
        }

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
        this.scrollY = 0;
        this.maxScroll = 0;
        this.contentHeight = 0; // Calculated on draw/update
    }

    onScroll(deltaY) {
        if (this.locked) return;

        const scrollSpeed = 30;
        this.scrollY += Math.sign(deltaY) * scrollSpeed;

        // Clamp
        if (this.scrollY < 0) this.scrollY = 0;
        if (this.scrollY > this.maxScroll) this.scrollY = this.maxScroll;
    }

    tokenize(text) {
        const tokens = [];
        // Pattern: {color|text}
        // Splits into: [pre, tag, post, tag, ...]
        const parts = text.split(/({[^|]+\|[^}]+})/g);

        parts.forEach(part => {
            if (!part) return;

            // Default state
            let partText = part;
            let partColor = '#000';

            // Check if this segment is a tag
            if (part.startsWith('{') && part.includes('|') && part.endsWith('}')) {
                // Remove wrappers
                const content = part.slice(1, -1);
                // Split on first pipe only
                const pipeIndex = content.indexOf('|');
                if (pipeIndex !== -1) {
                    partColor = content.substring(0, pipeIndex);
                    partText = content.substring(pipeIndex + 1);
                }
            }

            // Split into characters or words? 
            // For complex wrapping (breaking long words), we can tokenize by words first, but we handle splitting in getLines.
            // Let's keep word-based tokens but split large words if needed in getLines.
            // Actually, let's just keep tokens as chunks of colored text.
            tokens.push({
                text: partText,
                color: partColor
            });
        });

        return tokens;
    }

    getLines(ctx, tokens, maxWidth) {
        const lines = [];
        let currentLine = [];
        let currentLineWidth = 0;

        // Process each colored token
        for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i];
            const color = token.color;

            // We need to process text character by character or word by word to wrap correctly
            // Let's split by spaces to respect word boundaries, but also split by chars if a word is too long.

            // "Hello world" -> ["Hello", " ", "world"]
            const words = token.text.split(/(\s+)/);

            for (let j = 0; j < words.length; j++) {
                const word = words[j];
                if (word.length === 0) continue;

                if (word.includes('\n')) {
                    // Handle newlines explicitly if they are preserved in tokens (regex above didn't handle \n well if inside words)
                    // But assume \n comes in as separate whitespace token or inside text.
                    // Let's handle explicit newline characters if present.
                    const subParts = word.split('\n');
                    subParts.forEach((sub, idx) => {
                        if (idx > 0) {
                            // Force new line
                            lines.push(currentLine);
                            currentLine = [];
                            currentLineWidth = 0;
                        }
                        if (sub.length > 0) {
                            // Process sub-word
                            this.addTextToLine(ctx, sub, color, lines, currentLine, currentLineWidth, maxWidth, (l, w) => { currentLine = l; currentLineWidth = w; });
                        }
                    });
                    continue;
                }

                this.addTextToLine(ctx, word, color, lines, currentLine, currentLineWidth, maxWidth, (l, w) => { currentLine = l; currentLineWidth = w; });
            }
        }

        if (currentLine.length > 0) {
            lines.push(currentLine);
        }

        return lines;
    }

    addTextToLine(ctx, text, color, lines, currentLine, currentLineWidth, maxWidth, updateState) {
        const w = ctx.measureText(text).width;

        // If fits, add it
        if (currentLineWidth + w <= maxWidth) {
            currentLine.push({ text: text, color: color });
            updateState(currentLine, currentLineWidth + w);
            return;
        }

        // If whitespace and doesn't fit, just skip/newline?
        if (/^\s+$/.test(text)) {
            // Newline
            lines.push(currentLine);
            updateState([], 0);
            return;
        }

        // If word fits on a NEW line, push current line and start new
        if (w <= maxWidth) {
            lines.push(currentLine);
            const newLine = [{ text: text, color: color }];
            updateState(newLine, w);
            return;
        }

        // If word is bigger than maxWidth, we MUST split it
        let remaining = text;

        // If current line is not empty, push it first
        if (currentLineWidth > 0) {
            lines.push(currentLine);
            currentLine = [];
            currentLineWidth = 0;
            updateState(currentLine, currentLineWidth);
        }

        while (remaining.length > 0) {
            // Find how many chars fit
            let c = 1;
            while (c <= remaining.length && ctx.measureText(remaining.substring(0, c)).width <= maxWidth) {
                c++;
            }
            c--; // Backtrack one

            if (c === 0) c = 1; // Force at least 1 char even if invalid

            const chunk = remaining.substring(0, c);

            // Push this chunk as a line (since we know it fills the width mostly)
            // Unless it's the very last chunk which might be short.

            if (c < remaining.length) {
                // It was a full line chunk
                lines.push([{ text: chunk, color: color }]);
                remaining = remaining.substring(c);
            } else {
                // Last chunk
                currentLine.push({ text: chunk, color: color });
                currentLineWidth = ctx.measureText(chunk).width;
                updateState(currentLine, currentLineWidth);
                remaining = "";
            }
        }
    }

    drawContent(ctx, x, y, w, h) {
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
        ctx.font = "16px 'Courier New', monospace";

        if (this.locked) {
            // Password Prompt
            ctx.fillStyle = '#000';
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
            // Rich Text Content
            ctx.textAlign = 'left';

            // Clip
            ctx.save();
            ctx.beginPath();
            ctx.rect(x, ty, w, th);
            ctx.clip();

            // 1. Tokenize
            const tokens = this.tokenize(this.content);
            // 2. Wrap
            const lines = this.getLines(ctx, tokens, w - 20);

            const lineHeight = 20;
            this.contentHeight = lines.length * lineHeight;

            // Max scroll is difference between content height and view height
            // View height is th - padding?
            const viewH = th - 10;
            this.maxScroll = Math.max(0, this.contentHeight - viewH);

            // Clamp ScrollY again
            if (this.scrollY < 0) this.scrollY = 0;
            if (this.scrollY > this.maxScroll) this.scrollY = this.maxScroll;

            let ly = ty + 10 - this.scrollY;

            lines.forEach(line => {
                // Optimization: Don't draw if out of view
                if (ly + lineHeight < ty || ly > ty + th) {
                    ly += lineHeight;
                    return;
                }

                let currentX = x + 10 + sx;

                line.forEach(token => {
                    ctx.fillStyle = token.color;
                    ctx.fillText(token.text, currentX, ly + 14); // +14 for baseline adjustment approx
                    currentX += ctx.measureText(token.text).width;
                });

                ly += lineHeight;
            });

            ctx.restore();

            // Draw Scrollbar if needed
            if (this.maxScroll > 0) {
                const scrollBarH = th;
                const scrollBarX = x + w - 10;

                // Track
                ctx.fillStyle = '#ddd';
                ctx.fillRect(scrollBarX, ty, 10, scrollBarH);

                // Thumb
                const ratio = Math.min(1, viewH / this.contentHeight);
                const thumbH = Math.max(20, scrollBarH * ratio);
                const scrollRatio = this.scrollY / this.maxScroll;
                const thumbY = ty + (scrollBarH - thumbH) * scrollRatio;

                ctx.fillStyle = '#888';
                ctx.fillRect(scrollBarX + 1, thumbY, 8, thumbH);
            }
        }
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

export class ConfirmationWindow extends Window {
    constructor(gameW, gameH, title, message, onConfirm, style = 'default', buttonLabels = ['CONFIRM', 'CANCEL']) {
        const w = 320;
        const h = 180;
        const x = (gameW - w) / 2;
        const y = (gameH - h) / 2;

        super(x, y, w, h, title || "Confirm");

        this.message = message || "Are you sure?";
        this.onConfirm = onConfirm;
        this.style = style; // 'default' or 'bios'
        this.buttonLabels = buttonLabels;
    }

    draw(ctx) {
        if (this.style === 'bios') {
            if (!this.active) return;

            // BIOS Style Draw
            // Blue Background
            ctx.fillStyle = '#c0c0c0'; // Shadow/Outer
            ctx.fillRect(this.x + 4, this.y + 4, this.w, this.h);

            ctx.fillStyle = '#0000aa'; // Main Blue
            ctx.fillRect(this.x, this.y, this.w, this.h);

            // Double Border
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.strokeRect(this.x + 2, this.y + 2, this.w - 4, this.h - 4);
            ctx.lineWidth = 1;
            ctx.strokeRect(this.x + 5, this.y + 5, this.w - 10, this.h - 10);

            // Title (Centered, White on Blue)
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 16px Courier New';
            ctx.textAlign = 'center';
            ctx.fillText(this.title.toUpperCase(), this.x + this.w / 2, this.y + 25);

            // Separator Line
            ctx.beginPath();
            ctx.moveTo(this.x + 10, this.y + 35);
            ctx.lineTo(this.x + this.w - 10, this.y + 35);
            ctx.stroke();

            // Delegate to drawContent for internals
            // Content area usually starts below title.
            this.drawContent(ctx, this.x + 10, this.y + 40, this.w - 20, this.h - 50);
        } else {
            // Default Win95 Style
            super.draw(ctx);
        }
    }

    drawContent(ctx, x, y, w, h) {
        // Message
        ctx.fillStyle = this.style === 'bios' ? '#fff' : '#000';
        ctx.font = this.style === 'bios' ? '14px Courier New' : '14px Arial';
        ctx.textAlign = 'center';

        // Multi-line support
        const lines = this.message.split('\n');
        lines.forEach((line, i) => {
            ctx.fillText(line, x + w / 2, y + 30 + (i * 20)); // Adjusted Y for content area
        });

        // Buttons
        const bw = 100;
        const bh = 30;
        const gap = 20;

        const by = y + h - 40; // 40px from bottom

        if (this.buttonLabels.length === 1) {
            // Single Button Centered
            const bx = x + w / 2 - bw / 2;
            if (this.style === 'bios') {
                this.drawBiosButton(ctx, bx, by, bw, bh, this.buttonLabels[0]);
            } else {
                this.drawBevelButton(ctx, bx, by, bw, bh, this.buttonLabels[0]);
            }
        } else {
            // Two Buttons (Standard)
            const b1x = x + w / 2 - bw - gap / 2;
            const b2x = x + w / 2 + gap / 2;

            if (this.style === 'bios') {
                this.drawBiosButton(ctx, b1x, by, bw, bh, this.buttonLabels[0]);
                this.drawBiosButton(ctx, b2x, by, bw, bh, this.buttonLabels[1]);
            } else {
                this.drawBevelButton(ctx, b1x, by, bw, bh, this.buttonLabels[0]);
                this.drawBevelButton(ctx, b2x, by, bw, bh, this.buttonLabels[1]);
            }
        }
    }

    /**
     * Helper for BIOS style buttons
     */
    drawBiosButton(ctx, x, y, w, h, text) {
        // Simple White/Grey rect with text? Or Blue logic?
        // Let's use Red/Green logic like in BIOS implementation
        // But we don't have mouse hover state accessible easily inside specific button draw without tracking
        // For simplicity: White Background, Black Text (Classic BIOS selected look) or Grey.

        // Actually let's use Simple Border
        ctx.fillStyle = '#0000aa';
        ctx.fillRect(x, y, w, h);
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, w, h);

        // Text
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 14px Courier New';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, x + w / 2, y + h / 2);
    }

    checkClick(mx, my) {
        const baseRes = super.checkClick(mx, my);
        if (baseRes === 'close' || baseRes === 'drag') return baseRes;

        // Re-Calculate Button Positions
        // NOTE: We need to match drawContent logic exactly.
        const bw = 100;
        const bh = 30;
        const gap = 20;

        let contentX, contentY, contentW, contentH;

        if (this.style === 'bios') {
            contentX = this.x + 10;
            contentY = this.y + 40;
            contentW = this.w - 20;
            contentH = this.h - 50;
        } else {
            contentX = this.x + 4;
            contentY = this.y + 24;
            contentW = this.w - 8;
            contentH = this.h - 28;
        }

        const by = contentY + contentH - 40;

        if (this.buttonLabels.length === 1) {
            const bx = contentX + contentW / 2 - bw / 2;
            if (mx >= bx && mx <= bx + bw && my >= by && my <= by + bh) {
                if (this.onConfirm) this.onConfirm();
                this.close();
                return 'consumed';
            }
        } else {
            const b1x = contentX + contentW / 2 - bw - gap / 2;
            const b2x = contentX + contentW / 2 + gap / 2;

            // Confirm (Left)
            if (mx >= b1x && mx <= b1x + bw && my >= by && my <= by + bh) {
                if (this.onConfirm) this.onConfirm();
                this.close();
                return 'consumed';
            }

            // Cancel (Right)
            if (mx >= b2x && mx <= b2x + bw && my >= by && my <= by + bh) {
                this.close();
                return 'consumed';
            }
        }

        return baseRes === 'consumed' ? 'consumed' : null;
    }
}

export class CongratulationsWindow extends Window {
    constructor(gameW, gameH, onConfirm) {
        super(0, 0, gameW, gameH, "CONGRATULATIONS");
        this.onConfirm = onConfirm;

        // Animation
        this.alpha = 0;
        this.particles = [];
        for (let i = 0; i < 50; i++) {
            this.particles.push({
                x: Math.random() * gameW,
                y: Math.random() * gameH,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                color: Math.random() > 0.5 ? '#00eaff' : '#ff00ea',
                size: Math.random() * 3
            });
        }
    }

    update(dt) {
        if (this.alpha < 1) this.alpha += dt * 2;

        // Update particles
        this.particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            if (p.x < 0) p.x = this.w;
            if (p.x > this.w) p.x = 0;
            if (p.y < 0) p.y = this.h;
            if (p.y > this.h) p.y = 0;
        });
    }

    draw(ctx) {
        if (!this.active) return;

        ctx.save();

        // Background - Dark Gradient
        const grad = ctx.createRadialGradient(this.w / 2, this.h / 2, 0, this.w / 2, this.h / 2, this.w);
        grad.addColorStop(0, 'rgba(20, 20, 30, 0.95)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0.98)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, this.w, this.h);

        // Particles
        ctx.globalAlpha = 0.5 * this.alpha;
        this.particles.forEach(p => {
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        });

        ctx.globalAlpha = this.alpha;

        // Content Container
        const cx = this.w / 2;
        const cy = this.h / 2;

        // Title
        ctx.shadowColor = '#00eaff';
        ctx.shadowBlur = 20;
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 48px Arial'; // Simplified font, assuming available
        ctx.textAlign = 'center';
        ctx.fillText("CONGRATULATIONS", cx, cy - 100);

        // Subtitle
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#ccc';
        ctx.font = '24px "Courier New", monospace';
        ctx.fillText("Through the noise, you found the signal.", cx, cy - 40);

        // Command Info
        ctx.fillStyle = '#00eaff';
        ctx.font = 'bold 28px "Courier New", monospace';
        ctx.fillText("COMMAND UNLOCKED: /reset", cx, cy + 30);

        ctx.fillStyle = '#aaa';
        ctx.font = '18px Arial';
        ctx.fillText("Use it in the terminal to enter the BIOS.", cx, cy + 70);

        // Button
        const bw = 200;
        const bh = 50;
        const by = cy + 150;
        const bx = cx - bw / 2;

        // Button Glow
        ctx.shadowColor = '#00eaff';
        ctx.shadowBlur = 15;
        ctx.fillStyle = '#000';
        ctx.fillRect(bx, by, bw, bh);
        ctx.strokeStyle = '#00eaff';
        ctx.lineWidth = 2;
        ctx.strokeRect(bx, by, bw, bh);

        // Button Text
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#00eaff';
        ctx.font = 'bold 20px Arial';
        ctx.fillText("CONTINUE", cx, by + 32);

        ctx.restore();
    }

    checkClick(mx, my) {
        if (!this.active) return null;

        const cx = this.w / 2;
        const cy = this.h / 2;
        const bw = 200;
        const bh = 50;
        const by = cy + 150;
        const bx = cx - bw / 2;

        if (mx >= bx && mx <= bx + bw && my >= by && my <= by + bh) {
            if (this.onConfirm) this.onConfirm();
            this.close();
            return 'consumed';
        }

        return 'consumed'; // Consume all clicks to block background
    }
}

