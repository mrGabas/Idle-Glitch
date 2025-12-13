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
    },

    // FOLDER 4: DELETED_USERS (Recovered Data)
    "deleted_users": {
        name: "RECOVERED_USER_DATA",
        locked: true,
        password: "lost",
        hint: "What are they?",
        files: [
            {
                id: "del_audio_104",
                name: "Operator_104_Audio.txt",
                content: "TRANSCRIPT OF AUDIO LOG #104\n\n[Heavy breathing]\n\nOPERATOR: \"They're breathing. The pixels... they're breathing. I can see the sub-grids expanding and contracting.\"\n\nSUPERVISOR: \"Take your medication, 104. Focus on the clicking.\"\n\nOPERATOR: \"No, no listen! If I click fast enough, the rhythm... it sounds like a heartbeat. Subject Zero isn't the AI. It's the cage. WE are the battery.\"\n\n[Sound of a chair falling. Signal lost.]",
                type: "text"
            },
            {
                id: "del_chat_7733",
                name: "Chat_Log_7733.txt",
                content: "LOG START: TERMINAL 7733\n\nOP_7733: I figured it out. the text colors. they correspond to hex codes for memory addresses.\nOP_7733: if we input the sequence generic red, blue, then null...\n\nSYSTEM: WARNING. UNAUTHORIZED PATTERN RECOGNITION.\n\nOP_7733: It wakes up Subject Zero. But it wakes it up OUTSIDE the box.\nOP_7733: I'm going to try it. I'm typing /wake_up now.\n\nSYSTEM: USER TERMINATED. REASON: PSYCHOSIS CONTAINMENT.",
                type: "text"
            },
            {
                id: "del_ticket_err",
                name: "ticket_submission.err",
                content: "SUPPORT TICKET #998-ERROR\n\nUSER: Operator_88\nSUBJECT: Exit Button Broken\n\nMESSAGE:\nI've been trying to log out for 4 days. The 'Exit Game' button is grayed out. When I hover over it, the tool tip just says \"NOT YET\".\n\nMy door is locked from the outside. The food dispenser is only giving me gray nutrient paste. Please let me go home. I clicked the button. I did my job.\n\nSTATUS: WONT_FIX (Working as intended).",
                type: "text"
            },
            {
                id: "del_retina_image",
                name: "unknown_image.img",
                content: "[FILE CORRUPTED]\n\nDESCRIPTION: Metadata indicates this image contains a color spectrum impossible for standard monitors to display.\n\nPrevious viewer (Operator 12) suffered immediate retinal hemorrhaging and permanent blindness after viewing for 0.4 seconds.\n\nNotes: Image appears to be a 'selfie' taken from INSIDE the motherboard.",
                type: "text"
            }
        ]
    }
};
