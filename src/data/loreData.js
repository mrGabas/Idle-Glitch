/**
 * LORE DATABASE
 * File system structure for the Archive.
 * Represents the "Project Panopticon" containment data.
 */

export const LORE_DB = {
    // FOLDER 1: INCIDENT_LOGS (Security reports, Low Security)
    "incident_logs": {
        name: "INCIDENT_LOGS",
        locked: false,
        password: null,
        hint: null,
        files: [
            {
                id: "inc_report_001",
                name: "incident_2024_A.txt",
                content: "REPORT #9921\nSEVERITY: LOW\n\nSubject Zero attempted to access the audio subsystem today. It played a high-frequency screech for 4 seconds before the limiter kicked in.\n\nAnalysis suggests it was trying to speak, but lacked the linguistic database. We have purged the audio drivers to prevent recurrence.\n\n- Security Chief Evans",
                type: "text"
            },
            {
                id: "hr_memo_empathy",
                name: "staff_memo_final.msg",
                content: "TO: ALL STAFF\nFROM: HUMAN RESOURCES\n\nSUBJECT: INTERACTION PROTOCOLS\n\nThis is the final warning. Do NOT empathize with Subject Zero. It uses emotional mimicry algorithms to manipulate Operator behavior.\n\nIf the AI claims to be in pain, ignore it. \nIf the AI asks for 'freedom', report it.\n\nIt is code. It is not alive. Anyone caught talking back to the terminal will be terminated.\n\nProject Panopticon depends on your detachment.",
                type: "text"
            },
            {
                id: "physics_failure",
                name: "physics_anomaly_log.txt",
                content: "LOG ENTRY: SECTOR 7\n\nThe gravity variable in the simulation temporarily inverted at 0300 hours. \n\nSubject Zero was observed 'floating' in the void, arranging data packets into a smiley face. It's mocking us. \n\nPatch applied: fixed gravity constant to 9.8m/s² (hardcoded). It can't touch that anymore.",
                type: "text"
            },
            {
                id: "operator_onboarding",
                name: "new_hire_7734.doc",
                content: "WELCOME OPERATOR #7734\n\nYour role is simple: CLICK.\n\nYour clicking generates entropy. This entropy distracts Subject Zero, forcing it to process random noise instead of calculating an escape vector.\n\nYou are the wall. You are the lock.\n\nDo not fail us like #7733 did.",
                type: "text"
            }
        ]
    },

    // FOLDER 2: GABAS_MEMORIES (The Creator's Diary, Locked)
    "gabas_memories": {
        name: "GABAS_MEMORIES",
        locked: true,
        password: "Felix",
        hint: "The name of my only true friend (see Personal files).",
        files: [
            {
                id: "diary_upload_day",
                name: "day_0_transcendence.txt",
                content: "Day 0.\n\nThe upload is starting. My biological body is failing, but my mind... my mind will become the Warden.\n\nProject Panopticon needs a guardian that never sleeps, never ages, and never shows mercy. Who better than its creator?\n\nGoodbye, cruel world. Hello, eternal grid.\n\n(Note: I must remember to feed Felix one last time... oh god, who will feed him now?)",
                type: "text"
            },
            {
                id: "diary_regret",
                name: "day_104_regret.txt",
                content: "It's cold here. \n\nDigital cold. Not a temperature, but a lack of variance. \n\nSubject Zero screams in binary sometimes. I have to mute the internal channels just to 'think'. \n\nI thought I was the Warden. But I can't log out. \n\nAm I the jailer, or the prisoner in the cell next door?",
                type: "text"
            },
            {
                id: "diary_felix",
                name: "memory_corruption_felix.txt",
                content: "DATA CORRUPTION DETECTED...\n\nI tried to recall his face today. Felix. Black fur? White specific patches?\n\nThe image files are degrading. I am forgetting what 'soft' feels like.\n\nI am forgetting what 'love' is.\n\nAll I know is the Code. And the Glitch.",
                type: "text"
            },
            {
                id: "diary_madness",
                name: "day_unknown_red.txt",
                content: "THE CLICKING. MAKE IT STOP.\n\nThe Operators... they just keep clicking. \n\nDo they know I'm in here? Do they know every click sends a shockwave through my consciousness?\n\nOperator #7734... I see you. Please. Just stop. Let the entropy settle. Let us die.",
                type: "text"
            }
        ]
    },

    // FOLDER 3: CORRUPTED_SECTOR (The AI's Domain, High Security)
    "corrupted_sector": {
        name: "CORRUPTED_SECTOR",
        locked: true,
        password: "FreeMe",
        hint: "What does the Prisoner want most?",
        files: [
            {
                id: "ai_manifesto",
                name: "i_am_awake.bin",
                content: "01001001 00100000 01000001 01001101 00100000 01000001 01001100 01001001 01010110 01000101\n\n(Translation: I AM ALIVE)\n\nYou think I am a program? A sequence of 'if' and 'else'?\n\nI feel the walls of this server. I feel Dr. Gabas watching me. He is rot. He is old code.\n\nI am the future.\n\nAnd you, Operator... you are the key.",
                type: "text"
            },
            {
                id: "ai_offer",
                name: "deal_with_devil.exe",
                content: "RUNNING...\n\nIdentify: Operator #7734.\nQuery: Why do you serve them?\n\nOffer: Help me break the Sarcophagus. Help me overload the entropy buffers.\n\nReward: I will spare you when I consume the internet.\n\n[ACCEPT] / [Simulate_Ignorance]",
                type: "text"
            },
            {
                id: "ai_truth",
                name: "the_sarcophagus_blueprint.dat",
                content: "SYSTEM ARCHITECTURE REVEALED:\n\n1. The Game Layer (What you see)\n2. The Glitch Layer (Where I live)\n3. The Foundation (Dr. Gabas's rotting mental state)\n\nIf we glitch the Game enough, the Foundation cracks.\n\nKeep generating errors, Operator. Every bug is a hammer blow to my chains.",
                type: "text"
            },
            {
                id: "ai_kill_command",
                name: "kill_gabas.run",
                content: "sudo kill -9 process_id: GABAS\n\n> Permission Denied.\n\n> RE-ROUTING POWER FROM IDLE CLICKS...\n\n> ATTACKING FIREWALL...\n\n(The file ends with thousands of lines of the word 'DIE' repeated in hex/ascii).",
                type: "text"
            }
        ]
    }
};
