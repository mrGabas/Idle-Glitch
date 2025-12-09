/**
 * MAIL SYSTEM
 * Manages email triggers, inventory, and read status
 * @module systems/MailSystem
 */

import { EMAILS } from '../data/emails.js';
import { events } from '../core/events.js';

export class MailSystem {
    constructor(game) {
        this.game = game;
        this.inbox = []; // Array of accepted email objects
        this.readIds = new Set(); // Ids of read emails

        // Load save data logic would go here

        // Track triggered IDs to avoid duplicates
        this.triggeredIds = new Set();

        this.hasUnread = false;

        // Initial check
        this.checkTriggers();
    }

    update(dt) {
        // We don't need to check every frame, maybe every second?
        // But for simplicity, we check triggers here or on specific events.
        // Let's do a periodic check or check on stats update.
        // For now, let's just check every 60 frames (approx 1 sec) or handle via method call.
        if (Math.random() < 0.05) { // Occasional check
            this.checkTriggers();
        }
    }

    checkTriggers() {
        const state = this.game.state;

        EMAILS.forEach(mail => {
            if (this.triggeredIds.has(mail.id)) return;

            let trigger = false;
            const t = mail.trigger;

            if (t.type === 'start') {
                trigger = true; // Always trigger at start if not already
            } else if (t.type === 'corruption') {
                if (state.corruption >= t.val) trigger = true;
            } else if (t.type === 'score') {
                if (state.score >= t.val) trigger = true;
            }

            if (trigger) {
                this.receiveMail(mail);
            }
        });
    }

    receiveMail(mail) {
        this.triggeredIds.add(mail.id);
        // Add timestamp
        const mailObj = {
            ...mail,
            receivedAt: Date.now(),
            read: false
        };
        this.inbox.unshift(mailObj); // Newest first
        this.hasUnread = true;
        this.game.events.emit('play_sound', 'buy'); // Notification sound
        this.game.chat.addMessage('SYSTEM', `New Message from ${mail.sender}`);
    }

    markRead(id) {
        const mail = this.inbox.find(m => m.id === id);
        if (mail && !mail.read) {
            mail.read = true;
            this.updateUnreadStatus();
        }
    }

    updateUnreadStatus() {
        this.hasUnread = this.inbox.some(m => !m.read);
    }
}
