(function setupInstallation() {
  let canProceedWithInstall = true;
  let deferredPrompt;
  let wasModalClosed = false;
  const modal = document.createElement("div");

  const observeDOM = (function () {
    const MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

    return function (obj, callback) {
      if (!obj || obj.nodeType !== 1) return;

      if (MutationObserver) {
        // define a new observer
        const mutationObserver = new MutationObserver(callback);

        // have the observer observe foo for changes in children
        mutationObserver.observe(obj, { childList: true, subtree: true });
        return mutationObserver;
      }

      // browser support fallback
      else if (window.addEventListener) {
        obj.addEventListener("DOMNodeInserted", callback, false);
        obj.addEventListener("DOMNodeRemoved", callback, false);
      }
    };
  })();

  const isIosSafari = () => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    const iOS = !!userAgent.match(/ipad/i) || !!userAgent.match(/iphone/i) || !!userAgent.match(/ipod/i);
    const webkit = !!userAgent.match(/WebKit/i);
    return iOS && webkit && !userAgent.match(/CriOS/i) && !userAgent.match(/OPiOS/i);
  };

  const INSTALL_POPUP_ITEM_KEY = "@installPopup";

  // Detects if device is in standalone mode
  const isInStandaloneMode = () => "standalone" in window.navigator && window.navigator.standalone;
  const wasInstallPopupShown = () =>
    "localStorage" in window && window.localStorage.getItem(INSTALL_POPUP_ITEM_KEY) === "true";
  const canInstallAutomatically = () => !isIosSafari() && deferredPrompt;
  const canInstallManually = () => isIosSafari() && !isInStandaloneMode() && !wasInstallPopupShown();
  const canInstallApp = () => (canInstallAutomatically() || canInstallManually()) && !wasModalClosed;

  const closeModal = () => {
    if ("localStorage" in window) {
      window.localStorage.setItem(INSTALL_POPUP_ITEM_KEY, "true");
    }
    wasModalClosed = true;
    modal.remove();
  };

  const showInstallationModal = () => {
    if (!canInstallApp()) return;

    const automaticInstallationContent = `
        <div class="automatic-pwa-container">
          <button id="installPWA" class="btn-primary">Install</button>
          <button id="closePWAModal" class="btn-secondary">Cancel</button>
        </div>
      `;
    const manualInstallationContent = `
        <div class="manual-pwa-container">
          <span>Just tap <img src="assets/pwa/share-icon-iphone.jpg" alt="Share" class="ios-share"/> then 'Add to Home Screen'</span>
          <img src="assets/pwa/save-to-home-screen-iphone.jpg" alt="Add to Home Screen" class="ios-home-screen" />
          <button id="closePWAModal" class="btn-secondary">Close</button>
        </div>
      `;
    const modalHtml = `    
      <div class="content">    
        <p>
          The current website can be installed as a standalone application for easier access.<br/>
          Do you wish to install it?
        </p>
        ${canInstallAutomatically() ? automaticInstallationContent : ""}
        ${canInstallManually() ? manualInstallationContent : ""}
      </div>
    `;

    modal.id = "installPWAModal";
    modal.className = "install-pwa-modal";
    modal.innerHTML = modalHtml;

    document.body.prepend(modal);
    document.body.style.display = "block";

    modal.querySelector("#closePWAModal").addEventListener("click", closeModal);

    if (canInstallAutomatically()) {
      modal.querySelector("#installPWA").addEventListener("click", () => {
        deferredPrompt
          .prompt()
          .then(function (evt) {
            // Wait for the user to respond to the prompt
            return deferredPrompt.userChoice;
          })
          .then(function (choiceResult) {
            closeModal();
            if (choiceResult.outcome === "accepted") {
              console.log("User accepted the install prompt");
            } else {
              console.log("User dismissed the install prompt");
            }
          })
          .catch(function (err) {
            closeModal();
            console.log(err);
            if (err.message.indexOf("user gesture") > -1) {
              //recycle, but make sure there is a user gesture involved
            } else if (err.message.indexOf("The app is already installed") > -1) {
              //the app is installed, no need to prompt, but you may need to log or update state values
              // alert("The app is already installed");
            } else {
              // alert("Error");
              return err;
            }
          });
      });
    }
  };

  window.addEventListener("load", () => {
    // Checks if should display install popup notification:
    if ("serviceWorker" in navigator) {
      fetch("./manifest.webmanifest")
        .then(() => {
          if (isIosSafari() && !isInStandaloneMode()) {
            showInstallationModal();
          }

          observeDOM(document.body, () => {
            const installPWAModal = document.querySelector("div#installPWAModal");
            if (!installPWAModal) {
              // install modal no longer exists or never existed
              if (canInstallApp()) {
                showInstallationModal();
              }
            }
          });
        })
        .catch((err) => {
          console.log("Cannot load manifest.webmanifest", err);
        });
    }
  });

  if ("onbeforeinstallprompt" in window) {
    window.addEventListener("beforeinstallprompt", (e) => {
      if (!canProceedWithInstall) {
        return;
      }

      canProceedWithInstall = false;

      // alert("ready to install");
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      deferredPrompt = e;
      // Update UI notify the user they can install the PWA
      showInstallationModal();
    });
  }

  window.addEventListener("appinstalled", (evt) => {
    // Log install to analytics
    console.log("INSTALL: Success");
  });
})();
