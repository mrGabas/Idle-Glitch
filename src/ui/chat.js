/**
 * CHAT SYSTEM
 * @module ui/chat
 */
import { SCRIPT } from '../data/chatScripts.js';

export class ChatSystem {
    constructor() {
        this.messages = [];
        // Copy script to track shown state
        this.script = SCRIPT.map(s => ({ ...s, shown: false }));

        // Welcome message
        this.addMessage('SYSTEM', 'Connecting to secure server...');
    }

    update(dt, corruption) {
        // 1. Check triggers
        this.script.forEach(msg => {
            if (!msg.shown && corruption >= msg.trigger) {
                this.addMessage(msg.author, msg.text);
                msg.shown = true;
            }
        });

        // 2. Update timers
        this.messages.forEach((msg) => {
            msg.life -= dt;
        });

        // Remove old messages
        if (this.messages.length > 8) {
            this.messages.shift();
        }
    }

    addMessage(author, text) {
        this.messages.push({
            author: author,
            text: text,
            life: 15.0, // Long life
            timestamp: new Date().toLocaleTimeString('en-US', { hour12: false, hour: "numeric", minute: "numeric", second: "numeric" })
        });
    }

    draw(ctx, h) {
        ctx.save();

        // --- CONSOLE SETTINGS ---
        const boxH = 260;   // Height
        const boxW = 580;   // Width
        const x = 10;       // Margin Left
        const y = h - boxH - 10; // Margin Bottom

        // 1. Terminal Window
        ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        ctx.fillRect(x, y, boxW, boxH);

        // Border
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, boxW, boxH);

        // Header
        ctx.fillStyle = '#222';
        ctx.fillRect(x, y, boxW, 20);
        ctx.fillStyle = '#0f0';
        ctx.font = "12px 'Courier New', monospace";
        ctx.textAlign = 'left';
        ctx.fillText("> DEBUG_CONSOLE_V.0.9", x + 5, y + 14);

        // 2. Messages
        ctx.beginPath();
        ctx.rect(x, y + 20, boxW, boxH - 20);
        ctx.clip();

        ctx.font = "20px 'VT323', monospace";

        // Last 6 messages
        const visibleMsgs = this.messages.slice(-6);

        visibleMsgs.forEach((msg, i) => {
            const msgY = y + 40 + (i * 20);

            // Color by author
            let color = '#ccc';
            if (msg.author === 'Admin_Alex') color = '#55ff55';
            if (msg.author === 'SYSTEM') color = '#ffff55';
            if (msg.author === 'UNKNOWN' || msg.author === '???') color = '#ff3333';

            ctx.fillStyle = color;

            const line = `[${msg.timestamp}] [${msg.author}]: ${msg.text}`;
            ctx.fillText(line, x + 8, msgY);
        });

        ctx.restore();
    }
}
