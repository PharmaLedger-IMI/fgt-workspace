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
        let bindedFunc = this.__updateId.bind(this);
        this.__testId(bindedFunc);
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

    __updateId(err, actorId){
        if (err) {
            this.model = this.setModel({
                identified: false,
                reason: "invalid"
            });
            return;
        }
        this.model = this.setModel({
            identified: true,
            actor: actorId
        });
    }

    __testId(callback){
        this.DSUStorage.getObject(id_path, (err, actorId) => {
            if (err || !actorId)
                return callback("No actorId found");
            callback(undefined, actorId);
        });
    }
}