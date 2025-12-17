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
                    id: 'click_button',
                    trigger: () => this.game.state.score >= 10,
                    action: () => console.log('Tutorial: Clicked enough!'), // Placeholder
                },
                {
                    id: 'buy_upgrade',
                    trigger: () => this.game.state.clickPower > 1,
                    action: () => console.log('Tutorial: Upgrade bought!'), // Placeholder
                }
            ]
        };
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

        console.log(`Tutorial '${sequenceId}' started.`);
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

        const currentStep = this.steps[this.currentStepIndex];
        if (currentStep && currentStep.action) {
            currentStep.action();
        }

        this.currentStepIndex++;

        if (this.currentStepIndex >= this.steps.length) {
            this.complete();
        } else {
            // Optional: Trigger 'start' logic for the new step if we had entry actions
        }
    }

    /**
     * Mark the current sequence as complete.
     */
    complete() {
        if (this.currentSequenceId) {
            this.completedTutorials.add(this.currentSequenceId);
            console.log(`Tutorial '${this.currentSequenceId}' completed.`);
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
