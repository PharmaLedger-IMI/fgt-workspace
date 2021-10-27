import {LocalizedController, HistoryNavigator, EVENT_REFRESH, EVENT_ACTION, BUTTON_ROLES} from "../../assets/pdm-web-components/index.esm.js";

/**
 * Controls Application Flow
 * Makes the bridge between the UI and the BatchManager
 *
 * Handles data input and validation for the manipulation of Batches
 * @class BatchController
 * @module controllers
 */
export default class BatchController extends LocalizedController {

    initializeModel = () => ({
        gtinBatch: undefined
    });

    constructor(...args) {
        super(false, ...args)
        let self = this;
        super.bindLocale(self, `batch`, false);
        self.model = self.initializeModel();
        const wizard = require('wizard');
        const {Batch, BatchStatus} = wizard.Model;
        self._updateStatuses(Batch);

        const participantManager = wizard.Managers.getParticipantManager();
        this.batchManager = wizard.Managers.getBatchManager(participantManager);
        this.productmanager = wizard.Managers.getProductManager(participantManager);
        this.batchEl = this.element.querySelector('managed-batch');
        HistoryNavigator.registerTab({
            'tab-batch': this.translate('title')
        })

        self.on(EVENT_REFRESH, (evt) => {
            evt.preventDefault();
            evt.stopImmediatePropagation();
            const state = evt.detail;
            const label = !!state.previousTab ? state.previousTab.label : HistoryNavigator.getPreviousTab().label;
            self.model.back = this.translate('back', label);
            if (state && state.gtin){
                const gtinRef = state.gtin + (state.batchNumber ? `-${state.batchNumber}` : '');
                if (self.model.gtinBatch === gtinRef)
                    return self.batchEl.refresh();
                self.model.gtinBatch = gtinRef;
            } else {
                if (self.model.gtinBatch !== "")
                    self.model.gtinBatch = "";
            }
        }, {capture: true});

        self.on(EVENT_ACTION, async (evt) => {
            evt.preventDefault();
            evt.stopImmediatePropagation();
            const {action, props} = evt.detail;
            switch(action){
                case BatchStatus.COMMISSIONED:
                    return self._handleCreateBatch.call(self, props);
                default:
                    const {newStatus, batch, popupOptions } = props;
                    const gtin = this.model.gtinBatch.split('-')[0];
                    return await self._handleUpdateBatchStatus.call(self, gtin, batch, newStatus, popupOptions);
            }
        });

        console.log("BatchController initialized");
    }

    _getGtinFromRef(){
        if (!this.model.gtinBatch)
            throw new Error(`No gtin present. Should not happen`);
        return this.model.gtinBatch.split('-')[0];
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

    async _handleUpdateBatchStatus(gtin, batch, newStatus, popupOptions){
        const self = this;

        const oldStatus = batch.batchStatus.status;
        batch.batchStatus.status = newStatus;
        const errors = batch.validate(oldStatus);
        if (errors)
            return self.showErrorToast(self.translate(`manage.error.invalid`, errors.join('\n')));

        const popupCallback = (evt) => batch.batchStatus.extraInfo = evt.extraInfo;
        const alert = await self.showPopup('manage.confirm', popupOptions, popupCallback, oldStatus, newStatus);

        const {role} = await alert.onDidDismiss();

        if (BUTTON_ROLES.CONFIRM !== role)
            return console.log(`Batch update canceled by clicking ${role}`);

        const loader = self._getLoader(self.translate('manage.loading'));
        await loader.present();

        const sendError = async function(msg){
            await loader.dismiss();
            self.showErrorToast(msg);
        }

        self.batchManager.update(gtin, batch, async (err, updatedBatch) => {
            if (err)
                return sendError(self.translate('manage.error.error'));
            self.showToast(self.translate('manage.success'));
            self.batchEl.refresh()
            await loader.dismiss();
        });
    }

    /**
     * Sends an event named create-issued-order to the IssuedOrders controller.
     */
    async _handleCreateBatch(batch) {
        let self = this;
        if (batch.validate())
            return this.showErrorToast(this.translate(`error.invalid`));

        const alert = await self.showConfirm('create.confirm');

        const {role} = await alert.onDidDismiss();

        if (BUTTON_ROLES.CONFIRM !== role)
            return console.log(`Order creation canceled by clicking ${role}`);

        const loader = self._getLoader(self.translate('create.loading'));
        await loader.present()

        const sendError = async function(msg){
            await loader.dismiss();
            self.showErrorToast(msg);
        }

        const gtin = this._getGtinFromRef();

        self.productmanager.getOne(gtin, (err, product) => {
            if (err)
                return sendError(this.translate(`error.bind`));
            self.batchManager.create(product, batch, async (err, keySSI, dbPath) => {
                if (err)
                    return sendError(self.translate('error.error'), err);
                self.showToast(self.translate('create.success'));
                self.model.gtinBatch = `${self.model.gtinBatch}-${batch.batchNumber}`;
                await loader.dismiss();
            });
        });
    }

    async showConfirm(action = 'create.confirm'){
        return super.showConfirm(this.translate(`${action}.message`),
            this.translate(`${action}.buttons.ok`),
            this.translate(`${action}.buttons.cancel`));
    }

    async showPopup(message = 'create.confirm', popupOptions, callback, ...args){
        return super.showPopup({
            message: this.translate(`${message}.message`, ...args),
            confirmButtonLabel: this.translate(`${message}.buttons.ok`),
            cancelButtonLabel: this.translate(`${message}.buttons.cancel`),
            options: popupOptions
        }, callback);
    }
}