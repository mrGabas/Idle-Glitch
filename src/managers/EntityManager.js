/**
 * Entity Manager
 * centralized management of all game entities.
 */
export class EntityManager {
    constructor() {
        // Layered storage
        this.layers = {
            background: [],
            debris: [],
            enemies: [],
            particles: [],
            ui: [] // World-space UI like popups
        };
    }

    add(layerName, entity) {
        if (this.layers[layerName]) {
            this.layers[layerName].push(entity);
        } else {
            console.warn(`Layer ${layerName} does not exist, adding to default`);
            this.layers.particles.push(entity);
        }
    }

    update(dt) {
        for (const layer in this.layers) {
            const arr = this.layers[layer];
            for (let i = arr.length - 1; i >= 0; i--) {
                const ent = arr[i];
                if (ent.update) ent.update(dt);

                // Culling / Death check
                if (ent.active === false || ent.life <= 0) {
                    arr.splice(i, 1);
                }
            }
        }
    }

    draw(ctx) {
        // Draw in specific order
        const renderOrder = ['background', 'debris', 'enemies', 'particles', 'ui'];

        renderOrder.forEach(layer => {
            const arr = this.layers[layer];
            arr.forEach(ent => {
                if (ent.draw) ent.draw(ctx);
            });
        });
    }

    clear() {
        for (const layer in this.layers) {
            this.layers[layer] = [];
        }
    }

    // Query helper
    getAll(layerName) {
        return this.layers[layerName] || [];
    }
}
