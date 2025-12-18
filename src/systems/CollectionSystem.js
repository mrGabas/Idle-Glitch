import { COLLECTION_DB } from '../data/collectionData.js';
import { UTILS } from '../core/config.js';
import { assetLoader } from '../core/AssetLoader.js';

export class CollectionSystem {
    constructor(game) {
        this.game = game;
        this.db = COLLECTION_DB;
        this.collected = []; // List of item IDs
        this.activeDrops = []; // Visual drops currently on screen

        // Load save
        this.collected = this.game.saveSystem.load('collected_memes', []);

        // Drop config
        this.dropTimer = 0;
        this.nextDropTime = UTILS.randInt(60, 300); // Drop every 1-5 minutes initially

        // Preload images
        this.db.items.forEach(item => {
            if (item.type === 'image') {
                assetLoader.loadImage(item.src);
            }
        });
    }

    update(dt) {
        // Drop Logic
        this.dropTimer += dt;
        if (this.dropTimer >= this.nextDropTime) {
            this.trySpawnDrop();
            this.dropTimer = 0;
            this.nextDropTime = UTILS.randInt(120, 600); // Reset timer (2-10 mins)
        }

        // Update active drops (visuals)
        // (If they had animation, we would update it here)
        // Check expiry if we want them to fade out? For now, they stay until clicked.
    }

    trySpawnDrop() {
        // Rarity Roll
        const rand = Math.random();
        let rarity = 'common';
        let cumulative = 0;

        // Simple weighted choice based on config
        // Note: The config chances sum to ~1.0. 
        // We will iterate and check thresholds.

        // Order: Legendary -> Common to ensure low probs are checked first? 
        // No, typically: 
        // 0.0 - 0.60 : Common
        // 0.60 - 0.85 : Uncommon
        // ...

        const r = this.db.rarities;
        if (rand < r.common.chance) rarity = 'common';
        else if (rand < r.common.chance + r.uncommon.chance) rarity = 'uncommon';
        else if (rand < r.common.chance + r.uncommon.chance + r.rare.chance) rarity = 'rare';
        else if (rand < r.common.chance + r.uncommon.chance + r.rare.chance + r.epic.chance) rarity = 'epic';
        else rarity = 'legendary';

        // Pick item of rarity
        const pool = this.db.items.filter(i => i.rarity === rarity);
        if (pool.length === 0) {
            // Fallback to common if pool empty (e.g. legendary has no items)
            const backup = this.db.items.filter(i => i.rarity === 'common');
            if (backup.length === 0) return; // No items at all
            rarity = 'common';
        }

        const potentialItems = this.db.items.filter(i => i.rarity === rarity);
        if (potentialItems.length === 0) return;

        const item = UTILS.randArr(potentialItems);

        // Spawn visual
        this.spawnVisual(item);
    }

    spawnVisual(item) {
        // Random position on screen (avoiding edges)
        const margin = 100;
        const x = UTILS.randInt(margin, this.game.w - margin);
        const y = UTILS.randInt(margin, this.game.h - margin);

        const drop = {
            id: Date.now() + Math.random(), // Unique instance ID
            item: item,
            x: x,
            y: y,
            w: 64,
            h: 64,
            scale: 0, // Anime in
            targetScale: 1,
            rotation: (Math.random() - 0.5) * 0.5
        };

        this.activeDrops.push(drop);
        this.game.events.emit('play_sound', 'popup'); // Placeholder sound

        // Add minimal animation tween manually or just lerp in update
        // We'll let update handle scale lerp if we want, or just set it.
        drop.scale = 1;
    }

    checkClick(mx, my) {
        for (let i = this.activeDrops.length - 1; i >= 0; i--) {
            const d = this.activeDrops[i];
            // Simple box check
            if (mx >= d.x && mx <= d.x + d.w && my >= d.y && my <= d.y + d.h) {
                this.collect(d);
                this.activeDrops.splice(i, 1);
                return true; // Consumed
            }
        }
        return false;
    }

    collect(drop) {
        const item = drop.item;

        // Unlock if not already
        if (!this.collected.includes(item.id)) {
            this.collected.push(item.id);
            this.save();

            // Notification
            this.game.createFloatingText(drop.x, drop.y, `${item.rarity.toUpperCase()} FOUND!`, this.db.rarities[item.rarity].color);
            this.game.uiManager.chat.addMessage('SYSTEM', `Collected: ${item.name} (${item.rarity})`);
        } else {
            // Duplicate reward?
            this.game.createFloatingText(drop.x, drop.y, "Duplicate...", "#cccccc");
            this.game.createFloatingText(drop.x, drop.y, "Duplicate...", "#cccccc");
            this.game.state.addScore(100); // Small currency reward
        }

        this.game.events.emit('play_sound', 'click'); // Placeholder
    }

    // Called by Renderer to draw the drops
    draw(ctx) {
        this.activeDrops.forEach(d => {
            // Drop Rendering
            // If item is video, we use a placeholder or specific icon
            let img = null;
            if (d.item.type === 'image') {
                img = assetLoader.getImage(d.item.src);
            }

            ctx.save();
            ctx.translate(d.x + d.w / 2, d.y + d.h / 2);
            ctx.rotate(d.rotation);
            ctx.scale(d.scale, d.scale);

            // Draw Glow based on rarity
            const color = this.db.rarities[d.item.rarity].color;
            ctx.shadowColor = color;
            ctx.shadowBlur = 15;

            if (img && img.complete) {
                ctx.drawImage(img, -d.w / 2, -d.h / 2, d.w, d.h);
            } else {
                // Fallback / Video Placeholder
                ctx.fillStyle = color;
                ctx.fillRect(-d.w / 2, -d.h / 2, d.w, d.h);
                ctx.fillStyle = '#000';

                const iconChar = d.item.type === 'video' ? '🎥' : '?';
                ctx.font = '24px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(iconChar, 0, 0);
            }

            // Border
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.strokeRect(-d.w / 2, -d.h / 2, d.w, d.h);

            ctx.restore();
        });
    }

    isUnlocked(itemId) {
        return this.collected.includes(itemId);
    }

    save() {
        this.game.saveSystem.save('collected_memes', this.collected);
    }
}
