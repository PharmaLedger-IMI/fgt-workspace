import ContainerController from "../../cardinal/controllers/base-controllers/ContainerController.js";
import SharedStorage from '../services/SharedDBStorageService.js';
import constants from "../constants.js";
import utils from "../utils.js";

export default class batchesController extends ContainerController {
    constructor(element, history) {
        super(element, history);
        this.setModel({});
        this.storageService = new SharedStorage(this.DSUStorage);

        this.storageService.getArray(constants.BATCHES_STORAGE_TABLE, (err, batches) =>{
            batches.forEach((batch)=>{
                batch.code = this.generateSerializationForBatch(batch);
                let wrongBatch = JSON.parse(JSON.stringify(batch));
                wrongBatch.defaultSerialNumber = "WRONG";
                batch.wrongCode = this.generateSerializationForBatch(wrongBatch);
            });
            this.model.batches = batches;
        });

        this.on("add-batch", () => {
            this.History.navigateToPageByTag("add-batch");
        });
    }

    generateSerializationForBatch(batch) {
        return `(01)${batch.gtin}(21)${batch.defaultSerialNumber}(10)${batch.batchNumber}(17)${batch.expiry}`;
    }
}
