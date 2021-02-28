import ContainerController from "../../cardinal/controllers/base-controllers/ContainerController.js";
console.log(ContainerController);

import {IdService} from '../services/IdService.js';

export default class IdController extends ContainerController {
    constructor(element) {
        super(element);
        this.model = this.setModel({
            identified: true,
            reason: "pending",
        });
        this.idService = new IdService('traceability');
        console.log("Id controller initialized");
        this.__testId(this.__updateId);
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
            if (err)
                return callback(err);
            callback(undefined, actorId);
        });
    }
}