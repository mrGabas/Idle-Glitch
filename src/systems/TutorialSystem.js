/**
 * Tutorial System
 * @module systems/TutorialSystem
 */

export class TutorialSystem {
    /**
     * @param {import('../core/game').Game} game
     */
    constructor(game) {
        this.game = game;
        this.steps = [];
        this.currentStepIndex = 0;
        this.isActive = false;
        this.currentSequenceId = null;
        this.completedTutorials = new Set();

        // Define tutorial sequences here or load them from a data file
        this.sequences = {
            'intro': [
                {
                    id: 'welcome',
                    sender: 'Admin_Alex',
                    message: "Welcome, Operator #7734. Protocol initialized.",
                    trigger: () => true,
                    action: () => { }
                },
                {
                    id: 'generate_entropy',
                    sender: 'SYSTEM',
                    message: "TASK: Generate 10 Entropy. Click the central area.",
                    targetId: 'gameCanvas',
                    delay: 2000,
                    trigger: () => this.game.state.score >= 10,
                    action: () => {
                        this.game.economySystem.openShop();
                    }
                },
                {
                    id: 'buy_unicorn',
                    sender: 'SYSTEM',
                    message: "ACTION: Purchase 'Unicorn Friend'.",
                    trigger: () => {
                        const u = this.game.themeManager.upgrades.find(u => u.id === 'r1');
                        return u && u.count >= 1;
                    }
                },
                {
                    id: 'complete',
                    sender: 'Admin_Alex',
                    message: "Efficiency increased. Continue monitoring.",
                    action: () => {
                        // Keep shop open just in case
                        this.game.economySystem.openShop();
                    }
                }
            ],
            'locked_folder_hint': [
                {
                    id: 'locked_folder_msg',
                    sender: 'Admin_Alex',
                    message: "Damn, it's encrypted. Gabas usually used his pets' names as passwords. Check the 'Personal' files.",
                    trigger: () => true
                }
            ],
            'antivirus_warning': [
                {
                    id: 'antivirus_msg',
                    sender: 'Admin_Alex',
                    message: "Wait! That bot will purge your corruption progress! Click to destroy it!",
                    trigger: () => true
                }
            ]
        };
    }

    /**
     * Contextual Trigger: attempts to start a tutorial if not already completed.
     * @param {string} sequenceId 
     */
    triggerContextual(sequenceId) {
        if (this.completedTutorials.has(sequenceId)) return;

        // Interrupt current or just start
        this.startSequence(sequenceId);
    }

    /**
     * Initialize and load save data.
     * @param {Object} saveData 
     */
    init(saveData) {
        if (saveData && Array.isArray(saveData)) {
            this.completedTutorials = new Set(saveData);
        }
    }

    /**
     * Start a specific tutorial sequence.
     * @param {string} sequenceId 
     */
    startSequence(sequenceId) {
        if (this.completedTutorials.has(sequenceId)) {
            return; // Already completed
        }

        if (!this.sequences[sequenceId]) {
            console.warn(`Tutorial sequence '${sequenceId}' not found.`);
            return;
        }

        this.currentSequenceId = sequenceId;
        this.steps = this.sequences[sequenceId];
        this.currentStepIndex = 0;
        this.isActive = true;



        // Setup first step
        if (this.steps.length > 0) {
            this.showStep(this.steps[0]);
        }
    }

    /**
     * Update loop to check triggers.
     * @param {number} dt 
     */
    update(dt) {
        if (!this.isActive || !this.steps.length) return;

        const currentStep = this.steps[this.currentStepIndex];

        // Check if trigger condition is met
        if (currentStep.trigger && currentStep.trigger(dt)) {
            this.nextStep();
        }
    }

    /**
     * Advance to the next step or complete the sequence.
     */
    nextStep() {
        if (!this.isActive) return;

        // Clean up previous step
        this.clearHighlight();

        const currentStep = this.steps[this.currentStepIndex];
        if (currentStep && currentStep.action) {
            currentStep.action();
        }

        this.currentStepIndex++;

        if (this.currentStepIndex >= this.steps.length) {
            this.complete();
        } else {
            // Show next step
            const next = this.steps[this.currentStepIndex];
            if (next.delay) {
                setTimeout(() => this.showStep(next), next.delay);
            } else {
                this.showStep(next);
            }
        }
    }

    /**
     * Show the visual cues for a tutorial step.
     * @param {Object} step 
     */
    showStep(step) {
        // Chat Message
        if (step.message) {
            // Determine sender, default to 'SYSTEM' or specific character
            const sender = step.sender || 'SYSTEM';
            this.game.uiManager.chat.addMessage(sender, step.message);
        }

        // Visual Highlight
        if (step.targetId) {
            this.highlightElement(step.targetId);
        }
    }

    /**
     * Highlights a DOM element by ID.
     * @param {string} id 
     */
    highlightElement(id) {
        const el = document.getElementById(id);
        if (el) {
            el.classList.add('tutorial-highlight');
            this.activeHighlight = el;
        } else {
            console.warn(`Tutorial: Target element #${id} not found.`);
        }
    }

    /**
     * Removes the current highlight.
     */
    clearHighlight() {
        if (this.activeHighlight) {
            this.activeHighlight.classList.remove('tutorial-highlight');
            this.activeHighlight = null;
        }
    }

    /**
     * Mark the current sequence as complete.
     */
    complete() {
        this.clearHighlight(); // Ensure cleanup

        if (this.currentSequenceId) {
            this.completedTutorials.add(this.currentSequenceId);

            this.game.saveGame(); // Ensure progress is saved
        }

        this.isActive = false;
        this.currentSequenceId = null;
        this.steps = [];
        this.currentStepIndex = 0;
    }

    /**
     * Get data for saving.
     * @returns {Array} Array of completed tutorial IDs.
     */
    getSaveData() {
        return Array.from(this.completedTutorials);
    }
}
