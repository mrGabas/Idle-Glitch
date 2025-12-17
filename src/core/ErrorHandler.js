/**
 * @module core/ErrorHandler
 * Global error handling to show a thematic BSOD screen.
 */

export class ErrorHandler {
    static init() {
        window.onerror = (msg, url, line, col, error) => {
            ErrorHandler.showError(msg, error ? error.stack : `${url}:${line}:${col}`);
            return true; // Prevent default browser console log if we want, or false to let it pass
        };

        window.onunhandledrejection = (event) => {
            ErrorHandler.showError(event.reason ? event.reason.message : 'Unknown Promise Error', event.reason);
            event.preventDefault();
        };


    }

    static showError(message, stack) {
        console.error("CRITICAL ERROR CAUGHT:", message, stack);

        // Stop Game Loop (try global reference if available, or just rely on overlay blocking)
        // Since we don't have a clean global 'game' accessible easily here statically without passing it,
        // we'll rely on the visual overlay blocking the UI.
        // Ideally we'd do window.cancelAnimationFrame(reqId) if we stored it globally.

        // Show BSOD
        const overlay = document.getElementById('bsod-overlay');
        if (overlay) {
            overlay.style.display = 'flex';

            const msgEl = document.getElementById('bsod-message');
            const stackEl = document.getElementById('bsod-stack');

            if (msgEl) msgEl.innerText = message || "Unknown Error";
            if (stackEl) stackEl.innerText = stack || "No stack trace available.";

            // Optional: Play glitch sound if audio context is still alive?
        }
    }

    static reboot() {
        location.reload();
    }
}
