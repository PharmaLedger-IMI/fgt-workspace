import ContainerController from "../../cardinal/controllers/base-controllers/ContainerController.js";

export default class IdController extends ContainerController {
    constructor(element) {
        super(element);
        const LocaleService = require('wizard').Services.LocaleService;
        LocaleService.bindToLocale(this, LocaleService.supported.en_US);
        this.model = this.setModel({
            identified: false,
            actor: undefined
        });
        this.idManager = require('wizard').Managers.getIdManager(this.DSUStorage, "traceability");
        console.log("Id controller initialized");
        element.addEventListener('perform-registration', (event) => {
            event.preventDefault();
            event.stopImmediatePropagation();
            this.closeModal();
            this.register(event.detail, (err) => {
                if (err)
                    console.log("ERROR - Could not register - Should not be possible!");
                this._testId();
            });
        }, true)
        this._testId();
    }

    /**
     * Creates the ID DSU and mounts it to the id_path
     * @param {Actor} actor
     * @param {function} callback
     */
    register(actor, callback){
        let self = this;
        self.idManager.create(actor, (err, keySSI) => {
            if (err)
                return callback(err);
            callback();
        });
    }

    _showRegistrationModal(){
        this.showModal('registration-modal', {});
    }

    _testId(){
        let self = this;
        this.idManager.getId((err, actor) => {
            if (err || !actor) {
                self.model.identified = false;
                self._showRegistrationModal();
            } else {
                self.model.actor = actor;
                self.model.identified = true;
            }
        });
    }
}