import { Window } from './Window.js';
import { UTILS } from '../core/config.js';

export class OfflineReportWindow extends Window {
    constructor(game, earnings, timeOffline) {
        const w = 400;
        const h = 300;
        const x = (game.w - w) / 2;
        const y = (game.h - h) / 2;
        super(x, y, w, h, "SYSTEM REPORT");

        this.game = game;
        this.earnings = earnings;
        this.timeOffline = timeOffline; // in ms
        this.isClosable = false; // Force usage of Collect button
        this.isDraggable = false; // Modal usually fixed
    }

    draw(ctx) {
        if (!this.active) return;

        // Modal Backdrop
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, this.game.w, this.game.h);

        // Draw standard window frame (super.draw calls drawContent)
        // We manually call super.draw to get the frame, but we need to ensure the backbone is drawn on top of the backdrop.
        // Since we are overriding draw, we can just call super.draw(ctx) here.
        super.draw(ctx);
    }

    drawContent(ctx, x, y, w, h) {
        // Title Area
        ctx.fillStyle = '#000';
        ctx.fillRect(x, y, w, h);

        ctx.fillStyle = '#0f0';
        ctx.font = 'bold 16px Courier New';
        ctx.textAlign = 'center';
        ctx.fillText("SYSTEM REBOOT COMPLETE", x + w / 2, y + 40);

        // Info
        ctx.fillStyle = '#fff';
        ctx.font = '14px Courier New';
        ctx.textAlign = 'center';

        const hours = Math.floor(this.timeOffline / (1000 * 60 * 60));
        const minutes = Math.floor((this.timeOffline % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((this.timeOffline % (1000 * 60)) / 1000);

        const timeStr = `${hours}h ${minutes}m ${seconds}s`;

        ctx.fillText("TIME DILATION: " + timeStr, x + w / 2, y + 80);

        ctx.font = 'bold 24px Courier New';
        ctx.fillStyle = '#ff0';
        ctx.fillText("ENTROPY GENERATED:", x + w / 2, y + 130);

        ctx.font = 'bold 32px Courier New';
        ctx.fillText("+" + UTILS.fmt(this.earnings), x + w / 2, y + 170);

        // Collect Button
        const btnW = 160;
        const btnH = 40;
        const btnX = x + (w - btnW) / 2;
        const btnY = y + h - 60;

        // Button Logic handled in checkClick, just draw here
        // Simple distinct button style
        ctx.fillStyle = '#222';
        ctx.fillRect(btnX, btnY, btnW, btnH);
        ctx.strokeStyle = '#0f0';
        ctx.lineWidth = 2;
        ctx.strokeRect(btnX, btnY, btnW, btnH);

        ctx.fillStyle = '#0f0';
        ctx.font = 'bold 16px Courier New';
        ctx.fillText("COLLECT DATA", btnX + btnW / 2, btnY + 25);
    }

    checkClick(mx, my) {
        // Modal Behavior: Consume ALL clicks
        // Only trigger action if on button

        const contentX = this.x + 4;
        const contentY = this.y + 24;
        const contentW = this.w - 8;
        const contentH = this.h - 28;

        const btnW = 160;
        const btnH = 40;
        const btnX = contentX + (contentW - btnW) / 2;
        const btnY = contentY + contentH - 60;

        if (mx >= btnX && mx <= btnX + btnW && my >= btnY && my <= btnY + btnH) {
            this.collect();
            return 'consumed';
        }

        return 'consumed'; // Block everything else
    }

    collect() {
        this.game.state.addScore(this.earnings);
        this.game.events.emit('play_sound', 'cash'); // Or 'startup' or special sound
        this.close();
    }
}
