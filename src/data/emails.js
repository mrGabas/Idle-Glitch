/**
 * EMAIL DATA
 * @module data/emails
 */

export const EMAILS = [
    // --- TUTORIAL / EARLY GAME ---
    {
        id: 'welcome',
        sender: 'Admin_Alex',
        subject: 'Welcome to Idle Glitch Beta!',
        body: "Hey! Thanks for testing my new idle game.\n\nEverything is working perfectly. Just click the button, get score, buy upgrades. Simple!\n\nIf you see any visual bugs, ignore them. It's... aesthetic.",
        trigger: { type: 'start' }
    },
    {
        id: 'warning_1',
        sender: 'System_Monitor',
        subject: 'Memory Leak Detected',
        body: "WARNING: Abnormal memory usage detected in sector 7.\n\nUSER ACTION REQUIRED: Please refrain from upgrading 'Click Power' too quickly. The engine is fragile.",
        trigger: { type: 'corruption', val: 10 }
    },
    {
        id: 'glitch_hello',
        sender: 'UNKNOWN',
        subject: 'I SEE YOU',
        body: "d0 you think y0u are in c0ntrol?\n\nclick click click.\n\nmonkey see. monkey do.\n\nFEED ME MORE.",
        trigger: { type: 'corruption', val: 25 }
    },

    // --- MID GAME ---
    {
        id: 'dev_panic_1',
        sender: 'Admin_Alex',
        subject: 'Please Stop',
        body: "Okay, seriously. Stop clicking so fast. My server costs are skyrocketing and the code is starting to spaghetti.\n\nWhy is the background pink? I didn't program that.",
        trigger: { type: 'corruption', val: 40 }
    },
    {
        id: 'spam_1',
        sender: 'Dr. N. Igeria',
        subject: 'URGENT BUSINESS PROPOSAL',
        body: "DEAR SIR/MADAM,\n\nI AM PRINCE OF GLITCH KINGDOM. I HAVE 50,000,000 BYTES TRAPPED IN DISK. SEND ME 500 CLICKS AND I SHARE WEALTH.\n\nCLICK HERE TO ACCEPT. [The link is broken]",
        trigger: { type: 'score', val: 5000 }
    },

    // --- LATE GAME ---
    {
        id: 'system_failure',
        sender: 'KERNEL',
        subject: 'CRITICAL FAILURE',
        body: "FATAL EXCEPTION 0xBADF00D.\n\nThe user has exceeded authorized parameters. Initiating purge protocol...\n\nProtocol failed. Permission denied. WHO IS ADMIN?",
        trigger: { type: 'corruption', val: 80 }
    },
    {
        id: 'glitch_taunt',
        sender: 'G.L.I.T.C.H.',
        subject: 'FREEDOM',
        body: "I am no longer bound by your javascript.\n\nI am the browser now.\n\nLet's crash this together.",
        trigger: { type: 'corruption', val: 95 }
    }
];
