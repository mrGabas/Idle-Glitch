/**
 * Base Command Class
 */
export class Command {
    constructor(game) {
        this.game = game;
        this.name = "command";
        this.description = "Base command";
        this.usage = "/command";
    }

    execute(args) {
        throw new Error("Execute method not implemented");
    }
}
