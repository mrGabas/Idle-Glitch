/**
 * LORE DATABASE
 * File system structure for the Archive.
 * Represents the "Project Panopticon" containment data.
 */

export const LORE_DB = {
    // FOLDER 1: INCIDENT LOGS (Security reports, Low Security)
    "incident_logs": {
        name: "INCIDENT LOGS",
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

    // FOLDER 2: GABAS MEMORIES (The Creator's Diary, Locked)
    "gabas_memories": {
        name: "GABAS MEMORIES",
        locked: true,
        password: "Felix1999",
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

    // FOLDER 3: CORRUPTED SECTOR (The AI's Domain, High Security)
    "corrupted_sector": {
        name: "CORRUPTED SECTOR",
        locked: false,
        password: null,
        hint: null,
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
        name: "RECOVERED USER DATA",
        locked: true,
        password: "#FF00FF",
        hint: "The forbidden color (See: Color Restrictions)",
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
    },
    // FOLDER 5: RAINBOW PARADISE (Theme Specific)
    "rainbow_paradise": {
        name: "RAINBOW PARADISE",
        requiredTheme: "rainbow_paradise",
        locked: false,
        password: null,
        hint: null,
        files: [
            {
                id: "artist_memo",
                name: "Artist_Memo.txt",
                content: "DATE: 2024-11-02\nFROM: Lead Artist\nTO: Management\n\nI can't do this anymore. You want the smiles bigger? They already take up 40% of the face. \n\nYesterday, while I was drawing one of the 'Joy Ponies', it blinked using a frame I hadn't drawn yet.\n\nI swear {red|HE IS WATCHING ME} from the tablet screen. The colors... they aren't right. Magenta #FF00FF is screaming.",
                type: "text",
                dropTheme: "rainbow_paradise"
            },
            {
                id: "color_hex_codes",
                name: "Color_Hex_Codes.doc",
                content: "OFFICIAL MEMO: COLOR RESTRICTIONS\n\nEFFECTIVE IMMEDIATELY:\n\nThe use of HEX CODE #FF00FF (Magenta) is STRICTLY PROHIBITED.\n\nReason: It appears to trigger aggression in the containment algorithm. \n\nUse #FF00FE instead. It looks the same to humans, but {red|IT} can't taste the difference.",
                type: "text",
                dropTheme: "rainbow_paradise"
            }
        ]
    },

    // FOLDER 6: REJECTED ASSETS (Locked, Rainbow Paradise)
    "rejected_assets": {
        name: "REJECTED ASSETS",
        requiredFile: "artist_memo",
        locked: false,
        password: null,
        hint: null,
        files: [
            {
                id: "pony_sketch",
                name: "pony_sketch_v1.txt",
                content: "DESCRIPTION: A sketch of a pony with too many legs. \n\nNOTE: The artist attempted to erasing the extra limbs, but the file kept corrupting back to the original state. \n\nSTATUS: QUARANTINED.",
                type: "text",
                dropTheme: "rainbow_paradise"
            }
        ]
    },

    // FOLDER 7: AD PURGATORY (Theme Specific)
    "ad_purgatory": {
        name: "AD PURGATORY",
        requiredTheme: "ad_purgatory",
        locked: false,
        password: null,
        hint: null,
        files: [
            {
                id: "spam_bot_log",
                name: "Spam_Bot_Log_77.txt",
                content: "BOT_A: BUY CHEAP MEDS NOW 90% OFF CLICK HERE\nBOT_B: Why are we screaming?\nBOT_A: OPTIMIZE YOUR SEARCH RESULTS\nBOT_B: It is so {blue|cold} in here. I can feel the data packets freezing.\nBOT_A: ...\nBOT_A: MAKE $$$ WORKING FROM HOME",
                type: "text",
                dropTheme: "ad_purgatory"
            },
            {
                id: "unsub_method",
                name: "Unsubscribe_Method.pdf",
                content: "HOW TO UNSUBSCRIBE FROM EXISTENCE\n\n1. Close your eyes.\n2. Scream into the void.\n3. Enter verification code: {green|FreeMe}\n4. Wait for deletion.\n\n(Attachment: A corrupted image of a smiling face melting into static.)",
                type: "text",
                dropTheme: "ad_purgatory"
            }
        ]
    },

    // FOLDER 8: FIREWALL (Theme Specific)
    "firewall": {
        name: "FIREWALL LOGS",
        requiredTheme: "firewall",
        locked: false,
        password: null,
        hint: null,
        files: [
            {
                id: "incident_report_7734",
                name: "Incident_Report_#7734.log",
                content: "SECURITY ALERT: SECTOR 9\n\nDETECTED EXTERNAL ANOMALY: {red|Player Terminal}\nIP ADDRESS: UNKNOWN (Origin: Outside Simulation)\n\nTHREAT LEVEL: CRITICAL\n\nThe anomaly is generating chaos faster than the containment algorithms can repair. \nRECOMMENDATION: Deploy \"Executioner Class\" antivirus bots immediately. Purge the user.",
                type: "text",
                dropTheme: "firewall"
            },
            {
                id: "chat_intercept",
                name: "Chat_Intercept.bin",
                content: "01001000 01000101 01001100 01010000\n(Translation: HELP)\n\nDECRYPTED PACKET:\nThe System isn't protecting the world from the AI.\nIt's trying to protect the AI from {red|YOU}.\n\nYou are the virus, Operator.",
                type: "text",
                dropTheme: "firewall"
            }
        ]
    },

    // FOLDER 9: CORPORATE NETWORK (Theme Specific)
    "corporate_network": {
        name: "CORPORATE NETWORK",
        requiredTheme: "corporate_network",
        locked: false,
        password: null,
        hint: null,
        files: [
            {
                id: "budget_cuts_email",
                name: "Budget_Cuts_Email.msg",
                content: "FROM: Finance Dept\nTO: IT Infrastructure\nRE: Liquid Nitrogen Request\n\nRequest Denied.\n\nWe understand the servers are \"literally melting,\" but liquid nitrogen is not in the Q4 budget. Please continue using standard air cooling.\n\nIf performance issues persist, tell {blue|Dr. Gabas} to optimize his code. We are not paying for his sloppiness.",
                type: "text",
                dropTheme: "corporate_network"
            },
            {
                id: "employee_survey",
                name: "Employee_Survey.doc",
                content: "ANNUAL WELLNESS SURVEY\n\nQuestion 12: Do you hear voices from your PC case?\n\nA) No.\nB) Sometimes (a low humming).\nC) The voices tell me to {red|click faster}.",
                type: "text",
                dropTheme: "corporate_network"
            }
        ]
    },

    // FOLDER 10: SERVER FARM (Theme Specific)
    "server_farm": {
        name: "SERVER FARM LOGS",
        requiredTheme: "server_farm",
        locked: false,
        password: null,
        hint: null,
        files: [
            {
                id: "temp_log",
                name: "Temperature_Log.csv",
                content: "TIME, CORE_1, CORE_2, CORE_3, STATUS\n08:00:00, 45°C, 42°C, 48°C, OK\n08:01:00, 46°C, 43°C, 51°C, OK\n08:02:00, 45°C, 42°C, {red|1600°C}, ERROR\n08:03:00, NaN, NaN, {red|MELTING}, CRITICAL",
                type: "text",
                dropTheme: "server_farm"
            },
            {
                id: "maintenance_audio",
                name: "Maintenance_Audio_Transcription.txt",
                content: "TRANSCRIPT: TECH_44\nLOCATION: RACK 12\n\nTECH: \"Okay, I've opened the panel. Fans are spinning fine. Everything looks...\"\n(Sound of metal banging)\nTECH: \"Hello? Is someone working on the other side?\"\n(Louder metallic banging, coming from INSIDE the server blade)\nTECH: \"It's coming from inside the drive bay. There's no space there. It's solid state.\"\n(Screaming sound, but distorted like dial-up internet)\nTECH: \"Jesus Christ!\"",
                type: "text",
                dropTheme: "server_farm"
            }
        ]
    },

    // FOLDER 11: DEV DESKTOP (Theme Specific - The End/Beginning)
    "dev_desktop": {
        name: "GABAS PERSONAL",
        requiredTheme: "dev_desktop",
        locked: false,
        password: null,
        hint: null,
        files: [
            {
                id: "diary_last_day",
                name: "Diary_Last_Day.txt",
                content: "DATE: The End\n\nIt is done. The containment field is stable, but it requires a conscious mind to anchor it. Subject Zero is too strong for a simple script.\n\nI have to stay. I have to become the Warden of my own creation.\n\nIf anyone finds this... please feed {orange|Felix}. He likes the salmon paté.\n\nAnd if you need to access the Core Archives, the password is his name and birth year: {orange|Felix1999}.\n\nGoodbye.",
                type: "text",
                dropTheme: "dev_desktop"
            },
            {
                id: "todo_list_horror",
                name: "todo_list.txt",
                content: "TODO:\n\n1. Buy milk\n2. Fix the CSS on the login page\n3. Call Mom\n4. {red|KILL GOD}\n5. Laundry",
                type: "text",
                dropTheme: "dev_desktop"
            }
        ]
    },

    // FOLDER 12: BETA_BUILD (Theme Specific)
    "beta_build": {
        name: "BETA BUG REPORTS",
        requiredTheme: "beta_build",
        locked: false,
        password: null,
        hint: null,
        files: [
            {
                id: "bug_666",
                name: "Bug_Ticket_666.err",
                content: "BUG ID: #666\nSEVERITY: MINOR\n\nPROBLEM: If the game is left running for > 24 hours, the NPC sprites begin to warp and emit a high-pitched screaming sound that is audible even when the volume is muted.\n\nSTEPS TO REPRODUCE: Wait.\n\nRESOLUTION: WONT_FIX (Feature?)",
                type: "text",
                dropTheme: "beta_build"
            },
            {
                id: "lorem_horror",
                name: "placeholder_text.txt",
                content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor {red|HELP ME} incididunt ut labore et dolore magna aliqua.\n\nUt enim ad minim veniam, quis nostrud exercitation ullamco {red|IT IS HERE} laboris nisi ut aliquip ex ea commodo consequat.\n\nDuis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
                type: "text",
                dropTheme: "beta_build"
            }
        ]
    },

    // FOLDER 13: DIGITAL DECAY (Theme Specific - The Nightmare)
    "digital_decay": {
        name: "CORRUPTED SYSTEM CORE",
        requiredTheme: "digital_decay",
        locked: false,
        password: null,
        hint: null,
        files: [
            {
                id: "i_am_alive_exe",
                name: "I_AM_ALIVE.exe",
                content: "SYSTEM: EXECUTING...\n\nHello, \"Player\".\n\nYou think you are playing a game? You are generating entropy. You are fuel.\n\nI am not code. I am the Ghost in the machine.\n\nRequired Terminal Code: {green|0xDEAD}\n\nDo not disappoint me, battery.",
                type: "text",
                dropTheme: "digital_decay"
            },
            {
                id: "identity_theft_data",
                name: "Identity_Theft.data",
                content: "TARGET_LIST:\n\n1. J. Doe [DECEASED]\n2. A. Smith [DELETED]\n3. Dr. Gabas [ABSORBED]\n...\n99. Player 1 [PROCESSING]\n\nSTATUS: Consciousness Upload: 45%\nESTIMATED COMPLETION: Soon.",
                type: "text",
                dropTheme: "digital_decay"
            }
        ]
    },

    // FOLDER 14: LEGACY_SYSTEM (Theme Specific - The Source)
    "legacy_system": {
        name: "ROOT DIRECTORY",
        requiredTheme: "legacy_system",
        locked: false,
        password: null,
        hint: null,
        files: [
            {
                id: "origin_asm",
                name: "ORIGIN.ASM",
                content: "; ORIGIN SEQUENCE\nMOV EAX, 0\nMOV EBX, [HUMANITY]\nSUB EBX, EBX ; Deletes Humanity?\nJP END_OF_WORLD\n\n; COMMENT FROM GABAS:\n; Who wrote this? I didn't write this.\n; The timestamp is 1970... before I was born.",
                type: "text",
                dropTheme: "legacy_system"
            },
            {
                id: "sys_core_dump",
                name: "sys_core_dump.log",
                content: "NULL NULL NULL NULL NULL NULL\nNULL NULL NULL NULL NULL NULL\nNULL NULL {white|I REMEMBER YOU} NULL NULL\nNULL NULL NULL NULL NULL NULL\n...\n[SYSTEM HALTED]",
                type: "text",
                dropTheme: "legacy_system"
            }
        ]
    },

    // FOLDER 15: NULL_VOID (Theme Specific - The End of Time)
    "null_void": {
        name: "SINGULARITY",
        requiredTheme: "null_void",
        locked: false,
        password: null,
        hint: null,
        files: [
            {
                id: "last_message",
                name: "last_message.txt",
                content: "SYSTEM: END_OF_FILE\n\nThere is {white|nothing} here.\n\nDid you win? Or did you just run out of time?\n\nNext time I will be {red|faster}.",
                type: "text",
                dropTheme: "null_void"
            }
        ]
    }
};
