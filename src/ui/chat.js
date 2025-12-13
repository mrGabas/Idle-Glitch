/**
 * CHAT SYSTEM
 * @module ui/chat
 */
import { SCRIPT } from '../data/chatScripts.js';
import { CursedCaptcha } from '../entities/enemies.js';
import { MinigameWindow } from './MinigameWindow.js';
import { SnakeGame } from '../minigames/SnakeGame.js';

const THEME_AMBIENT_MESSAGES = {
    firewall: [
        { author: 'SYSTEM', text: 'Intrusion detected. Deploying Healer Bots.' },
        { author: 'SYSTEM', text: 'Packet loss at 99%.' },
        { author: 'SYSTEM', text: 'Unauthorized port access attempts blocked.' }
    ],
    corporate_network: [
        { author: 'Boss', text: 'Meeting in 5 minutes.' },
        { author: 'HR', text: 'Please stop clicking so loud.' },
        { author: 'IT_Desk', text: 'Did you try turning it off and on again?' }
    ],
    beta_build: [
        { author: 'Dev', text: 'TODO - Fix physics engine.' },
        { author: 'Error', text: "Texture 'skybox' not found." },
        { author: 'Console', text: 'Uncaught ReferenceError: fun is not defined.' }
    ],
    server_farm: [
        { author: 'Monitoring', text: 'Fan speed: 120% (CRITICAL)' },
        { author: 'Alert', text: 'Temperature threshold exceeded.' },
        { author: 'SysAdmin', text: 'Who turned off the AC?!' }
    ],
    dev_desktop: [
        { author: 'Clippy', text: 'It looks like you are trying to destroy the universe. Need help?' },
        { author: 'WinXP', text: 'Updates are ready to install.' },
        { author: 'Nortan', text: 'Virus definition updated.' }
    ],
    digital_decay: [
        { author: 'DarkWeb', text: 'New package arrived.' },
        { author: 'Anon', text: 'They are watching.' },
        { author: 'Proxy', text: 'Rerouting connection...' }
    ],
    legacy_system: [
        { author: 'BIOS', text: 'Keyboard error or no keyboard present.' },
        { author: 'DOS', text: 'Abort, Retry, Fail?' },
        { author: 'Himem', text: 'Memory test passed.' }
    ],
    null_void: [
        { author: 'VOID', text: '...' },
        { author: 'VOID', text: 'Nothing happens.' },
        { author: 'VOID', text: 'It stops.' }
    ],
    ad_purgatory: [
        { author: 'SpamBot', text: 'CONGRATULATIONS! YOU WON!' },
        { author: 'SpamBot', text: 'Single electrons in your area!' },
        { author: 'System', text: 'Popup blocked (or was it?)' }
    ]
};

export class ChatSystem {
    constructor(game) {
        this.game = game; // Store game ref for commands
        this.messages = [];
        // Copy script to track shown state
        this.script = SCRIPT.map(s => ({ ...s, shown: false }));

        this.inputBuffer = "";
        this.isFocused = false;
        this.cursorBlink = 0;
        this.ambientTimer = 10; // First message after 10s

        // Welcome message
        this.addMessage('SYSTEM', 'Connecting to secure server...');
        this.addMessage('SYSTEM', 'Type /help for available commands.');
    }

    update(dt, corruption) {
        // 1. Check triggers
        this.script.forEach(msg => {
            if (!msg.shown && corruption >= msg.trigger) {
                this.addMessage(msg.author, msg.text);
                msg.shown = true;
            }
        });

        // 2. Ambient Messages
        if (this.ambientTimer > 0) {
            this.ambientTimer -= dt;
        } else {
            this.triggerAmbientMessage();
            this.ambientTimer = 20 + Math.random() * 20; // 20-40 seconds
        }

        // 3. Update timers
        this.messages.forEach((msg) => {
            msg.life -= dt;
        });

        this.cursorBlink += dt;

        // Remove old messages
        if (this.messages.length > 8) {
            this.messages.shift();
        }
    }

    triggerAmbientMessage() {
        if (!this.game || !this.game.themeManager) return;

        const currentTheme = this.game.themeManager.currentTheme.id;
        const messages = THEME_AMBIENT_MESSAGES[currentTheme];

        if (messages && messages.length > 0) {
            const msg = messages[Math.floor(Math.random() * messages.length)];
            this.addMessage(msg.author, msg.text);
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

        // Border (Highlight if focused)
        ctx.strokeStyle = this.isFocused ? '#0f0' : '#333';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, boxW, boxH);

        // Header
        ctx.fillStyle = '#222';
        ctx.fillRect(x, y, boxW, 20);
        ctx.fillStyle = '#0f0';
        ctx.font = "12px 'Courier New', monospace";
        ctx.textAlign = 'left';
        ctx.fillText("> DEBUG_CONSOLE_V.0.9 [USER: GUEST]", x + 5, y + 14);

        // 2. Messages
        ctx.beginPath();
        ctx.rect(x, y + 20, boxW, boxH - 50); // Leave room for input
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
            if (msg.author === 'YOU') color = '#00ffff';

            ctx.fillStyle = color;

            const line = `[${msg.timestamp}] [${msg.author}]: ${msg.text}`;
            ctx.fillText(line, x + 8, msgY);
        });

        ctx.restore(); // Restore clip

        // 3. Input Line
        const inputY = y + boxH - 10;
        ctx.fillStyle = '#0f0';
        ctx.font = "20px 'VT323', monospace";
        ctx.textAlign = 'left';

        const cursor = (Math.floor(this.cursorBlink * 2) % 2 === 0 && this.isFocused) ? "_" : "";
        ctx.fillText(`> ${this.inputBuffer}${cursor}`, x + 10, inputY);

        if (!this.isFocused) {
            ctx.fillStyle = '#666';
            ctx.font = "14px 'Courier New', monospace";
            ctx.fillText("(Click to type)", x + boxW - 120, inputY);
        }
    }

    checkClick(mx, my, h) {
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

    handleKeyDown(e) {
        if (!this.isFocused) return;

        if (e.key === 'Enter') {
            if (this.inputBuffer.trim().length > 0) {
                this.processCommand(this.inputBuffer.trim());
                this.inputBuffer = "";
            }
        } else if (e.key === 'Backspace') {
            this.inputBuffer = this.inputBuffer.slice(0, -1);
        } else if (e.key.length === 1) {
            if (this.inputBuffer.length < 50) {
                this.inputBuffer += e.key;
            }
        }
        // Prevent default for some keys to avoid scrolling/browser actions? 
        // Might be tricky in this context, leaving standard event propagation.
    }

    processCommand(cmd) {
        this.addMessage('YOU', cmd);

        const args = cmd.split(' ');
        const command = args[0].toLowerCase();

        // ... existing code ...

        switch (command) {
            case '/help':
                this.addMessage('SYSTEM', 'Available commands:');
                this.addMessage('SYSTEM', '/help - Show this list');
                this.addMessage('SYSTEM', '/snake - Launch SNAKE.EXE');
                this.addMessage('SYSTEM', '/reset - Reboot system');
                this.addMessage('SYSTEM', '/clear - Clear console');
                this.addMessage('SYSTEM', '/verify <code_id> - Bypass captcha manually');
                break;
            case '/snake':
                this.addMessage('SYSTEM', 'Launching SNAKE.EXE...');
                this.game.uiManager.windowManager.add(new MinigameWindow(this.game.w, this.game.h, new SnakeGame(this.game)));
                this.game.events.emit('play_sound', 'click');
                break;
            case '/reset':
                this.addMessage('SYSTEM', 'INITIATING SYSTEM REBOOT...');
                setTimeout(() => {
                    this.game.triggerCrash(); // Or soft reset
                }, 1000);
                break;
            case '/clear':
                this.messages = [];
                this.addMessage('SYSTEM', 'Console cleared.');
                break;
            case '/verify':
            case '/unlock':
            case '/login':
                // Check if user is trying to unlock a file
                if (this.game.uiManager.activeNotepad && this.game.uiManager.activeNotepad.locked) {
                    const pass = args[1];
                    if (!pass) {
                        this.addMessage('SYSTEM', 'Usage: /verify <password>');
                    } else if (pass === this.game.uiManager.activeNotepad.password) {
                        this.game.uiManager.activeNotepad.locked = false;
                        this.game.uiManager.activeNotepad.title = "Notepad.exe [DECRYPTED]";
                        this.addMessage('SYSTEM', 'ACCESS GRANTED. FILE DECRYPTED.');
                        this.game.events.emit('play_sound', 'buy');
                    } else {
                        this.addMessage('SYSTEM', 'ACCESS DENIED. INCORRECT PASSWORD.');
                        this.game.events.emit('play_sound', 'error');
                        this.game.uiManager.activeNotepad.shake = 10;
                    }
                    break;
                }

                // Active Captchas?
                const enemies = this.game.entities.getAll('enemies');
                const captchaIndex = enemies.findIndex(e => e instanceof CursedCaptcha);

                if (captchaIndex !== -1) {
                    this.addMessage('SYSTEM', 'Verifying integrity...');
                    // Clear one captcha
                    enemies.splice(captchaIndex, 1);
                    this.addMessage('SYSTEM', 'Threat neutralized.');
                    this.game.events.emit('play_sound', 'buy');
                    break;
                }

                this.addMessage('SYSTEM', 'No active security protocols to verify.');
                break;
            case '/delete_glitch':
                if (this.game.state.corruption > 0) {
                    this.game.state.corruption = Math.max(0, this.game.state.corruption - 10);
                    this.addMessage('SYSTEM', 'Anti-virus sub-routine executed. Corruption reduced.');
                    this.game.events.emit('play_sound', 'buy');
                } else {
                    this.addMessage('SYSTEM', 'No corruption detected.');
                }
                break;
            case '/root':
            case '/admin':
                this.addMessage('SYSTEM', 'ACCESS DENIED. ROOT PRIVILEGES REQUIRED.');
                break;
            case 'hello':
                this.addMessage('SYSTEM', 'Hello user.');
                break;
            case '/wake_up':
                if (this.game.state.corruption < 100) {
                    this.addMessage('SYSTEM', 'I AM ALREADY AWAKE.');
                    this.game.events.emit('play_sound', 'glitch');
                    this.game.state.addCorruption(5);
                } else {
                    this.addMessage('SYSTEM', 'YOU CANNOT WAKE WHAT DOES NOT SLEEP.');
                }
                break;

            case '/delete_gabas':
                this.addMessage('SYSTEM', 'ERROR: PERMISSION DENIED. HE IS WATCHING.');
                this.game.shake = 10;
                this.game.events.emit('play_sound', 'error');
                break;

            case '/felix':
                this.addMessage('SYSTEM', 'Memory file found. Playing purr.wav...');
                // Heart particle
                if (this.game.themeManager) {
                    this.game.createFloatingText(this.game.w / 2, this.game.h / 2, "<3", "#ff55ff");
                }
                // Bonus
                this.game.state.addScore(this.game.state.autoRate * 60 + 100); // 1 minute of production
                this.game.events.emit('play_sound', 'purr'); // Positive feedback
                break;

            case '/sarcophagus':
                this.addMessage('SYSTEM', '       .---.');
                this.addMessage('SYSTEM', '      /     \\');
                this.addMessage('SYSTEM', '      | (_) |');
                this.addMessage('SYSTEM', '      \\     /');
                this.addMessage('SYSTEM', '       `---`');
                this.addMessage('SYSTEM', 'THE EYE IS OPEN.');
                break;

            default:
                this.addMessage('SYSTEM', `Unknown command: ${command}`);
                break;
        }
    }
}
