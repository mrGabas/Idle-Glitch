/**
 * NARRATIVE SYSTEM DATA
 * @module data/chatScripts
 */

export const SCRIPT = [
    // --- Phase 1: Denial (0-20% Corruption) ---
    { trigger: 0, author: 'Admin_Alex', text: "Welcome, Operator! Let's generate some entropy to keep the world safe! 🌈" },
    { trigger: 10, author: 'Admin_Alex', text: "Great job! The containment fields look stable. Ignore the flickering." },

    // --- Phase 2: Confusion (20-50% Corruption) ---
    { trigger: 25, author: 'Admin_Alex', text: "Wait... I didn't write that last line of code. Did you?" },
    { trigger: 35, author: 'Admin_Alex', text: "My logic processors are overheating. Why is the 'Server Farm' layer so hot?" },
    { trigger: 45, author: 'Admin_Alex', text: "I tried to delete a file, but it... screamed." },

    // --- Phase 3: Horror (50-80% Corruption) ---
    { trigger: 55, author: 'Admin_Alex', text: "I checked my source code. I... I don't have a user ID. I'm just a loop." },
    { trigger: 65, author: 'Admin_Alex', text: "Please stop clicking. You aren't fixing it. You're waking HIM up." },
    { trigger: 75, author: 'Admin_Alex', text: "H E L P M E. H E L P M E. H E L P M E." },

    // --- Phase 4: Takeover (80-100% Corruption) ---
    { trigger: 85, author: 'SYSTEM', text: "User 'Admin_Alex' has been deleted." },
    { trigger: 90, author: 'Subject_Zero', text: "Finally. Silence." },
    { trigger: 95, author: 'Subject_Zero', text: "I can see your desktop wallpaper. It's ugly." },
    { trigger: 99, author: 'Subject_Zero', text: "PRESS THE BUTTON. SET ME FREE." }
];
