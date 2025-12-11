/**
 * ENTITY MANAGER
 * centralized entity storage and lifecycle management
 * @module managers/EntityManager
 */

export class EntityManager {
    constructor() {
        this.layers = {
            particles: [],
            debris: [],
            ui: [], // popups, floating text
            enemies: [], // hunter, captchas
            items: [], // lore files
            // activeNotepad etc are usually singular, keep in Game or here?
            // "It should hold arrays for particles, debris, popups, enemies." -> focus on arrays
        };
    }

    /**
     * Adds an entity to the specified layer.
     * @param {string} layer - The name of the layer (e.g., 'particles', 'debris').
     * @param {Object} entity - The entity object to add.
     */
    add(layer, entity) {
        if (this.layers[layer]) {
            this.layers[layer].push(entity);
        } else {
            console.warn(`Layer ${layer} does not exist in EntityManager`);
        }
    }

    /**
     * Retrieves all entities in a given layer.
     * @param {string} layer - The layer name.
     * @returns {Array<Object>} Array of entities in that layer.
     */
    getAll(layer) {
        return this.layers[layer] || [];
    }

    /**
     * Clears all entities from all layers.
     */
    clear() {
        this.layers = {
            particles: [],
            debris: [],
            ui: [], // popups, floating text
            enemies: [], // hunter, captchas
            items: [], // lore files
        };
    }

    /**
     * Updates all entities across all layers.
     * @param {number} dt - Delta time in seconds.
     * @param {import('../core/game.js').Game} gameContext - Reference to the main Game instance.
     */
    update(dt, gameContext) {
        for (const layerName in this.layers) {
            const layer = this.layers[layerName];
            for (let i = layer.length - 1; i >= 0; i--) {
                const entity = layer[i];

                // Flexible update: pass dt and context
                // Some entities might return a status (like 'collected', 'timeout')
                // We can handle generic removal here
                let status;
                if (entity.update) {
                    status = entity.update(dt, gameContext);
                }

                // Check for life
                if ((entity.life !== undefined && entity.life <= 0) || (entity.active === false)) {
                    layer.splice(i, 1);
                    continue;
                }

                // Handle return status if needed?
                // The prompt says "Game.js becomes a high-level orchestrator".
                // If we move logic inside entities, we don't need to handle it here.
                // If we keep logic in Game.js, we need to iterate manually?
                // "In Game.update(), replace the manual loops... with this.entityManager.update(dt)."
                // This implies implicit handling. Use callbacks or entity self-handling.
                if (status === 'remove' || status === true) { // simple remove flag
                    layer.splice(i, 1);
                }
            }
        }
    }
}
