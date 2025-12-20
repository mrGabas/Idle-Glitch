/**
 * INTERACTIVE ITEMS
 * @module entities/items
 */
import { UTILS } from '../core/config.js';

export class LoreFile {
    constructor(game, x, y, id, data) {
        this.game = game;
        this.w = 50;
        this.h = 60;

        // Position validation
        this.x = x;
        this.y = y;
        if (this.x === undefined || this.y === undefined) {
            // Spawn randomly for now if not provided
            let safe = false;
            while (!safe) {
                this.x = UTILS.rand(50, game.w - 100);
                this.y = UTILS.rand(50, game.h - 100);
                const cx = game.w / 2;
                const cy = game.h / 2;
                if (Math.hypot(this.x - cx, this.y - cy) > 300) safe = true;
            }
        }

        this.id = id;

        if (data) {
            this.label = data.name;
            this.content = data.content;
            this.password = data.password || null;
        } else {
            // Fallback: Pick a random uncollected one via System?
            // Ideally GlitchSystem passes the ID.
            this.label = "Corrupted_File";
            this.content = "ERROR: DATA MISSING";
        }

        this.active = true;
        this.life = 45.0; // Exist longer
    }

    update(dt) {
        if (this.active) {
            this.life -= dt;
        }
    }

    draw(ctx) {
        if (!this.active) return;

        ctx.save();
        ctx.translate(this.x, this.y);

        // Icon (Folder)
        ctx.fillStyle = '#ebb434'; // Folder yellow
        ctx.beginPath();
        ctx.moveTo(0, 5);
        ctx.lineTo(20, 5);
        ctx.lineTo(25, 0);
        ctx.lineTo(50, 0);
        ctx.lineTo(50, 40);
        ctx.lineTo(0, 40);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#c59218';
        ctx.stroke();

        // Label
        ctx.fillStyle = '#fff';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.shadowColor = '#000';
        ctx.shadowBlur = 4;
        ctx.fillText(this.label, 25, 55);
        ctx.shadowBlur = 0;

        ctx.restore();
    }

    checkClick(mx, my) {
        if (!this.active) return false;
        if (mx >= this.x && mx <= this.x + 50 && my >= this.y && my <= this.y + 60) {

            // Unlock via Lore System
            if (this.id) {
                this.game.loreSystem.unlockFile(this.id);
            }

            // Open Content -> DISABLED (User Request)
            // this.game.uiManager.openNotepad(this.content, {
            //     password: this.password,
            //     title: this.label
            // });

            this.game.createFloatingText(this.x + 25, this.y, "ARCHIVED", "#ebb434");

            this.active = false; // Disappear after opening
            return true;
        }
        return false;
    }
}

export class ExecutableFile {
    constructor(game, w, h, programName) {
        this.game = game;
        this.w = 50;
        this.h = 60;
        this.programName = programName || "Snake";
        this.label = this.programName + ".exe";

        let safe = false;
        while (!safe) {
            this.x = UTILS.rand(50, w - 100);
            this.y = UTILS.rand(50, h - 100);

            // Safety check for center (gameplay area)
            const cx = w / 2;
            const cy = h / 2;
            if (Math.hypot(this.x - cx, this.y - cy) > 200) safe = true;
        }

        this.active = true;
        this.life = 60.0;
    }

    update(dt) {
        if (this.active) this.life -= dt;
    }

    draw(ctx) {
        if (!this.active) return;
        ctx.save();
        ctx.translate(this.x, this.y);

        // Icon (Exe usually blue/white square or window)
        ctx.fillStyle = '#000080';
        ctx.fillRect(5, 5, 40, 35);
        ctx.fillStyle = '#fff';
        ctx.fillRect(5, 5, 40, 10); // Header
        ctx.fillRect(10, 20, 30, 15); // "Window" inside

        // Label
        ctx.fillStyle = '#fff';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.shadowColor = '#000';
        ctx.shadowBlur = 4;
        ctx.fillText(this.label, 25, 55);
        ctx.shadowBlur = 0;

        ctx.restore();
    }

    checkClick(mx, my) {
        if (!this.active) return false;
        if (mx >= this.x && mx <= this.x + 50 && my >= this.y && my <= this.y + 60) {
            this.active = false;

            // Launch Minigame
            if (this.programName === 'Snake') {
                // Ensure we pass 'game' if SnakeGame needs it, or just new SnakeGame()
                // SnakeGame usually needs game for events/score
                // User requested: uiManager.openMinigame(new SnakeGame(window.game))
                // Since we have this.game, we use that.
                import('../minigames/SnakeGame.js').then(({ SnakeGame }) => {
                    this.game.uiManager.openMinigame(new SnakeGame(this.game));
                });
                this.game.events.emit('play_sound', 'startup');
            }
            return true;
        }
        return false;
    }
}

export class MediaFile extends LoreFile {
    constructor(game, x, y, id, data) {
        super(game, x, y, id, data);
        this.mediaType = data.mediaType || 'audio'; // 'audio' or 'image'
        this.src = data.src;
        this.label = data.name || "Media File";
    }

    draw(ctx) {
        if (!this.active) return;

        ctx.save();
        ctx.translate(this.x, this.y);

        // Icon Config
        let iconChar = '🎵';
        let color = '#34ebde'; // Cyan for media
        if (this.mediaType === 'image') {
            iconChar = '🖼️';
            color = '#ff69b4'; // Pink for images
        }

        // Background
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(40, 0);
        ctx.lineTo(50, 10);
        ctx.lineTo(50, 60);
        ctx.lineTo(0, 60);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.stroke();

        // Fold
        ctx.beginPath();
        ctx.moveTo(40, 0);
        ctx.lineTo(40, 10);
        ctx.lineTo(50, 10);
        ctx.stroke();

        // Icon
        ctx.fillStyle = '#000';
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(iconChar, 25, 30);

        // Label
        ctx.fillStyle = '#fff';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.shadowColor = '#000';
        ctx.shadowBlur = 4;
        ctx.fillText(this.label, 25, 75);
        ctx.shadowBlur = 0;

        ctx.restore();
    }

    checkClick(mx, my) {
        if (!this.active) return false;
        if (mx >= this.x && mx <= this.x + 50 && my >= this.y && my <= this.y + 60) {

            // Unlock immediately
            if (this.id) {
                this.game.loreSystem.unlockFile(this.id);
            }

            // Trigger Media Show -> DISABLED (User Request)
            // this.game.uiManager.showMedia({
            //     mediaType: this.mediaType,
            //     src: this.src,
            //     name: this.label
            // });

            this.game.createFloatingText(this.x + 25, this.y, "ARCHIVED", "#34ebde");

            this.active = false;
            return true;
        }
        return false;
    }
}
