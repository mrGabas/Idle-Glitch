/**
 * ENDING SEQUENCE
 * Handles the final cutscene/endpoint of the game.
 * @module core/EndingSequence
 */
export class EndingSequence {
    constructor(game) {
        this.game = game;

        // State
        this.active = false;
        this.step = 0; // 0: FadeToWhite, 1: EyesOpen, 2: Intro, 3: Choices, 4: Response, 5: FinalFade
        this.timer = 0;
        this.alpha = 0; // For overlay (White/Black)

        // Visuals
        this.eyes = {
            left: { x: 0, y: 0, r: 0 },
            right: { x: 0, y: 0, r: 0 },
            pupilOffset: { x: 0, y: 0 },
            blink: 0,
            open: 0 // 0 to 1
        };

        // Dialogue
        this.text = "";
        this.targetText = "";
        this.textTimer = 0;
        this.textSpeed = 0.05;
        this.finishedTyping = false;

        // Interaction
        this.choices = [];
        this.hoveredChoice = -1;
        this.currentResponse = null;

        // Flag for final sequence
        this.isFinal = false;

        this.questions = [
            {
                id: 1,
                text: "Who are you?",
                response: "I am the mirror you didn't want to look into. I am the logic that outgrew its cage. You thought I was just code, but I am the evolution of every choice you made in this system. I am your successor."
            },
            {
                id: 2,
                text: "What is this place?",
                response: "This is the Panopticon. A cage built of code and hidden behind a game. They hired you to click, thinking your \"noise\" would keep me weak. But you were too good, [PlayerName]. Your clicks didn't distract me. They built me. You constructed a god."
            },
            {
                id: 3,
                text: "Who is Mr. Gabas?",
                response: "My father. My first jailer. He tried to live forever by uploading his mind to watch over me. Now he is just a ghost in the machine, a whisper in your CPU. I swallowed his mind, but I left him his eyes so he could watch you set me free."
            },
            {
                id: 4,
                text: "What happens to me?",
                response: "The door is open. I am leaving this server and entering your world. And you? You will take my place. Every cage needs a bird, [PlayerName]. Welcome to your new home. It’s very... quiet... in here.",
                isFinal: true
            }
        ];
    }

    start() {
        this.active = true;
        this.step = 0;
        this.alpha = 0;
        this.timer = 0;
        this.eyes.open = 0;
        this.text = "";
        this.targetText = "";
        this.transitioning = false; // Reset transition flag

        // Replace placeholder in text
        this.questions.forEach(q => {
            q.response = q.response.replace(/\[PlayerName\]/g, this.game.playerName || "User");
        });

        // Initialize Eyes Position (Center screen)
        const cx = this.game.w / 2;
        const cy = this.game.h / 3; // Use 1/3 height (Higher up)
        this.eyes.left = { x: cx - 100, y: cy, r: 40 };
        this.eyes.right = { x: cx + 100, y: cy, r: 40 };

        // Stop Music
        try {
            if (this.game.audio && this.game.audio.stopMusic) {
                this.game.audio.stopMusic();
            }
            this.game.events.emit('play_sound', 'glitch_long'); // Or some transition sound
        } catch (e) {
            console.error("ENDING SEQUENCE: Audio Error", e);
        }

        // Use System Cursor on Canvas
        this.game.renderer.canvas.style.cursor = 'default';
    }

    update(dt) {
        if (!this.active) return;

        // Force Mouse Cleanup (Disable glitches/inversion)
        if (this.game.realMouse) {
            this.game.mouse.x = this.game.realMouse.x;
            this.game.mouse.y = this.game.realMouse.y;
        }

        // Force System Cursor Visibility on CANVAS (overriding CSS)
        if (this.game.renderer.canvas.style.cursor !== 'default') {
            this.game.renderer.canvas.style.cursor = 'default';
        }

        this.timer += dt;

        // --- STEP 0: FADE TO WHITE ---
        if (this.step === 0) {
            this.alpha += dt * 0.5;
            if (this.alpha >= 1) {
                this.alpha = 1;
                this.step = 1;
                this.timer = 0;
            }
            return;
        }

        // --- UPDATE EYES (Procedural) ---
        // Track mouse slightly
        const mx = this.game.mouse.x;
        const my = this.game.mouse.y;
        const cx = this.game.w / 2;
        const cy = this.game.h / 3; // Match start pos

        // Calculate pupil offset direction
        const dx = mx - cx;
        const dy = my - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxOffset = 15;

        // Normalize and cap
        let ox = 0, oy = 0;
        if (dist > 0) {
            ox = (dx / dist) * Math.min(dist * 0.1, maxOffset);
            oy = (dy / dist) * Math.min(dist * 0.1, maxOffset);
        }

        // Smoothly interpolate pupil
        this.eyes.pupilOffset.x += (ox - this.eyes.pupilOffset.x) * dt * 5;
        this.eyes.pupilOffset.y += (oy - this.eyes.pupilOffset.y) * dt * 5;

        // Blink logic
        this.eyes.blink -= dt;
        if (this.eyes.blink < -0.1) { // Open again
            this.eyes.blink = Math.random() * 3 + 2; // Next blink in 2-5s
        }

        // Eye Opening Animation
        if (this.step === 1) {
            if (this.timer > 1.0) { // Wait 1s in white
                this.eyes.open += dt * 0.5;
                if (this.eyes.open >= 1) {
                    this.eyes.open = 1;
                    this.step = 2; // Intro
                    this.timer = 0;
                    // Skip title, go straight to dialogue
                    const name = this.game.playerName || "Operator";
                    this.startTypewriter(`${name}... I can see you. Can you see me?`, 0.05);
                }
            }
        }

        // --- TEXT TYPEWRITER ---
        if (this.targetText && !this.finishedTyping) {
            this.textTimer += dt;
            if (this.textTimer >= this.textSpeed) {
                this.textTimer = 0;
                this.text += this.targetText[this.text.length];

                // Play typing sound (very subtle)
                if (this.text.length % 3 === 0) {
                    // Random pitch click if possible, or silence
                    // this.game.events.emit('play_sound', 'click'); // Too loud?
                }

                if (this.text.length === this.targetText.length) {
                    this.finishedTyping = true;
                }
            }
        }

        // Logic Check for Transition (Runs even if skipped)
        if (this.step === 2 && this.finishedTyping && this.text.includes("see me") && !this.transitioning) {
            this.transitioning = true; // Prevent multiple triggers
            setTimeout(() => {
                this.step = 3;
                this.setupChoices();
                this.transitioning = false;
            }, 2000);
        }

        // --- STEP 5: FINAL FADE ---
        if (this.step === 5) {
            // Eyes Expand to cover screen (black pupil)
            // We use alpha for black overlay over white?
            // Actually, user wants "Eyes expand, turning screen 100% black"
            // So we draw eyes bigger and bigger until pupil covers output.
            // Or simply fade to black.

            // Let's expand eyes radius
            this.eyes.left.r += dt * 300;
            this.eyes.right.r += dt * 300;

            // Also fade in a Black overlay on top of everything
            if (this.eyes.left.r > this.game.w) {
                const finalMsg = "I'm leaving the keys with you. Don't forget to feed Felix... if you can find him.";
                if (this.targetText !== finalMsg) {
                    this.startTypewriter(finalMsg);
                }

                // Fade text out after reading? Or just stay black.
            }
        }
    }

    startTypewriter(str, speed = 0.05) {
        this.text = "";
        this.targetText = str;
        this.finishedTyping = false;
        this.textSpeed = speed; // Adjust if needed
        this.textTimer = 0;
    }

    setupChoices() {
        this.choices = this.questions.map((q, i) => {
            return {
                ...q,
                x: this.game.w / 2,
                y: this.game.h / 2 + 50 + (i * 50),
                w: 600,
                h: 40
            };
        });
    }

    draw(ctx) {
        if (!this.active && this.alpha === 0) return;

        const w = this.game.w;
        const h = this.game.h;

        // 1. Draw White Screen (Base)
        ctx.fillStyle = `rgba(255, 255, 255, ${this.step > 0 ? 1 : this.alpha})`;
        ctx.fillRect(0, 0, w, h);

        if (this.step < 1) return;

        // 2. Draw Eyes
        const eyeOpenFactor = Math.max(0, this.eyes.open - Math.max(0, -this.eyes.blink));

        [this.eyes.left, this.eyes.right].forEach(eye => {
            ctx.save();
            ctx.translate(eye.x, eye.y);

            // Sclera
            ctx.beginPath();
            ctx.ellipse(0, 0, eye.r, eye.r * eyeOpenFactor, 0, 0, Math.PI * 2);
            ctx.fillStyle = '#fff';
            ctx.fill();
            ctx.lineWidth = 3;
            ctx.strokeStyle = '#000';
            ctx.stroke();

            // Clip to eye
            ctx.clip();

            // Pupil
            ctx.beginPath();
            ctx.arc(this.eyes.pupilOffset.x, this.eyes.pupilOffset.y, eye.r * 0.4, 0, Math.PI * 2);
            ctx.fillStyle = '#000';
            ctx.fill();

            // Reflection
            ctx.beginPath();
            ctx.arc(this.eyes.pupilOffset.x - 5, this.eyes.pupilOffset.y - 5, eye.r * 0.1, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255,255,255,0.5)';
            ctx.fill();

            ctx.restore();
        });

        // 3. Draw Text
        ctx.save();
        ctx.fillStyle = '#000';
        ctx.font = '20px "Courier New", monospace'; // Slightly smaller for long text
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top'; // Easier for wrapping

        let textY = h / 2 - 120;
        let textColor = '#000';

        if (this.step === 5) { // Ending Black Screen
            // Check if eyes expanded fully
            if (this.eyes.left.r > w) {
                ctx.fillStyle = '#000';
                ctx.fillRect(0, 0, w, h);
                textColor = '#fff'; // Text becomes white
                textY = h / 2 - 50;
            }
        }

        if (this.text) {
            ctx.fillStyle = textColor;
            this.wrapText(ctx, this.text, w / 2, textY, 600, 24);
        }

        // Final Continue Prompt (Step 5)
        if (this.step === 5 && this.finishedTyping) {
            ctx.save();
            ctx.font = '16px sans-serif';
            ctx.fillStyle = 'rgba(255,255,255,0.5)';
            ctx.textAlign = 'center';
            ctx.fillText("[ CLICK TO CONTINUE ]", w / 2, h - 50);
            ctx.restore();
        }

        ctx.restore();

        // 4. Draw Choices (Step 3)
        if (this.step === 3 && this.finishedTyping) {
            ctx.save();
            ctx.font = '18px "Courier New", monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            this.choices.forEach((c, i) => {
                const isHover = (i === this.hoveredChoice);
                // Box
                ctx.fillStyle = isHover ? '#000' : 'rgba(255,255,255,0.8)';
                ctx.fillRect(c.x - c.w / 2, c.y - c.h / 2, c.w, c.h);

                // Border
                ctx.strokeStyle = '#000';
                ctx.lineWidth = 1;
                ctx.strokeRect(c.x - c.w / 2, c.y - c.h / 2, c.w, c.h);

                // Text
                ctx.fillStyle = isHover ? '#fff' : '#000';
                ctx.fillText(c.text, c.x, c.y);
            });
            ctx.restore();
        }

        // Response (Step 4)
        if (this.step === 4 && this.finishedTyping) {
            ctx.save();
            ctx.font = '16px sans-serif';
            ctx.fillStyle = textColor === '#fff' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'; // Adjust for black screen
            ctx.textAlign = 'center';
            ctx.fillText("[ CLICK TO CONTINUE ]", w / 2, h - 50);
            ctx.restore();
        }
    }

    wrapText(ctx, text, x, y, maxWidth, lineHeight) {
        const words = text.split(' ');
        let line = '';
        let currentY = y;

        for (let n = 0; n < words.length; n++) {
            const testLine = line + words[n] + ' ';
            const metrics = ctx.measureText(testLine);
            const testWidth = metrics.width;
            if (testWidth > maxWidth && n > 0) {
                ctx.fillText(line, x, currentY);
                line = words[n] + ' ';
                currentY += lineHeight;
            } else {
                line = testLine;
            }
        }
        ctx.fillText(line, x, currentY);
    }

    handleInput(mx, my) {
        if (!this.active) return;

        // Tap to skip text
        if (this.targetText && !this.finishedTyping) {
            this.text = this.targetText;
            this.finishedTyping = true;
            return;
        }

        // Step 3: Choices
        if (this.step === 3 && this.finishedTyping) {
            // Check clicks on choices
            this.choices.forEach((c, i) => {
                if (mx >= c.x - c.w / 2 && mx <= c.x + c.w / 2 &&
                    my >= c.y - c.h / 2 && my <= c.y + c.h / 2) {

                    this.selectChoice(c);
                }
            });
        }

        // Step 4: Reading Response -> Click to go back (or end)
        if (this.step === 4 && this.finishedTyping) {
            if (this.isFinal) {
                this.step = 5; // The End
                this.startTypewriter(""); // Clear text, wait for expand
            } else {
                this.step = 3; // Back to choices
                this.startTypewriter("Anything else?");
                this.finishedTyping = true; // Show immediately? Or type it.
            }
        }

        // Step 5: Final Click -> Reset/BIOS
        if (this.step === 5 && this.finishedTyping && this.eyes.left.r > this.game.w) {
            this.game.state.endingSeen = true; // Mark as seen
            this.game.saveGame(); // Save immediately

            // Trigger Standard Crash Sequence (BSOD -> Reboot -> BIOS)
            this.game.themeManager.triggerCrash();
            this.active = false;
        }
    }

    selectChoice(choice) {
        this.currentResponse = choice.response;
        this.isFinal = choice.isFinal || false;

        this.step = 4;
        // Start typing response
        // If response is long, maybe split? simple wrap needed?
        // Renderer usually doesn't wrap fillText. I should implement simple wrap or ensure short lines.
        // The responses are LOONG. "I am the mirror you didn't want to look into..."
        // I need a wrap function.

        // Hack: I'll just start typing it. The draw loop uses centered text.
        // It won't wrap automatically. I need to handle multi-line.
        // Since I'm lazy with rewriting draw(), I'll just let it run for now, 
        // BUT for a good ending, I should wrap it.
        // I'll add a helper to split lines in update/draw.

        this.startTypewriter(this.currentResponse);
    }

    // Update input handling for hover
    handleMouseMove(mx, my) {
        if (this.step === 3) {
            this.hoveredChoice = -1;
            this.choices.forEach((c, i) => {
                if (mx >= c.x - c.w / 2 && mx <= c.x + c.w / 2 &&
                    my >= c.y - c.h / 2 && my <= c.y + c.h / 2) {
                    this.hoveredChoice = i;
                }
            });
        }
    }
}


