import ContainerController from "../../cardinal/controllers/base-controllers/ContainerController.js";

const wizard = require('wizard');
const IdService = wizard.Services.IdService;
const LocaleService = wizard.Services.LocaleService;

const id_path = "/actorId";

export default class IdController extends ContainerController {
    constructor(element) {
        super(element);
        this.locale = LocaleService.getInstance(LocaleService.supported.en_US, this);
        this.model = this.setModel({
            identified: false,
            reason: "pending",
        });
        this.idService = new IdService('traceability');
        console.log("Id controller initialized");
        element.addEventListener('registerActor', (event) => {
            event.preventDefault();
            event.stopImmediatePropagation();
            console.log(event);
            this.closeModal()
        }, true)

        this.__testId();
    }

    /**
     * Creates the ID DSU and mounts it to the id_path
     * @param {Actor} actor
     * @param {function} callback
     */
    register(actor, callback){
        this.__testId((err, actorId) => {
            if (!err)
                return callback("Registration already exists");
            this.idService.create(actor, (err, keySSI) => {
                if (err)
                    return callback(err);
                console.log(`Id DSU created with ssi: ${keySSI.getIdentifier(true)}`);
                this.DSUStorage.call('mount', id_path, keySSI.derive(), (err) => {
                    if (err)
                        return callback(err);
                    console.log(`Id DSU mounted in ${id_path}`);
                    callback();
                });
            });
        });
    }

    __showRegistrationModal(){
        let self = this;
        this.showModal('registration-modal', {}, (err, result) => {
            if (err)
                throw err;
            console.log("return", result);
            this.register(result, (err) => {
                if (err) {
                    console.log("Could not register...");
                    return;
                }
                self.__testId();
            });
        });
    }

    __testId(){
        let self = this;
        this.DSUStorage.getObject(id_path, (err, actorId) => {
            if (err || !actorId) {
                self.model = self.setModel({
                    identified: false,
                    reason: "invalid"
                });
                self.__showRegistrationModal();
            } else {
                self.model = self.setModel({
                    identified: true,
                    actor: actorId
                });
            }
        });
    }
}