/**
 * Forked from PrivateSky
 * @module services
 */

/**
 *
 */

"use strict";

import getNavigatorUtils from "./NavigatorUtils.js";
import EventMiddleware from "./EventMiddleware.js";
const crypto = require("opendsu").loadApi("crypto");

function getIFrameBase() {
    let iPath = window.location.pathname;
    return iPath.replace("index.html", "") + "iframe/";
}

/**
 *
 * @param options
 */
function WalletRunner(options) {
    options = options || {};

    if (!options.seed)
        throw new Error("Missing seed");
    if (!options.env)
        throw new Error("Missing env");

    this.navigatorUtils = getNavigatorUtils(options.env)
    let self = this;
    this.seed = options.seed;
    this.hash = crypto.sha256(this.seed);
    this.spinner = options.spinner;

    /**
     * Builds the iframe container
     * for the SSApp
     * @return {HTMLIFrameElement}
     */
    const buildContainerIframe = (useSeedForIframeSource) => {
        const iframe = document.createElement("iframe");

        //iframe.setAttribute("sandbox", "allow-scripts allow-same-origin allow-forms");
        iframe.setAttribute("frameborder", "0");

        iframe.style.overflow = "hidden";
        iframe.style.height = "100%";
        iframe.style.width = "100%";
        iframe.style.display = "block";
        iframe.style.zIndex = "100";

        iframe.setAttribute("identity", this.hash);

        // This request will be intercepted by swLoader.js
        // and will make the iframe load the app-loader.js script
        iframe.src = window.location.origin + getIFrameBase() + (useSeedForIframeSource ? this.seed : this.hash);
        return iframe;
    };

    const setupLoadEventsListener = (iframe) => {
        let eventMiddleware = new EventMiddleware(iframe, this.hash);

        eventMiddleware.registerQuery("seed", () => {
            return { seed: this.seed };
        });

        eventMiddleware.onStatus("completed", async () => {
            if (iframe.hasAttribute("app-placeholder")) {
                iframe.removeAttribute("app-placeholder");
                document.body.innerHTML = iframe.outerHTML;
                if (this.spinner)
                    await this.spinner.dismiss();
                document.dispatchEvent(new CustomEvent('ssapp:loading:progress', {
                    detail: {
                        progress: 100,
                        status: 'Wallet Loaded<br />Loading SSApp...'
                    }
                }));
            } else {
                /**
                 * remove all body elements that are related to loader UI except the iframe
                 */
                try {
                    document.querySelectorAll("body > *:not(iframe):not(.loader-parent-container)").forEach((node) => node.remove());
                } catch (e) {
                    if (this.spinner)
                        await this.spinner.dismiss();
                }
            }
        });

        eventMiddleware.onStatus("sign-out", (data) => {
            self.navigatorUtils.unregisterAllServiceWorkers(() => {
                // TODO: clear vault instead of seedCage
                if (data.deleteSeed === true)
                    localStorage.removeItem("seedCage");
                window.location.reload();
            });
        });

        eventMiddleware.onStatus("error", () => {
            throw new Error("Unable to load application");
        });
    };

    /**
     * Post back the seed if the service worker
     * requests it
     */
    const setupSeedRequestListener = () => {
        self.navigatorUtils.addServiceWorkerEventListener("message", (e) => {
            if (!e.data || e.data.query !== "seed")
                return;
            const swWorkerIdentity = e.data.identity;
            if (swWorkerIdentity === this.hash)
                e.source.postMessage({
                    seed: this.seed,
                });
        });
    };


    /**
     * Toggle the loading spinner based on the loading
     * progress of ssapps
     */
    const setupLoadingProgressEventListener = () => {
        document.addEventListener('ssapp:loading:progress', async (e) => {
            const data = e.detail;
            const progress = data.progress;
            if (this.spinner)
                if (progress < 100)
                    await this.spinner.present();
                if (progress === 100)
                    await this.spinner.dismiss();
        });
    }

    this.run = function () {
        const areServiceWorkersEnabled =  !!options.env.sw;
        if (areServiceWorkersEnabled && !self.navigatorUtils.areServiceWorkersSupported)
            return alert("You current browser doesn't support running this application");

        const iframe = buildContainerIframe(!areServiceWorkersEnabled);
        setupLoadEventsListener(iframe);

        if (!areServiceWorkersEnabled) {
            let loadingInterval;

            let loadingProgress = 10;
            loadingInterval = setInterval(() => {
                loadingProgress += loadingProgress >= 90 ? 1 : 10;

                if (loadingProgress >= 100)
                    return clearInterval(loadingInterval);
            }, 1000);


            iframe.onload = () => {
                clearInterval(loadingInterval);
                this.spinner.removeFromView();
            };
            document.body.appendChild(iframe);
            
            self.navigatorUtils.registerPwaServiceWorker();
            return;
        }

        setupSeedRequestListener();
        setupLoadingProgressEventListener();

        self.navigatorUtils.unregisterAllServiceWorkers(() => {
            self.navigatorUtils.registerSW(
                {
                    name: "swLoader.js",
                    path: "swLoader.js",
                    scope: getIFrameBase(),
                },
                (err, result) => {
                    if (err)
                        throw err;

                    iframe.onload = () => {
                        self.navigatorUtils.registerPwaServiceWorker();
                    };
                    document.body.appendChild(iframe);
                }
            );
        });
    };
}

export default WalletRunner;
