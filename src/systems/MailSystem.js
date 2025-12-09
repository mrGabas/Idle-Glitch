/**
 * MAIL SYSTEM
 * Handles receiving and reading emails
 * @module systems/MailSystem
 */

import { EMAILS } from '../data/emails.js';

export class MailSystem {
    constructor(game) {
        this.game = game;
        this.inbox = [];
        this.triggeredIds = new Set();
        this.hasUnread = false;

        // Check for start emails
        this.checkTriggers();

        // Check every second
        setInterval(() => this.checkTriggers(), 1000);
    }

    checkTriggers() {
        const state = this.game.state;

        EMAILS.forEach(mail => {
            if (this.triggeredIds.has(mail.id)) return;

            let trigger = false;
            const t = mail.trigger;

            if (t.type === 'auto') {
                trigger = true;
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
