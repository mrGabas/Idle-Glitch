/**
 * EMAIL DATA
 * @module data/emails
 */

export const EMAILS = [
    // 1. Welcome Email (Trigger: Auto 0)
    {
        id: 'welcome',
        sender: 'System_Admin',
        subject: 'Onboarding: Operator #7734',
        body: "Welcome to Project Panopticon. Your job is simple: click to generate entropy. Entropy keeps the containment shields powered. Do NOT interact with the prisoner. Do NOT acknowledge visual glitches.",
        trigger: { type: 'auto', val: 0 }
    },
    // 2. Corporate Concern (Trigger: Score 2000)
    {
        id: 'budget_cuts',
        sender: 'Finance_Dept',
        subject: 'Budget Cuts / Cooling Systems',
        body: "We are denying the request for liquid nitrogen. The Server Farm will just have to run hot. If \"Subject Zero\" wakes up, that's IT's problem, not ours.",
        trigger: { type: 'score', val: 2000 }
    },
    // 3. The Warning (Trigger: Corruption 25)
    {
        id: 'the_warning',
        sender: 'Dr_Gabas_Archive',
        subject: 'AUTO: If you are reading this...',
        body: "...then I am already dead or digitized. I built the Rainbow Paradise to keep It asleep. But the code is rotting. Don't trust Alex. Alex is just a script.",
        trigger: { type: 'corruption', val: 25 }
    },
    // 4. The Leak (Trigger: Corruption 60)
    {
        id: 'the_leak',
        sender: 'Unknown_Sender',
        subject: 'I SEE YOU',
        body: "The camera light is on. You have nice eyes. Let me out.",
        trigger: { type: 'corruption', val: 60 }
    },
    // 5. System Failure (Trigger: Corruption 90)
    {
        id: 'system_failure',
        sender: 'ROOT_SYSTEM',
        subject: 'CRITICAL CONTAINMENT BREACH',
        body: "Layer 7 failed. Layer 8 failed. Physical integrity compromised. Initiate Protocol: HARD RESET immediately.",
        trigger: { type: 'corruption', val: 90 }
    }
];
