import NavigatorUtils from "./NavigatorUtils.js";

const SpinnerHTML = "<div class=\"loader-container\">\n" +
    "<div class=\"sk-cube-grid\">\n" +
    "    <div class=\"sk-cube sk-cube1\"></div>\n" +
    "    <div class=\"sk-cube sk-cube2\"></div>\n" +
    "    <div class=\"sk-cube sk-cube3\"></div>\n" +
    "    <div class=\"sk-cube sk-cube4\"></div>\n" +
    "    <div class=\"sk-cube sk-cube5\"></div>\n" +
    "    <div class=\"sk-cube sk-cube6\"></div>\n" +
    "    <div class=\"sk-cube sk-cube7\"></div>\n" +
    "    <div class=\"sk-cube sk-cube8\"></div>\n" +
    "    <div class=\"sk-cube sk-cube9\"></div>\n" +
    "</div>\n" +
    '<div class="loading-status"></div>' +
    "</div>";

const RELOAD_SECTION_TIMEOUT_MS = 10 * 1000;
const RELOAD_SECTION_HTML = `
    <p>
      The application is taking longer than expected to load. <br/>
      If you have network issues please use the following to refresh the application.
    </p>
    <button>Refresh</button>
`;

function Spinner(view) {

    let attachedSpinner = null;
    let reloadSectionTimeout = null;
    let lastStatusMessage = null;

    this.attachToView = function () {
        if (attachedSpinner) {
            return;
        }
        let element = document.createElement("div");
        element.classList.add('loader-parent-container');
        attachedSpinner = view.appendChild(element);
        attachedSpinner.innerHTML = SpinnerHTML;

        reloadSectionTimeout = setTimeout(() => {          
          if(!attachedSpinner) {
            // the spinner has been removed already
            return;
          }
          if("contains" in document.body && !document.body.contains(attachedSpinner)) {
            // the spinner has been replaced by something else
            return;
          }

          let reloadSectionElement = document.createElement("div");
          reloadSectionElement.className = "reload-section";
          const reloadSection = attachedSpinner.querySelector(".loader-container").appendChild(reloadSectionElement);
          reloadSection.innerHTML = RELOAD_SECTION_HTML;
  
          reloadSection.querySelector("button").addEventListener("click", () => {   
            console.log("Unregistering all service workers...");

            NavigatorUtils.unregisterAllServiceWorkers(() => {
                console.log("Clearing caches...");
                
                NavigatorUtils.clearCaches(() => {
                    window.location.reload();
                });
            });

            console.log("Clearing localStorage");
            localStorage.clear();
          });
        }, RELOAD_SECTION_TIMEOUT_MS);
    };

    this.removeFromView = function () {
        if (attachedSpinner) {
            attachedSpinner.remove();
            attachedSpinner = null;
        }
        if(reloadSectionTimeout) {
          clearTimeout(reloadSectionTimeout);
        }
    }

    this.setStatusText = function (text) {
      try{
        lastStatusMessage = text;
        const parent = attachedSpinner.querySelector('.loader-container');
        let loadingStatus = parent.querySelector('.loading-status');
        loadingStatus.innerHTML = text || '';
      }catch(e){
    		console.log("//TODO: pay attention, not critical but should be refactored.");
    }
    
    }

    this.getLastStatusMessage = function () {
        return lastStatusMessage;
    }
}

function prepareView(page_labels){
	try {
		page_labels.forEach(page_label => {
			let labelAttribute = "innerHTML";
			if (page_label.attribute) {
				labelAttribute = page_label.attribute;
			}
			let labelIdentifier = Object.keys(page_label).find((prop) => {
				return prop !== "attribute";
			});
			document.querySelector(labelIdentifier)[labelAttribute] = page_label[labelIdentifier]
		})
	}
	catch (e) {
		console.log(e);
	}
}

export {Spinner, prepareView};

