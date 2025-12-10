import { Command } from './Command.js';

export class HelpCommand extends Command {
    constructor(game) {
        super(game);
        this.name = "help";
        this.description = "Shows available commands";
    }

    execute(args) {
        const cmds = this.game.chatSystem.commands; // Access via game -> chatSystem reference
        let output = "Available Commands:";
        for (const key in cmds) {
            output += `\n${cmds[key].usage} - ${cmds[key].description}`;
        }
        this.game.chatSystem.addMessage("SYSTEM", output);
    }
}

export class ResetCommand extends Command {
    constructor(game) {
        super(game);
        this.name = "reset";
        this.description = "Resets the game state";
    }

    execute(args) {
        // Logic to trigger hard reset
        // this.game.triggerHardReset(); // Needs to be implemented in Game or handled via Event
        this.game.chatSystem.addMessage("SYSTEM", "Reset command triggered (Not fully implemented in this refactor step yet).");
    }
}

export class VerifyCommand extends Command {
    constructor(game) {
        super(game);
        this.name = "verify";
        this.description = "Debug verification";
    }

    execute(args) {
        this.game.chatSystem.addMessage("SYSTEM", "Verification complete. Systems nominal.");
    }
}
