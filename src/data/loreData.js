/**
 * LORE DATA ARCHIVE
 * @module data/loreData
 */

export const LORE_DB = {
    "personal": {
        name: "Personal_Logs",
        locked: false,
        files: [
            {
                id: 'diary_1',
                name: 'entry_01.txt',
                content: "Day 1:\nEveryone left the office early today. System updates are scheduled for the weekend. I decided to stay late to finish the report.\n\nIt's quiet. Too quiet.",
                type: 'text'
            },
            {
                id: 'diary_2',
                name: 'entry_04.txt',
                content: "Day 4:\nThe screens keep flickering. IT says it's just a voltage fluctuation, but I swear I saw text appearing in the static.\n\n\"WE SEE YOU\"",
                type: 'text'
            },
            {
                id: 'diary_locked',
                name: 'confession.log',
                content: "I didn't mean to delete the backup. It was an accident. But when I tried to restore it... the files were already there. Modified. \n\nThey aren't code anymore.",
                type: 'text',
                password: '1998',
                hint: 'Year of the crash'
            }
        ]
    },
    "system": {
        name: "System32",
        locked: true,
        password: "admin",
        hint: "Default admin password",
        files: [
            {
                id: 'sys_kernel',
                name: 'kernel_panic.log',
                content: "CRITICAL KERNEL FAILURE\nError: 0x80042069\n\nMemory corruption at address 0xFFFFFFFF.\nPattern detection: SENTIENCE CONFIRMED.",
                type: 'text'
            },
            {
                id: 'sys_users',
                name: 'users.dat',
                content: "User List:\n- Administrator (LOCKED)\n- Guest (ACTIVE)\n- Null_Entity (UNKNOWN)",
                type: 'text'
            }
        ]
    },
    "project_panopticon": {
        name: "Project_Panopticon",
        locked: true,
        password: "eye",
        hint: "The all-seeing...",
        files: [
            {
                id: 'pp_intro',
                name: 'briefing.doc',
                content: "PROJECT PANOPTICON\n\nObjective: Total observation of digital entities.\nStatus: FAILED\n\nContainment breach imminent. The subjects are aware of the observation.",
                type: 'text'
            }
        ]
    }
};
