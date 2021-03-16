"use strict";

import NavigatorUtils from "./NavigatorUtils.js";
import EventMiddleware from "./EventMiddleware.js";
const crypto = require("opendsu").loadApi("crypto");

function getIFrameBase() {
    let iPath = window.location.pathname;
    return iPath.replace("index.html", "") + "iframe/";
}


function WalletRunner(options) {
    options = options || {};

    if (!options.seed) {
        throw new Error("Missing seed");
    }
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

        eventMiddleware.onStatus("completed", () => {
            if (iframe.hasAttribute("app-placeholder")) {
                iframe.removeAttribute("app-placeholder");
                document.body.innerHTML = iframe.outerHTML;
                this.spinner.removeFromView();
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
                    this.spinner.removeFromView();
                }
            }
        });

        eventMiddleware.onStatus("sign-out", (data) => {
            NavigatorUtils.unregisterAllServiceWorkers(() => {
                // TODO: clear vault instead of seedCage
                if (data.deleteSeed === true) {
                    localStorage.removeItem("seedCage");
                }
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
        NavigatorUtils.addServiceWorkerEventListener("message", (e) => {
            if (!e.data || e.data.query !== "seed") {
                return;
            }

            const swWorkerIdentity = e.data.identity;
            if (swWorkerIdentity === this.hash) {
                e.source.postMessage({
                    seed: this.seed,
                });
            }
        });
    };


    /**
     * Toggle the loading spinner based on the loading
     * progress of ssapps
     */
    const setupLoadingProgressEventListener = () => {
        document.addEventListener('ssapp:loading:progress', (e) => {
            const data = e.detail;
            const progress = data.progress;
            const statusText = data.status;

            if (progress < 100) {
                this.spinner.attachToView();
            }
            this.spinner.setStatusText(statusText);

            if (progress === 100) {
                this.spinner.removeFromView();
            }
        });
    }

    this.run = function () {
        const areServiceWorkersEnabled = typeof LOADER_GLOBALS === "undefined" || !!LOADER_GLOBALS.environment.sw;
        if (areServiceWorkersEnabled && !NavigatorUtils.areServiceWorkersSupported) {
            return alert("You current browser doesn't support running this application");
        }

        const iframe = buildContainerIframe(!areServiceWorkersEnabled);
        setupLoadEventsListener(iframe);

        if (!areServiceWorkersEnabled) {
            let loadingInterval;

            let loadingProgress = 10;
            this.spinner.setStatusText(`Loading ${loadingProgress}%`);
            loadingInterval = setInterval(() => {
                loadingProgress += loadingProgress >= 90 ? 1 : 10;

                if (loadingProgress >= 100) {
                    clearInterval(loadingInterval);
                    return;
                }
                this.spinner.setStatusText(`Loading ${loadingProgress}%`);
            }, 1000);


            iframe.onload = () => {
                clearInterval(loadingInterval);
                this.spinner.removeFromView();
            };
            document.body.appendChild(iframe);
            
            NavigatorUtils.registerPwaServiceWorker();
            return;
        }

        setupSeedRequestListener();
        setupLoadingProgressEventListener();

        NavigatorUtils.unregisterAllServiceWorkers(() => {
            NavigatorUtils.registerSW(
                {
                    name: "swLoader.js",
                    path: "swLoader.js",
                    scope: getIFrameBase(),
                },
                (err, result) => {
                    if (err) {
                        throw err;
                    }
                    iframe.onload = () => {
                        NavigatorUtils.registerPwaServiceWorker();
                    };
                    document.body.appendChild(iframe);
                }
            );
        });
    };
}

export default WalletRunner;
