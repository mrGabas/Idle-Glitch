import { Window } from './Window.js';

export class PasswordWindow extends Window {
    /**
     * @param {Object} game - Game instance
     * @param {string} folderName - Name of the folder
     * @param {string} hint - Hint text
     * @param {string} targetPassword - The correct password to check against
     * @param {Function} onUnlock - Callback on successful unlock
     */
    constructor(game, folderName, hint, targetPassword, onUnlock) {
        const w = 300;
        const h = 180;
        const x = (game.w - w) / 2;
        const y = (game.h - h) / 2;
        super(x, y, w, h, "Security Check");

        this.game = game;
        this.folderName = folderName;
        this.hint = hint || "No hint available";
        this.targetPassword = targetPassword;
        this.onUnlock = onUnlock;

        this.inputBuffer = "";
        this.blinkTimer = 0;
        this.isError = false;
        this.errorTimer = 0;
    }

    update(dt) {
        this.blinkTimer += dt;
        if (this.isError) {
            this.errorTimer -= dt;
            if (this.errorTimer <= 0) {
                this.isError = false;
            }
        }
    }

    drawContent(ctx, x, y, w, h) {
        // Main Text
        ctx.fillStyle = '#000';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`Enter Password for:`, x + w / 2, y + 20);
        ctx.font = 'bold 12px Arial';
        ctx.fillText(this.folderName, x + w / 2, y + 36);

        // Input Box
        const boxW = 200;
        const boxH = 24;
        const boxX = x + (w - boxW) / 2;
        const boxY = y + 50;

        ctx.fillStyle = '#fff';
        ctx.strokeStyle = this.isError ? '#ff0000' : '#808080';
        ctx.lineWidth = 2;
        ctx.fillRect(boxX, boxY, boxW, boxH);
        ctx.strokeRect(boxX, boxY, boxW, boxH);
        ctx.lineWidth = 1;

        // Input Text (Masked)
        ctx.fillStyle = '#000';
        ctx.font = '14px Courier New'; // Monospace for password
        ctx.textAlign = 'left';

        // Mask password
        let displayStr = "*".repeat(this.inputBuffer.length);

        // Cursor
        if (this.active && Math.floor(this.blinkTimer * 3) % 2 === 0) {
            displayStr += "_";
        }

        ctx.fillText(displayStr, boxX + 5, boxY + 16);

        // Hint
        ctx.fillStyle = '#666';
        ctx.font = 'italic 10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`Hint: ${this.hint}`, x + w / 2, y + 90);

        // Error Message
        if (this.isError) {
            ctx.fillStyle = '#ff0000';
            ctx.font = 'bold 10px Arial';
            ctx.fillText("INCORRECT PASSWORD", x + w / 2, y + 105);
        }

        // Buttons
        const btnY = y + h - 35;
        this.drawBevelButton(ctx, x + 40, btnY, 80, 24, "OK");
        this.drawBevelButton(ctx, x + w - 120, btnY, 80, 24, "CANCEL");
    }

    checkClick(mx, my) {
        const res = super.checkClick(mx, my);
        if (res === 'close') {
            this.close();
            return 'close';
        }
        if (res === 'drag') return 'drag';

        // Helper for button detection
        // Note: Window.js checkClick returns 'consumed' if inside window but not handled.
        // We need to implement our button logic before returning.

        // Adjust to content coordinates logic if needed, but here simple rect check relative to window position

        // OK Button
        const btnY = this.y + 24 + (this.h - 28) - 35; // Matches draw logic: y + h - 35 essentially
        const okX = this.x + 4 + 40; // x + 40 in draw

        if (this.isPointInRect(mx, my, this.x + 40, this.y + 24 + (this.h - 28) - 35, 80, 24)) {
            this.submit();
            return 'consumed';
        }

        if (this.isPointInRect(mx, my, this.x + this.w - 120, this.y + 24 + (this.h - 28) - 35, 80, 24)) {
            this.close();
            return 'consumed';
        }

        if (this.isPointInRect(mx, my, this.x, this.y, this.w, this.h)) {
            return 'consumed';
        }

        return null;
    }

    isPointInRect(px, py, rx, ry, rw, rh) {
        return px >= rx && px <= rx + rw && py >= ry && py <= ry + rh;
    }

    handleKeyDown(e) {
        if (e.key === 'Enter') {
            this.submit();
            return;
        }

        if (e.key === 'Backspace') {
            if (this.inputBuffer.length > 0) {
                this.inputBuffer = this.inputBuffer.slice(0, -1);
                this.game.events.emit('play_sound', 'type');
            }
            return;
        }

        if (e.key === 'Escape') {
            this.close();
            return;
        }

        // Printable characters
        if (e.key.length === 1) {
            // Prevent excessive length
            if (this.inputBuffer.length < 20) {
                this.inputBuffer += e.key;
                this.game.events.emit('play_sound', 'type');
            }
        }
    }

    submit() {
        if (this.inputBuffer === this.targetPassword) {
            this.close();
            if (this.onUnlock) this.onUnlock();
        } else {
            this.isError = true;
            this.errorTimer = 1.0;
            this.inputBuffer = "";
            this.game.events.emit('play_sound', 'error');
        }
    }
}
