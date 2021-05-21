import {LocalizedController, EVENT_REFRESH} from "../../assets/pdm-web-components/index.esm.js";

/**
 * Controls Application Flow
 * Makes the bridge between the UI and the BatchManager
 *
 * Handles data input and validation for the manipulation of Batches
 * @class ScanController
 * @module controllers
 */
export default class ScanController extends LocalizedController {

    initializeModel = () => ({});

    constructor(element, history) {
        super(element, history, false);
        let self = this;
        super.bindLocale(this, "scan");
        this.model = self.initializeModel();
        this.scannerController = self.element.querySelector('pdm-barcode-scanner-controller');
        self.on(EVENT_REFRESH, async (evt) => {
            evt.preventDefault();
            evt.stopImmediatePropagation();
            await self.scannerController.present(evt.detail);
            self.scannerController.holdForScan(self._parseScan.bind(self));
        },{capture: true});
    }

    async _parseScan(err, scanData){
        const self = this;
        console.log(JSON.stringify(scanData));
    }
}