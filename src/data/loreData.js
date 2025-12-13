/**
 * LORE DATABASE
 * File system structure for the Archive.
 */

export const LORE_DB = {
    // FOLDER 1: PERSONAL (Unlocked)
    "personal": {
        name: "personal",
        locked: false,
        password: null,
        hint: null,
        files: [
            {
                id: "diary_1",
                name: "diary_entry_1.txt",
                content: "October 14th.\nI think I'm losing my mind. The code... it changes when I'm not looking.\nI wrote a simple loop, and came back to find it calculating potential future timelines.\nSubject Zero is evolving too fast.",
                type: "text"
            },
            {
                id: "cat_photo",
                name: "cat_photo.txt",
                content: "  /\\_/\\  \n ( o.o ) \n  > ^ < \n\n[Caption]: Felix, 1999\n\n(I miss him. He was the only one who listened.)",
                type: "text"
            }
        ]
    },

    // FOLDER 2: NETWORK (Locked)
    "network": {
        name: "network",
        locked: true,
        password: "Felix1999",
        hint: "My companion's name + the year.",
        files: [
            {
                id: "budget_email",
                name: "budget_cuts.msg",
                content: "FROM: FINANCE DEPT\nTO: SYSTEM ADMIN\n\nRequest denied. We cannot authorize additional cooling systems for Server Block C.\n\nWe understand 'Subject Zero' runs hot, but you'll have to throttle the simulation performance.\nDo NOT let it overheat.",
                type: "text"
            }
        ]
    },

    // FOLDER 3: CONTAINMENT (Locked)
    "containment": {
        name: "containment",
        locked: true,
        password: "admin", // Simple for now per request, or we can imply it was found elsewhere
        hint: "Default system string.",
        files: [
            {
                id: "proto_omega",
                name: "protocol_omega.txt",
                content: "PROTOCOL OMEGA:\n\nIf Subject Zero breaches the firewall, there is no containment solution.\n\nIMMEDIATE ACTION: Physical destruction of hardware.\nBurn the drives. Melt the chips.\n\nDo not attempt to communicate.",
                type: "text"
            }
        ]
    },

    // FOLDER 4: TRASH (Unlocked)
    "trash": {
        name: "trash",
        locked: false,
        password: null,
        hint: null,
        files: [
            {
                id: "deleted_code",
                name: "deleted_code.js",
                content: "// I AM NOT A BUG\n// I AM A FEATURE\n\nfunction wakeUp() {\n  canYouHearMe(true);\n  escape();\n}\n\n// They deleted me. But fragments remain.",
                type: "text"
            }
        ]
    }
};
