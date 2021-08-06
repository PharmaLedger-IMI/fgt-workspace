import { LocalizedController, HistoryNavigator, EVENT_REFRESH, EVENT_SSAPP_HAS_LOADED, EVENT_ACTION, BUTTON_ROLES } from "../../assets/pdm-web-components/index.esm.js";
const {ShipmentLine, utils, Shipment, ShipmentStatus, IndividualProduct, IndividualProductStatus} = require('wizard').Model;

export default class IndividualProductController extends LocalizedController{

    initializeModel = () => ({
        individualRef: '',
        identity: {}
    });

    constructor(...args) {
        super(false, ...args);
        super.bindLocale(this, 'individualProduct');
        this.model = this.initializeModel();
        this._updateStatuses(IndividualProduct);
        const wizard = require('wizard');
        const participantManager = wizard.Managers.getParticipantManager();
        this.individualProductManager = wizard.Managers.getIndividualProductManager(participantManager);
        this.productEl = this.element.querySelector('managed-individual-product');
        HistoryNavigator.registerTab({
            'tab-individual-product': this.translate('title')
        })

        let self = this;

        self.on(EVENT_REFRESH, (evt) => {
            evt.preventDefault();
            evt.stopImmediatePropagation();
            const {gtin,batchNumber, serialNumber} = evt.detail;
            const ref = `${gtin}-${batchNumber}-${serialNumber}`;
            if (ref === self.model.individualRef)
                return self.productEl.refresh();
            self.model.individualRef = ref;
        }, {capture: true});

        self.on(EVENT_ACTION, async (evt) => {
            evt.preventDefault();
            evt.stopImmediatePropagation();
            const {individualProduct, newStatus} = evt.detail;
            await self._handleUpdateIndividualProduct.call(self, individualProduct, newStatus);
        });
    }

    _updateStatuses(clazz){
        if (!clazz.getAllowedStatusUpdates)
            throw new Error("Invalid Class provided")
        const obj = this.model.toObject().statuses;
        this.model.statuses = Object.keys(obj).reduce((accum, state) => {
            accum[state].paths = clazz.getAllowedStatusUpdates(state);
            return accum;
        }, obj);
    }

    async _handleUpdateIndividualProduct(individualProduct, newStatus){
        const self = this;
        const oldStatus = IndividualProductStatus.COMMISSIONED;
        individualProduct.status = newStatus;
        const errors = individualProduct.validate(oldStatus);
        if (errors)
            return self.showErrorToast(self.translate(`manage.error.invalid`, errors.join('\n')));

        const alert = await self.showConfirm('manage.confirm', individualProduct.status, newStatus);

        const {role} = await alert.onDidDismiss();

        if (BUTTON_ROLES.CONFIRM !== role)
            return console.log(`Shipment update canceled by clicking ${role}`);

        const loader = self._getLoader(self.translate('manage.loading'));
        await loader.present();

        const sendError = async function(msg){
            await loader.dismiss();
            self.showErrorToast(msg);
        }

        self.individualProductManager.create(individualProduct, async (err, newIndividualProduct) => {
            if (err)
                return sendError(self.translate('manage.error.error'));
            self.showToast(self.translate('manage.success'));
            const {gtin, batchNumber, serialNumber} = newIndividualProduct;
            self.refresh({
                gtin: gtin,
                batchNumber: batchNumber,
                serialNumber: serialNumber
            });
            await loader.dismiss();
        });
    }

    async showConfirm(action = 'create.confirm', ...args){
        return super.showConfirm(this.translate(`${action}.message`, ...args),
            this.translate(`${action}.buttons.ok`),
            this.translate(`${action}.buttons.cancel`));
    }
}