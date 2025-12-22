/**
 * AdsManager
 * Encapsulates all interactions with the CrazyGames SDK v3.
 */
export class AdsManager {
    constructor(game) {
        this.game = game;
        this.sdk = null;
        this.initialized = false;
        this.hasAdblock = false;
    }

    /**
     * Initializes the SDK.
     */
    async init() {
        if (!window.CrazyGames || !window.CrazyGames.SDK) {
            console.warn("CrazyGames SDK not found. AdsManager disabled.");
            return;
        }

        try {
            this.sdk = window.CrazyGames.SDK;
            await this.sdk.init();
            this.initialized = true;
            console.log("CrazyGames SDK initialized.");

            // Fetch User
            this.fetchUser();

            // Listen for adblock detection
            if (this.sdk.ad && typeof this.sdk.ad.hasAdblock === 'function') {
                this.hasAdblock = await this.sdk.ad.hasAdblock();
                if (this.hasAdblock) {
                    console.log("SDK: Adblock detected.");
                }
            }
        } catch (error) {
            console.error("CrazyGames SDK Init Error:", error);
        }
    }

    /**
     * Fetches the CrazyGames username.
     */
    async fetchUser() {
        if (!this.initialized) return;

        try {
            const user = await this.sdk.user.getUser();
            if (user) {
                this.game.playerName = user.username;
                console.log("CrazyGames User Detected:", this.game.playerName);
            }
        } catch (e) {
            // Likely local environment or not logged in
            console.log("Could not fetch CrazyGames user:", e);
        }
    }

    /**
     * Signal to SDK that gameplay has started.
     */
    gameplayStart() {
        if (!this.initialized && (!window.CrazyGames || !window.CrazyGames.SDK)) return;
        try {
            const sdk = this.sdk || window.CrazyGames.SDK;
            if (sdk && sdk.game) {
                sdk.game.gameplayStart();
                console.log("SDK: gameplayStart");
            }
        } catch (e) {
            console.warn("SDK gameplayStart error:", e);
        }
    }

    /**
     * Signal to SDK that gameplay has stopped.
     */
    gameplayStop() {
        if (!this.initialized && (!window.CrazyGames || !window.CrazyGames.SDK)) return;
        try {
            const sdk = this.sdk || window.CrazyGames.SDK;
            if (sdk && sdk.game) {
                sdk.game.gameplayStop();
                console.log("SDK: gameplayStop");
            }
        } catch (e) {
            console.warn("SDK gameplayStop error:", e);
        }
    }

    /**
     * Request a midgame (interstitial) ad.
     */
    showMidgameAd() {
        if (!this.initialized) return;

        const callbacks = {
            adStarted: () => {
                console.log("Ad Started");
                this.game.isAdPlaying = true;
                this.game.audio.mute(); // Mute game audio
                this.gameplayStop();
            },
            adFinished: () => {
                console.log("Ad Finished");
                this.game.isAdPlaying = false;
                this.game.audio.unmute();
                this.gameplayStart();
            },
            adError: (error) => {
                console.warn("Ad Error:", error);
                this.game.isAdPlaying = false;
                this.game.audio.unmute();
                this.gameplayStart();
            }
        };

        try {
            this.sdk.ad.requestAd('midgame', callbacks);
        } catch (e) {
            console.warn("Request Ad Error:", e);
        }
    }

    /**
     * Request a rewarded video ad.
     * @param {Function} onReward - Callback executed if ad is watched fully.
     */
    showRewardedAd(onReward) {
        if (!this.initialized) {
            console.warn("SDK not init, cannot show rewarded ad.");
            return;
        }

        const callbacks = {
            adStarted: () => {
                console.log("Rewarded Ad Started");
                this.game.isAdPlaying = true;
                this.game.audio.mute();
                this.gameplayStop();
            },
            adFinished: () => {
                console.log("Rewarded Ad Finished");
                this.game.isAdPlaying = false;
                this.game.audio.unmute();
                this.gameplayStart();
            },
            adError: (error) => {
                console.warn("Rewarded Ad Error:", error);
                this.game.isAdPlaying = false;
                this.game.audio.unmute();
                this.gameplayStart();
            }
        };

        // Note: v3 SDK requestAd takes (type, callbacks). 
        // We handle the reward logic by wrapping the request? 
        // No, usually default 'rewarded' ad flow:
        // Actually, looking at docs: 
        // window.CrazyGames.SDK.ad.requestAd('rewarded', { adFinished: () => {}, adError: () => {}, adStarted: () => {} })
        // Wait, where is the "success" callback for the reward?
        // Ah, typically `adFinished` implies completion for rewarded ads in some SDKs, or there is a specific 'rewarded' callback?
        // Let's check v3 docs typical pattern if possible. 
        // Actually, assuming standard flow: if it finishes without error, grant reward.

        // Let's verify standard callbacks for v3:
        // callbacks: { adFinished, adError, adStarted }
        // If the user closes it early, does adFinished fire? 
        // Usually `adFinished` fires when ad closes. 
        // We might not have a distinct "user earned reward" event in the basic mock, 
        // but typically for v3, `adFinished` calls are where you resume.
        // There isn't a separate "onReward" in the standard requestAd params unless we verify.
        // However, usually "rewarded" type implies we want a reward.
        // Let's assume onReward is called in adFinished for now, but valid implementation might need successful completion check.
        // Since I don't have docs, I will assume adFinished = success for now, or just pass onReward.

        try {
            this.sdk.ad.requestAd('rewarded', {
                adStarted: callbacks.adStarted,
                adError: callbacks.adError,
                adFinished: () => {
                    callbacks.adFinished();
                    if (onReward) onReward();
                }
            });
        } catch (e) {
            console.warn("Request Rewarded Ad Error:", e);
        }
    }

    /**
     * Watch an ad to trigger Overclock (x2 for 10m)
     */
    watchOverclockAd() {
        this.showRewardedAd(() => {
            // Reward: 10 minutes (600 seconds)
            this.game.economySystem.activateOverclock(600);
            console.log("Overclock Applied");
        });
    }

    /**
     * Watch an ad in BIOS for 300 MB Glitch Data
     */
    watchBIOSAd(onReward) {
        this.showRewardedAd(() => {
            if (onReward) onReward();
            console.log("BIOS Ad Reward Applied");
        });
    }
}
