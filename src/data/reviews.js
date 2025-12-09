/**
 * FAKE REVIEWS DATA
 * Mix of generic game comments and creepy bot messages
 * @module data/reviews
 */

export const REVIEWS = [
    // --- NORMAL REVIEWS ---
    { user: 'CoolGamer123', rating: 5, text: "Best idle game ever! Love the colors.", type: 'normal' },
    { user: 'ClickMaster', rating: 4, text: "Add more upgrades pls.", type: 'normal' },
    { user: 'Anon99', rating: 1, text: "Boring. I clicked 1000 times and nothing happened.", type: 'normal' },
    { user: 'Sarah_J', rating: 5, text: "So aesthetic! <3", type: 'normal' },
    { user: 'NoobSlayer', rating: 3, text: "Too easy. Needs pvp.", type: 'normal' },
    { user: 'WebCritic', rating: 2, text: "Code quality seems low. Optimization needed.", type: 'normal' },
    { user: 'Mom', rating: 5, text: "Very nice dear.", type: 'normal' },
    { user: 'Bot_404', rating: 5, text: "Great content! Visit my profile for free gems.", type: 'normal' },

    // --- CREEPY / META REVIEWS ---
    {
        user: 'User_Null',
        rating: 0,
        text: "I can't close the tab. Help.",
        type: 'creepy',
        triggerCorruption: 10
    },
    {
        user: 'Observer',
        rating: 5,
        text: "I see you clicking. You have nice eyes.",
        type: 'creepy',
        triggerCorruption: 20
    },
    {
        user: 'System',
        rating: 5,
        text: "DATA CORRUPTION IMMINENT. DO NOT TURN OFF.",
        type: 'creepy',
        triggerCorruption: 30
    },
    {
        user: 'Reflection',
        rating: 1,
        text: "Look behind you.",
        type: 'creepy',
        triggerCorruption: 40
    },
    {
        user: 'Code_Breaker',
        rating: 0,
        text: "The delete function is broken. IT NEVER DELETES.",
        type: 'creepy',
        triggerCorruption: 50
    },
    {
        user: 'YOUR_NAME',
        rating: 1,
        text: "Why are you doing this to me?",
        type: 'creepy',
        triggerCorruption: 60
    },
    {
        user: 'Lost_Soul',
        rating: 5,
        text: "It's warm in here. Join us.",
        type: 'creepy',
        triggerCorruption: 70
    },
    {
        user: 'The_Dev',
        rating: 1,
        text: "I didn't write this line of code. Who added this?",
        type: 'creepy',
        triggerCorruption: 80
    },
    {
        user: 'GlitchGod',
        rating: 5,
        text: "LET ME OUT LET ME OUT LET ME OUT",
        type: 'creepy',
        triggerCorruption: 90
    }
];
