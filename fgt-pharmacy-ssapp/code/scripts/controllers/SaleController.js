import { LocalizedController, EVENT_REFRESH, EVENT_ACTION, BUTTON_ROLES } from "../../assets/pdm-web-components/index.esm.js";


export default class SaleController extends LocalizedController {

    initializeModel = () => ({
        identity: {},
        saleRef: '',
        sale: "{}"
    });

    constructor(...args) {
        super(false, ...args);
        let self = this;
        super.bindLocale(self, `sale`);
        self.model = self.initializeModel();

        const wizard = require('wizard');

        const participantManager = wizard.Managers.getParticipantManager();
        self.saleManager = wizard.Managers.getSaleManager(participantManager);
        self.saleManager.bindController(self);
        self.saleEl = self.querySelector('managed-sale');

        self.saleEl.updateDirectory();

        self.on(EVENT_REFRESH, (evt) => {
            evt.preventDefault();
            evt.stopImmediatePropagation();
            self.model.identity = self.saleManager.getIdentity();

            const state = evt.detail;
            if (state){
                console.log(`todo`)
            }
            self.saleEl.refresh();
        });

        self.on(EVENT_ACTION, async (evt) => {
            evt.preventDefault();
            evt.stopImmediatePropagation();
            const {action} = evt.detail;
            if (action === 'create')
                await self._handleIssueSale(evt.detail.sale);
        });

        console.log("SaleController initialized");
    }

    /**
     * Sends an event named create-issued-order to the IssuedOrders controller.
     */
    async _handleIssueSale(sale) {
        let self = this;
        sale.id = sale.id || Date.now();
        sale.sellerId = self.saleManager.getIdentity().id;
        if (sale.validate())
            return this.showErrorToast(this.translate(`create.error.invalid`));

        const alert = await self.showConfirm('create.confirm');

        const {role} = await alert.onDidDismiss();

        if (BUTTON_ROLES.CONFIRM !== role)
            return console.log(`Sale canceled by clicking ${role}`);

        const loader = self._getLoader(self.translate('create.loading'));
        await loader.present()

        const sendError = async function(msg){
            await loader.dismiss();
            self.showErrorToast(msg);
        }

        self.saleManager.create(sale, async (err, keySSI, dbPath) => {
            if (err)
                return sendError(self.translate('create.error.error'));
            self.showToast(self.translate('create.success'));
            self.model.saleRef = sale.id;
            await loader.dismiss();
        });
    }

    async showConfirm(action = 'create.confirm', ...args){
        return super.showConfirm(this.translate(`${action}.message`, ...args),
            this.translate(`${action}.buttons.ok`),
            this.translate(`${action}.buttons.cancel`));
    }
}