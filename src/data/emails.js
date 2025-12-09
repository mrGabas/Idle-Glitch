/**
 * EMAIL DATA
 * @module data/emails
 */

export const EMAILS = [
    // --- EARLY GAME ---
    {
        id: 'welcome',
        sender: 'Admin_Alex',
        subject: 'Welcome to Idle Glitch',
        body: "Hey there! Thanks for testing the beta build. \n\nWe're still smoothing out some edges, so if you see any visual artifacts, just ignore them. The system cleans them up automatically.\n\nEnjoy the clicks!",
        trigger: { type: 'auto', val: 0 }
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
