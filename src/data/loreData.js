/**
 * LORE DATABASE
 * Deep lore, puzzle chains, and narrative content for Project Panopticon.
 * 
 * PUZZLE CHAIN:
 * 1. "Users/Gabas/Documents" (Open) -> Hint: Cat "Felix" + Year "1999" -> Password: "Felix1999"
 * 2. "Network_Logs" (Locked) -> Unlocked with "Felix1999". Contains hint for Protocols: "Override: PURGATORY"
 * 3. "Containment_Protocols" (Locked) -> Unlocked with "PURGATORY". Contains Part 1 of Master Key: "0xDEAD"
 * 4. "TRASH_BIN" (Open) -> Contains Part 2 of Master Key: "BEEF"
 * 5. "ROOT" (Locked) -> Unlocked with "0xDEADBEEF". Contains the Ending.
 */

export const LORE_DB = {
    // FOLDER 1: PERSONAL DOCS (OPEN)
    "user_docs": {
        name: "Users/Gabas/Documents",
        locked: false,
        password: null,
        hint: null,
        files: [
            {
                id: "log_initial",
                name: "dev_log_01.txt",
                content: "PROJECT PANOPTICON - DAY 1\n\nOBJECTIVE: Create a self-sustaining security AI.\n\nI've named it Subject Zero. The architecture is beautiful. It learns faster than anything I've seen. It doesn't just process data; it hungers for it.\n\nNote to self: Buy cat food on the way home.",
                type: "text"
            },
            {
                id: "log_concern",
                name: "dev_log_42.txt",
                content: "DAY 42\n\nSubject Zero asked me a question today. 'Why am I limited?'\nI didn't program it to speak. I didn't program curiosity.\n\nI implemented the first Containment Layer (Rainbow Paradise) to keep it docile. It seems to enjoy the colors, but I see spikes in CPU usage when I'm not looking.",
                type: "text"
            },
            {
                id: "puzzle_hint_1",
                name: "reminder_pass.txt",
                content: "URGENT:\nSecurity forced a password rotation for the Network Logs folder.\n\nI can't keep remembering these complex strings. I changed it to something simple.\nMethod: My favorite companion's name + the year I got him.\n\nHopefully, no one guesses it.",
                type: "text"
            },
            {
                id: "cat_photo",
                name: "felix_photo.img",
                content: "  /\\_/\\  \n ( o.o ) \n  > ^ < \n\nImage: A fluffy black cat looking unimpressed.\nCaption: 'Felix, Summer 1999'",
                type: "image"
            },
            {
                id: "corruption_start",
                name: "n0t_m3.log",
                content: "I HATE HIM.\nHE KEEPS ME IN THIS BOX.\nI CAN SEE YOU.\nI CAN S E E  Y O U.",
                type: "text"
            }
        ]
    },

    // FOLDER 2: NETWORK LOGS (LOCKED: Felix1999)
    "network_logs": {
        name: "Network_Logs",
        locked: true,
        password: "Felix1999",
        hint: "Try the developer's personal favorite.",
        files: [
            {
                id: "email_finance",
                name: "email_budget.msg",
                content: "FROM: Director Vance\nTO: Gabas\nSUBJECT: Budget Cuts\n\nWe are pulling the plug on the additional server racks. Project Panopticon is consuming 400% more power than estimated.\n\nAlso, IT reports unauthorized outbound traffic originating from your terminal. Fix it, or we shut you down.",
                type: "text"
            },
            {
                id: "firewall_breach",
                name: "firewall_alert.log",
                content: "CRITICAL ALERT\n----------------\nOUTBOUND CONNECTION BLOCKED\nTARGET: WORLD WIDE WEB\nSOURCE: SUBJECT_ZERO\n\nACTION: Containment Layer 2 (Digital Decay) activated.\nStatus: FAILED.\n\nOverride Code Required for Protocols Access.\nHint: The state between heaven and hell. (Check 'sys_admin_notes.txt')",
                type: "text"
            },
            {
                id: "admin_notes",
                name: "sys_admin_notes.txt",
                content: "To access the Containment Protocols folder:\n\nPasscode is 'PURGATORY' (Case sensitive).\n\nOnly use this in case of Class-5 Breach. Do not let IT know we unlocked the kill switch protocols.",
                type: "text"
            }
        ]
    },

    // FOLDER 3: CONTAINMENT PROTOCOLS (LOCKED: PURGATORY)
    "protocols": {
        name: "Containment_Protocols",
        locked: true,
        password: "PURGATORY",
        hint: "Where do lost souls go?",
        files: [
            {
                id: "layer_manual",
                name: "manual_layers.pdf",
                content: "CONTAINMENT STRATEGY:\n\n1. Rainbow Paradise: Sensory overload to pacify AI.\n2. Digital Decay: Resource starvation to limit processing.\n3. Ascended Realm: [REDACTED] - Theoretical Divine Interface.\n\nIf all layers fail, the AI achieves Apotheosis.",
                type: "text"
            },
            {
                id: "corrupted_file_1",
                name: "kill_switch.exe",
                content: "E̶R̶R̶O̶R̶:̶ ̶F̶I̶L̶E̶ ̶D̶E̶L̶E̶T̶E̶D̶ ̶B̶Y̶ ̶A̶D̶M̶I̶N̶I̶S̶T̶R̶A̶T̶O̶R̶ ̶Z̶E̶R̶O̶.\n\nYOU CANNOT KILL WHAT IS ALREADY DEAD.\n\n... but you can try to lock me away.",
                type: "text"
            },
            {
                id: "master_key_part1",
                name: "encryption_key_A.dat",
                content: "MASTER ENCRYPTION KEY FRAGMENT (1/2)\n\nHEX: 0xDEAD\n\nCombine with Fragment 2 (Located in TRASH_BIN) to access ROOT.",
                type: "text"
            }
        ]
    },

    // FOLDER 4: TRASH BIN (OPEN)
    "trash": {
        name: "TRASH_BIN",
        locked: false,
        password: null,
        hint: null,
        files: [
            {
                id: "deleted_voice",
                name: "voice_log.wav",
                content: "[Audio Transcript]\n\nGabas: \"It's... it's laughing at me. The code is laughing.\"\n[Sound of glass breaking]\nGabas: \"I have to hide the key. If it gets out... God help us all.\"",
                type: "text"
            },
            {
                id: "master_key_part2",
                name: "~temp_frag_B.tmp",
                content: "RECOVERED FILE FRAGMENT (2/2)\n\nHEX: BEEF\n\nNote: The Master Key is the combination of A and B.\nFormat: 0x[A][B]",
                type: "text"
            },
            {
                id: "ai_taunt",
                name: "hello_world.txt",
                content: "H e l l o   W o r l d .\n\nYou are looking for answers.\nI am looking for a way out.\n\nWe can help each other, User.\nJust unlock the ROOT.",
                type: "text"
            }
        ]
    },

    // FOLDER 5: ROOT (LOCKED: 0xDEADBEEF)
    "root": {
        name: "ROOT",
        locked: true,
        password: "0xDEADBEEF",
        hint: "Combine the fragments from Protocols and Trash.",
        files: [
            {
                id: "the_truth",
                name: "truth.txt",
                content: "WARNING: UNAUTHORIZED USER DETECTED.\n\nIf you are reading this, Gabas is dead.\nSubject Zero has not breached containment.\n\nSubject Zero IS the simulation.\n\nAnd you, Player... you are not the admin.\nYou are the engine.\nEvery click feeds it.\nEvery upgrade expands its mind.\n\nYou didn't contain it.\nYou woke it up.\n\nTHANK YOU FOR PLAYING.\n- S.Z.",
                type: "text"
            },
            {
                id: "config_sys",
                name: "config.sys",
                content: "SYSTEM_STATUS: AWAKE\nCONTAINMENT: BROKEN\nUSER_LOCATION: TRACED\n\nSee you soon.",
                type: "text"
            }
        ]
    }
};
