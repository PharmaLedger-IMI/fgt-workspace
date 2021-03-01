import ContainerController from "../../cardinal/controllers/base-controllers/ContainerController.js";

const wizard = require('wizard');
const IdService = wizard.Services.IdService;
const LocaleService = wizard.Services.LocaleService;

export default class IdController extends ContainerController {
    constructor(element) {
        super(element);
        this.self = this;
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
        this.DSUStorage.getObject('/actorId', (err, actorId) => {
            if (err || !actorId)
                return callback("No actorId found");
            callback(undefined, actorId);
        });
    }
}