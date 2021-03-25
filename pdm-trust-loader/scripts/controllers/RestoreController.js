import "../../loader-config.js";
import { Spinner, prepareView } from "./services/UIService.js";
import LoaderService from "./services/WalletService.js";
import NavigatorUtils from "./services/NavigatorUtils.js";

function RestoreController() {
  let seedSSI;
  let pin;
  let wizard;
  let spinner;
  const walletService = new LoaderService();

  function displayContainer(containerId) {
    document.getElementById(containerId).style.display = "block";
  }

  this.init = function () {
    NavigatorUtils.hasRegisteredServiceWorkers((error, hasServiceWorker) => {
      if (hasServiceWorker) {
        NavigatorUtils.unregisterAllServiceWorkers(() => {
          window.location.reload();
        });
      } else {
        spinner = new Spinner(document.getElementsByTagName("body")[0]);
        wizard = new Stepper(document.getElementById("psk-wizard"));
      }
    });
  };

  this.validateSeed = function (event) {
    let seed = event.target.value;
    let btn = document.getElementById("restore-seed-btn");
    if (seed.length > 0) {
      document.getElementById("seed-error").innerText = "";
      btn.removeAttribute("disabled");
    } else {
      btn.setAttribute("disabled", "disabled");
    }
  };

  this.validatePIN = function (event) {
    pin = document.getElementById("pin").value;
    let pinConfirm = document.getElementById("confirm-pin").value;
    let btn = document.getElementById("set-pin-btn");

    if (pin === pinConfirm && pin.length >= LOADER_GLOBALS.PASSWORD_MIN_LENGTH) {
      btn.removeAttribute("disabled");
    } else {
      btn.setAttribute("disabled", "disabled");
    }
  };

  this.restore = function (event) {
    event.preventDefault();
    seedSSI = document.getElementById("seed").value;
    try {
      walletService.restoreFromSeedSSI(seedSSI, (err) => {
        if (err) {
          throw err;
        }

        wizard.next();
      });
    } catch (e) {
      console.log(e);
      document.getElementById("seed-error").innerText = "SeedSSI is not valid.";
    }
  };

  this.previous = function (event) {
    event.preventDefault();
    document.getElementById("seed").value = "";
    document.getElementById("restore-seed-btn").setAttribute("disabled", "disabled");
    wizard.previous();
  };

  this.setPin = function (event) {
    event.preventDefault();
    spinner.attachToView();
    walletService.storeSSI(seedSSI, pin, (err) => {
      spinner.removeFromView();
      if (err) {
        return (document.getElementById("register-details-error").innerText = "Operation failed. Try again");
      }
      wizard.next();
    });
  };

  this.openWallet = function (event) {
    event.preventDefault();
    event.stopImmediatePropagation();
    window.location.replace("./");
  };
}

let controller = new RestoreController();
document.addEventListener("DOMContentLoaded", function () {
  let LABELS = LOADER_GLOBALS.LABELS_DICTIONARY;
  const page_labels = [
    { title: LABELS.APP_NAME },
    { "#step-seed": LABELS.SEED },
    { "#step-pin": LABELS.PIN },
    { "#step-complete": LABELS.COMPLETE },
    { "#seed-label": LABELS.SEED },
    {
      "#seed": LABELS.ENTER_WALLET_SEED,
      attribute: "placeholder",
    },

    {
      "#pin": LABELS.ENTER_PASSWORD,
      attribute: "placeholder",
    },
    {
      "#confirm-pin": LABELS.ENTER_CONFIRM_PASSWORD,
      attribute: "placeholder",
    },
    { "#pin-help": LABELS.SET_UP_PASSWORD_HELP },
    { "#pin-confirm-help": LABELS.SET_UP_CONFIRM_PASSWORD_HELP },
    { "#set-pin-btn": LABELS.REGISTER_BUTTON_MESSAGE },
    { "#restore-seed-btn": LABELS.RESTORE },
    { "#wallet-restored-success": LABELS.WALLET_RESTORED_SUCCESSFULLY },
    { "#change-wallet": LABELS.CHANGE_WALLET },

    { "#open-wallet-btn": LABELS.OPEN_WALLET },
  ];
  prepareView(page_labels);
  controller.init();
});
window.controller = controller;
