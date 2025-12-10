/**
 * Chat System
 * Handles console output and command execution.
 */
import { HelpCommand, ResetCommand, VerifyCommand } from '../commands/ConsoleCommands.js';
import { SCRIPT } from '../data/chatScripts.js';

export class ChatSystem {
    constructor(game) {
        this.game = game;
        this.messages = [];
        this.commands = {};

        // Input state
        this.inputBuffer = "";
        this.isFocused = false;
        this.cursorBlink = 0;

        // Load Script if it exists, else empty
        this.script = (SCRIPT || []).map(s => ({ ...s, shown: false }));

        this.registerCommands();

        this.addMessage('SYSTEM', 'Connecting to secure server...');
        this.addMessage('SYSTEM', 'Type /help for available commands.');
    }

    registerCommands() {
        this.addCommand(new HelpCommand(this.game));
        this.addCommand(new ResetCommand(this.game));
        this.addCommand(new VerifyCommand(this.game));
    }

    addCommand(cmd) {
        this.commands[cmd.name] = cmd;
    }

    update(dt) {
        // Script Logic could go here or in a NarrativeSystem
        const corruption = this.game.state.data.corruption;
        this.script.forEach(msg => {
            if (!msg.shown && corruption >= msg.trigger) {
                this.addMessage(msg.author, msg.text);
                msg.shown = true;
            }
        });

        // Decay messages
        this.messages.forEach(msg => {
            msg.life -= dt;
        });

        this.cursorBlink += dt;

        // Prune
        if (this.messages.length > 50) this.messages.shift();
    }

    addMessage(author, text) {
        this.messages.push({
            author,
            text,
            life: 15.0,
            timestamp: new Date().toLocaleTimeString('en-US', { hour12: false, hour: "numeric", minute: "numeric", second: "numeric" })
        });
    }

    // Input Handling

    handleKeyDown(e) {
        if (!this.isFocused) return;

        if (e.key === 'Enter') {
            if (this.inputBuffer.trim().length > 0) {
                this.execute(this.inputBuffer.trim());
                this.inputBuffer = "";
            }
        } else if (e.key === 'Backspace') {
            this.inputBuffer = this.inputBuffer.slice(0, -1);
        } else if (e.key.length === 1) {
            if (this.inputBuffer.length < 50) this.inputBuffer += e.key;
        }
    }

    execute(input) {
        this.addMessage('YOU', input);

        if (!input.startsWith('/')) {
            // Chat / Flavor text?
            return;
        }

        const args = input.slice(1).split(' ');
        const name = args[0].toLowerCase();

        const cmd = this.commands[name];
        if (cmd) {
            try {
                cmd.execute(args.slice(1));
            } catch (err) {
                console.error(err);
                this.addMessage('ERROR', 'Command failed execution.');
            }
        } else {
            this.addMessage('SYSTEM', `Unknown command: ${name}`);
        }
    }

    checkClick(mx, my, h) {
        // Simple hit test for focus
        // Hardcoded dimensions matching Renderer for now
        const boxH = 260;
        const boxW = 580;
        const x = 10;
        const y = h - boxH - 10;

        if (mx >= x && mx <= x + boxW && my >= y && my <= y + boxH) {
            this.isFocused = true;
            return true;
        } else {
            this.isFocused = false;
            return false;
        }
    }

    // Draw is handled by Renderer, but it needs access to messages and buffer.
    // The Renderer currently calls `entities.chat.draw(ctx, h)`.
    // We can keep `draw` method here for encapsulated rendering or let Renderer read props.
    // For "Separation of Logic and View", Renderer should strictly draw.
    // But since `drawConsole` is complex text layout, often it's easier to keep specific draw function 
    // in the system/component if it's UI.
    // Let's keep the `draw` method identical to the old one for compatibility with Renderer.

    draw(ctx, h) {
        // Copied from old chat.js (with minor fixes if needed)
        ctx.save();
        const boxH = 260; const boxW = 580; const x = 10; const y = h - boxH - 10;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        ctx.fillRect(x, y, boxW, boxH);
        ctx.strokeStyle = this.isFocused ? '#0f0' : '#333';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, boxW, boxH);

        ctx.fillStyle = '#222';
        ctx.fillRect(x, y, boxW, 20);
        ctx.fillStyle = '#0f0';
        ctx.font = "12px 'Courier New', monospace";
        ctx.textAlign = 'left';
        ctx.fillText("> DEBUG_CONSOLE_V.0.9 [USER: GUEST]", x + 5, y + 14);

        // Clip content
        ctx.beginPath(); ctx.rect(x, y + 20, boxW, boxH - 50); ctx.clip();
        ctx.font = "20px 'VT323', monospace";

        const visibleMsgs = this.messages.slice(-6);
        visibleMsgs.forEach((msg, i) => {
            const msgY = y + 40 + (i * 20);
            let color = '#ccc';
            if (msg.author === 'Admin_Alex') color = '#55ff55';
            if (msg.author === 'SYSTEM') color = '#ffff55';
            if (msg.author === 'YOU') color = '#00ffff';
            ctx.fillStyle = color;
            ctx.fillText(`[${msg.timestamp}] [${msg.author}]: ${msg.text}`, x + 8, msgY);
        });
        ctx.restore();

        // Input
        const inputY = y + boxH - 10;
        ctx.fillStyle = '#0f0';
        ctx.font = "20px 'VT323', monospace";
        const cursor = (Math.floor(this.cursorBlink * 2) % 2 === 0 && this.isFocused) ? "_" : "";
        ctx.fillText(`> ${this.inputBuffer}${cursor}`, x + 10, inputY);
    }
}
