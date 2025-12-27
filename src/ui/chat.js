/**
 * CHAT SYSTEM
 * @module ui/chat
 */
import { SCRIPT } from '../data/chatScripts.js';
import { CursedCaptcha } from '../entities/enemies.js';
import { MinigameWindow } from './MinigameWindow.js';
import { SnakeGame } from '../minigames/SnakeGame.js';
import { CFG } from '../core/config.js';

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

        this.scrollOffset = 0;
        this.maxScroll = 0;

        // Collapsed State
        this.collapsed = false;

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

        // Remove old messages (Limit 100)
        if (this.messages.length > 100) {
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
        // Auto-scroll to bottom on new message if near bottom
        if (this.scrollOffset < 50) {
            this.scrollOffset = 0;
        }
    }

    handleScroll(deltaY) {
        this.handleWheel(deltaY);
    }

    handleWheel(deltaY) {
        if (this.collapsed) return; // No scroll if collapsed

        // Invert delta because dragging Down (negative dy) should move content Down (increase offset)
        // Wheel Down (positive) -> scrollOffset decreases (Show Newest)
        // DeltaY from MouseMove: lastY - currY. 
        // Drag Down -> currY > lastY -> deltaY < 0.
        // We want Drag Down -> Scroll Up (History). offset increases.
        // So if deltaY < 0, offset should increase.
        // this.scrollOffset -= deltaY; // -(-5) = +5.

        this.scrollOffset -= deltaY;

        // Clamp
        if (this.scrollOffset < 0) this.scrollOffset = 0;
        if (this.scrollOffset > this.maxScroll) this.scrollOffset = this.maxScroll;
    }

    isMouseOver(mx, my, h) {
        const boxH = this.collapsed ? 20 : 260; // Dynamic Height
        const boxW = 580;
        const x = 10;
        const y = h - boxH - 10;

        return mx >= x && mx <= x + boxW && my >= y && my <= y + boxH;
    }

    wrapText(ctx, text, maxWidth) {
        const words = text.split(' ');
        let lines = [];
        let currentLine = words[0];

        for (let i = 1; i < words.length; i++) {
            const word = words[i];
            const width = ctx.measureText(currentLine + " " + word).width;
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

    draw(ctx, h) {
        ctx.save();

        // --- CONSOLE SETTINGS ---
        const boxH = this.collapsed ? 20 : 260;   // Dynamic Height
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
        const displayUser = (this.game.playerName || "GUEST").toUpperCase();
        ctx.fillText(`> DEBUG_CONSOLE_V.0.9 [USER: ${displayUser}]`, x + 5, y + 14);

        // Collapse/Expand Button
        const btnX = x + boxW - 20;
        const btnY = y + 2;
        ctx.fillStyle = this.isMouseOver(this.game.mouse.x, this.game.mouse.y, h) && this.game.mouse.x > btnX
            ? '#444' : '#222'; // Hover effect check logic needs care, doing simple assumption or just text
        // Actually button hitbox check happens in checkClick. Here just draw.

        ctx.fillStyle = '#0f0';
        ctx.textAlign = 'center';
        ctx.fillText(this.collapsed ? "[+]" : "[-]", btnX + 10, y + 14);

        if (this.collapsed) {
            ctx.restore();
            return;
        }

        // 2. Messages Area
        const msgAreaTop = y + 20; // Below header
        const inputHeight = 30;
        const msgAreaHeight = boxH - 20 - inputHeight;
        const msgAreaBottom = y + boxH - inputHeight;

        ctx.beginPath();
        ctx.rect(x, msgAreaTop, boxW, msgAreaHeight);
        ctx.clip();

        ctx.font = "20px 'VT323', monospace";
        ctx.textAlign = 'left'; // Reset alignment for text

        // Render Messages Bottom-Up
        // Apply Scroll Offset
        let cursorY = msgAreaBottom - 10 + this.scrollOffset;
        const lineHeight = 20;
        const maxTextWidth = boxW - 20;

        let totalHeight = 0;

        // Draw Loop
        // We need to iterate ALL messages to calculate total height for scroll clamping,
        // but we only DRAW visible ones. To be efficient, we can do one pass backwards.

        // Actually, for accurate scroll clamping, we need to know the Total Height of ALL messages.
        // We can do this by wrapping text for all messages every frame (expensive?)
        // OR we can just clamp loosely / calculate only when adding messages.
        // Let's do a simplified approach: Render what we can, and if we run out of messages before hitting top + maxScroll logic.

        // BETTER: Iterate ALL messages backwards. 
        // Track 'virtualY'. If virtualY is within view, draw.
        // Calculate minVirtualY (top most line relative to un-scrolled bottom).

        // Let's stick to the current cursorY logic but track how high we go.

        for (let i = this.messages.length - 1; i >= 0; i--) {
            const msg = this.messages[i];

            // Calc lines
            const fullText = `[${msg.timestamp}] [${msg.author}]: ${msg.text}`;
            // Optimization: if we are WAY off screen, maybe don't measureText? 
            // Wrapper is needed to know height. 
            // 100 messages is fast enough to just wrap.
            const lines = this.wrapText(ctx, fullText, maxTextWidth);

            totalHeight += lines.length * lineHeight;

            // Draw if visible
            // The bottom of this message block is at cursorY.
            // The top is at cursorY - (lines.length * lineHeight).
            // Visible Range: [msgAreaTop, msgAreaBottom]

            // Checking visibility
            const msgBottom = cursorY;
            const msgTop = cursorY - (lines.length * lineHeight);

            if (msgBottom > msgAreaTop && msgTop < msgAreaBottom) {
                // Color by author
                let color = '#ccc';
                if (msg.author === 'Admin_Alex') color = '#55ff55';
                if (msg.author === 'SYSTEM') color = '#ffff55';
                if (msg.author === 'UNKNOWN' || msg.author === '???') color = '#ff3333';
                if (msg.author === 'YOU') color = '#00ffff';

                ctx.fillStyle = color;

                let lineCursor = cursorY;
                for (let j = lines.length - 1; j >= 0; j--) {
                    // One last check for specific line visibility to avoid drawing text outside clip (opt)
                    if (lineCursor > msgAreaTop && lineCursor - lineHeight < msgAreaBottom) {
                        ctx.fillText(lines[j], x + 10, lineCursor);
                    }
                    lineCursor -= lineHeight;
                }
            }

            cursorY -= lines.length * lineHeight;
        }

        // Update Max Scroll
        // contentHeight = totalHeight
        // viewHeight = msgAreaHeight
        // maxScroll = Math.max(0, contentHeight - viewHeight)
        // Wait, cursorY logic started at bottom.
        // If contentHeight > viewHeight, we can scroll up.
        this.maxScroll = Math.max(0, totalHeight - msgAreaHeight + 20); // +20 buffer

        ctx.restore(); // Restore clip

        // 3. Input Line
        const inputY = y + boxH - 10;
        ctx.fillStyle = '#0f0';
        ctx.font = "20px 'VT323', monospace";
        ctx.textAlign = 'left';

        const cursor = (Math.floor(this.cursorBlink * 2) % 2 === 0 && this.isFocused) ? "_" : "";

        let displayInput = `> ${this.inputBuffer}${cursor}`;
        if (ctx.measureText(displayInput).width > boxW - 20) {
            displayInput = "> ..." + this.inputBuffer.slice(-40) + cursor;
        }

        ctx.fillText(displayInput, x + 10, inputY);

        if (!this.isFocused) {
            ctx.fillStyle = '#666';
            ctx.font = "14px 'Courier New', monospace";
            ctx.fillText("(Click to type)", x + boxW - 120, inputY);
        }
    }

    checkClick(mx, my, h) {
        if (this.isMouseOver(mx, my, h)) {
            // Check Button Click
            const boxH = this.collapsed ? 20 : 260; // Needs to match draw
            const boxW = 580;
            const x = 10;
            const y = h - boxH - 10;
            const btnX = x + boxW - 20;

            // Simple hitbox for button (Top right corner of header)
            if (mx >= btnX && mx <= x + boxW && my >= y && my <= y + 20) {
                this.collapsed = !this.collapsed;
                this.game.events.emit('play_sound', 'click');
                return 'toggle';
            }

            if (!this.collapsed) {
                this.isFocused = true;
            }
            return 'consumed';
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

        // Easter eggs / Cheats
        if (command === '/dev_me_money') {
            this.game.state.score += 1000000;
            this.addMessage('SYSTEM', 'Dev cheat activated.');
            return;
        }

        switch (command) {
            case '/help':
                this.addMessage('SYSTEM', 'Available commands:');
                this.addMessage('SYSTEM', '/help - Show this list');
                this.addMessage('SYSTEM', '/snake - Launch SNAKE.EXE');
                if (this.game.state.endingSeen) {
                    this.addMessage('SYSTEM', '/reset - Reboot system');
                }
                this.addMessage('SYSTEM', '/clear - Clear console');
                this.addMessage('SYSTEM', '/verify <code_id> - Bypass captcha manually');
                break;
            case '/snake':
                this.addMessage('SYSTEM', 'Launching SNAKE.EXE...');
                this.game.uiManager.windowManager.add(new MinigameWindow(this.game.w, this.game.h, new SnakeGame(this.game)));
                this.game.events.emit('play_sound', 'click');
                break;
            case '/reset':
                if (this.game.state.endingSeen) {
                    this.addMessage('SYSTEM', 'INITIATING SYSTEM REBOOT...');
                    setTimeout(() => {
                        this.game.triggerCrash(); // Or soft reset
                    }, 1000);
                } else {
                    this.addMessage('SYSTEM', `Unknown command: ${command}`);
                }
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

            case '/0xdead':
                this.addMessage('SYSTEM', '...');
                this.game.events.emit('play_sound', 'i_am_alive');
                break;

            default:
                this.addMessage('SYSTEM', `Unknown command: ${command}`);
                break;
        }
    }
}
