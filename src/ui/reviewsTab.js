/**
 * REVIEWS TAB UI
 * Mimics a comment section
 * @module ui/reviewsTab
 */

import { REVIEWS } from '../data/reviews.js';
import { UTILS } from '../core/config.js';
import { assetLoader } from '../core/AssetLoader.js';

export class ReviewsTab {
    constructor(game) {
        this.game = game;
        this.visible = false;

        // Dimensions
        this.w = 500;
        this.h = 600;
        this.x = (game.w - this.w) / 2;
        this.y = (game.h - this.h) / 2;

        this.activeReviews = [];
        this.nextReviewIndex = 0;

        // Scroll state
        this.scrollTop = 0;
        this.maxScroll = 0;
        this.contentHeight = 0;

        // Add initial batch
        this.addReview();
        this.addReview();
        this.addReview();
    }

    toggle() {
        this.visible = !this.visible;
        this.game.events.emit('play_sound', 'click');
        this.resize(); // Re-center
        this.scrollTop = 0; // Reset scroll
    }

    resize() {
        this.x = (this.game.w - this.w) / 2;
        this.y = (this.game.h - this.h) / 2;
    }

    addReview() {
        if (this.nextReviewIndex < REVIEWS.length) {
            const r = REVIEWS[this.nextReviewIndex];
            // Store stable avatar color
            r.avatarColor = r.type === 'creepy' ? '#000' : UTILS.randArr(['#f0f', '#0ff', '#ff0', '#f00', '#0f0']);
            this.activeReviews.unshift(r);
            this.nextReviewIndex++;
            this.updateScrollBounds();
        }
    }

    updateScrollBounds() {
        const ctx = this.game.renderer.ctx;
        const padding = 15;
        const textX = 100;
        const maxWidth = this.w - textX - padding; // Width available for text

        this.contentHeight = 0;

        this.activeReviews.forEach(r => {
            // Determine Font (Must match draw)
            if (r.type === 'creepy') {
                ctx.font = "bold 14px Courier New";
            } else {
                ctx.font = "italic 14px Arial";
            }

            // Wrap Text
            // We use the original text for wrapping. Glitching happens at render time.
            r._lines = this.getLines(ctx, r.text, maxWidth);

            // Calculate Card Height
            // Text starts at y + 75
            // Line height approx 18px
            const textHeight = r._lines.length * 18;
            const minHeight = 90; // Min height to cover avatar (60px + padding)
            r._height = Math.max(minHeight, 75 + textHeight + 15);

            this.contentHeight += r._height + 15; // +15 gap
        });

        // Visible area is Window Height - Header (60px) - Padding (20px)
        const visibleH = this.h - 80;
        this.maxScroll = Math.max(0, this.contentHeight - visibleH);
    }

    getLines(ctx, text, maxWidth) {
        const words = text.split(" ");
        const lines = [];
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

    handleScroll(delta) {
        if (!this.visible) return;
        this.scrollTop += delta;

        // Clamp
        if (this.scrollTop < 0) this.scrollTop = 0;
        if (this.scrollTop > this.maxScroll) this.scrollTop = this.maxScroll;
    }

    update(dt) {
        if (!this.visible) return;

        const corruption = this.game.state.corruption;

        // Check if we can unlock a creepy review
        const nextReview = REVIEWS[this.nextReviewIndex];
        if (nextReview) {
            let canAdd = false;

            if (nextReview.type === 'normal') {
                if (Math.random() < 0.01) canAdd = true; // Slowly trickle
            } else if (nextReview.type === 'creepy') {
                if (corruption >= nextReview.triggerCorruption) {
                    canAdd = true;
                }
            }

            if (canAdd) {
                this.addReview();
            }
        }
    }

    checkClick(mx, my) {
        if (!this.visible) return false;

        // Close button (top right)
        if (mx > this.x + this.w - 40 && mx < this.x + this.w &&
            my > this.y && my < this.y + 40) {
            this.toggle();
            return true;
        }

        // Click outside?
        if (mx < this.x || mx > this.x + this.w || my < this.y || my > this.y + this.h) {
            this.toggle();
            return true;
        }

        return true; // Consume click inside
    }

    glitchText(text, intensity) {
        if (Math.random() > intensity) return text;

        const chars = text.split('');
        const glitchChars = '!@#$%^&*()_+-=[]{}|;:,.<>?/~`';

        for (let i = 0; i < chars.length; i++) {
            if (Math.random() < intensity * 0.3) {
                chars[i] = glitchChars.charAt(Math.floor(Math.random() * glitchChars.length));
            }
        }
        return chars.join('');
    }

    draw(ctx) {
        if (!this.visible) return;

        // Darker Overlay
        ctx.fillStyle = 'rgba(0,0,0,0.85)';
        ctx.fillRect(0, 0, this.game.w, this.game.h);

        // Window style - Glassmorphism
        ctx.save();

        // Shadow/Glow
        ctx.shadowColor = '#6d2af7';
        ctx.shadowBlur = 20;

        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(this.x, this.y, this.w, this.h);

        // Border
        ctx.strokeStyle = '#6d2af7';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.w, this.h);

        ctx.shadowBlur = 0; // Reset

        // Header
        ctx.fillStyle = '#6d2af7';
        ctx.fillRect(this.x, this.y, this.w, 60);

        ctx.fillStyle = '#fff';
        ctx.font = "bold 28px Arial";
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText("USER REVIEWS", this.x + this.w / 2, this.y + 30);

        // Close Button
        ctx.fillStyle = '#ff4444';
        ctx.fillRect(this.x + this.w - 40, this.y + 10, 30, 40);
        ctx.fillStyle = '#fff';
        ctx.font = "bold 20px Arial";
        ctx.fillText("X", this.x + this.w - 25, this.y + 30);

        // Content Area Clipping
        ctx.beginPath();
        ctx.rect(this.x, this.y + 60, this.w, this.h - 60);
        ctx.clip(); // Restrict drawing to content area

        // Start from top minus scroll
        let ry = this.y + 80 - this.scrollTop;

        this.activeReviews.forEach((r, i) => {
            const h = r._height || 90;

            // Optimization: Don't draw if out of view
            if (ry > this.y + this.h || ry + h < this.y + 60) {
                ry += h + 15;
                return;
            }

            // Card BG
            ctx.fillStyle = '#2a2a2a';
            if (r.type === 'creepy') ctx.fillStyle = '#220000'; // Slight red tint for horror
            ctx.fillRect(this.x + 15, ry, this.w - 30, h);

            // Avatar
            let drawnAvatar = false;
            if (r.avatar) {
                const img = assetLoader.getImage(r.avatar);
                if (img && img.complete && img.naturalWidth > 0) {
                    ctx.drawImage(img, this.x + 25, ry + 15, 60, 60);

                    // Simple border for image
                    ctx.strokeStyle = '#6d2af7';
                    ctx.lineWidth = 1;
                    ctx.strokeRect(this.x + 25, ry + 15, 60, 60);

                    drawnAvatar = true;
                }
            }

            if (!drawnAvatar) {
                // Fallback: Colored Box
                ctx.fillStyle = r.avatarColor || '#ddd';
                ctx.fillRect(this.x + 25, ry + 15, 60, 60);
                ctx.fillStyle = '#fff';
                ctx.font = "30px Arial";
                ctx.textAlign = 'center'; // Ensure text align is center for initial
                ctx.fillText(r.user.charAt(0), this.x + 55, ry + 45); // Initial
            }

            // Name
            ctx.textAlign = 'left';
            ctx.fillStyle = '#fff';
            ctx.font = "bold 16px Arial";
            ctx.fillText(r.user, this.x + 100, ry + 30);

            // Rating
            let stars = "★".repeat(r.rating);
            ctx.fillStyle = '#ffd700';
            ctx.font = "16px Arial";
            ctx.fillText(stars, this.x + 100, ry + 50);

            // Text
            ctx.fillStyle = '#ccc';
            ctx.font = "italic 14px Arial";
            if (r.type === 'creepy') {
                ctx.fillStyle = '#f00';
                ctx.font = "bold 14px Courier New";
            }

            // Render Wrapped Lines
            let ly = ry + 75;
            const lines = r._lines || [r.text];

            lines.forEach(line => {
                let displayText = line;
                if (r.type === 'creepy' || Math.random() < 0.005) { // Random chance for glitch
                    const intensity = (this.game.state.corruption / 200) + (r.type === 'creepy' ? 0.2 : 0);
                    displayText = this.glitchText(line, intensity);
                }
                ctx.fillText(displayText, this.x + 100, ly);
                ly += 18;
            });

            ry += h + 15;
        });

        // Scrollbar (if needed)
        if (this.maxScroll > 0) {
            const barH = (this.contentHeight > 0) ? ((this.h - 80) / this.contentHeight) * (this.h - 80) : 0;
            const barY = this.y + 60 + (this.scrollTop / this.contentHeight) * (this.h - 80);

            ctx.fillStyle = '#6d2af7';
            ctx.fillRect(this.x + this.w - 10, barY, 5, Math.max(20, barH));
        }

        ctx.restore();
    }
}
