import {LocalizedController, EVENT_REFRESH} from "../../assets/pdm-web-components/index.esm.js";

/**
 * Controls Application Flow
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

        self.on(EVENT_REFRESH, async (evt) => {
            evt.preventDefault();
            evt.stopImmediatePropagation();
            await self.showBarcodeScanner({
                title: self.translate('title'),
                data: evt.detail
            }, self._parseScan.bind(self));
        },{capture: true});
    }

    async _parseScan(err, scanData){
        const self = this;
        console.log(JSON.stringify(scanData));
    }
}