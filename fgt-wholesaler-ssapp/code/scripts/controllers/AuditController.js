import ContainerController from "../../cardinal/controllers/base-controllers/ContainerController.js";
import LogService from "../services/LogService.js";

export default class AuditController extends ContainerController {
    constructor(element, history) {
        super(element, history);

        this.setModel({});
        this.logService = new LogService(this.DSUStorage);

        this.model.addExpression('logListLoaded', () => {
            return typeof this.model.logs !== "undefined";
        }, 'logs');

        this.model.addExpression('listHeader', () => {
            return typeof this.model.logs !== "undefined" && this.model.logs.length > 0;
        }, 'logs');

        this.on("show-keySSI", (event) => {
            this.showModal('viewKeySSIModal', {logData: event.data}, () => {});
        });

        this.logService.getLogs((err, logs) => {

            function unknownLog(item){
                let le = {
                    action:item.action,
                    username:item.username,
                    creationTime:item.creationTime,
                    allInfo: {
                        keySSI:item.keySSI,
                        all:JSON.stringify(item),
                        }
                    };
                return le;
            };

            function productLog(item){
                let le = {
                    action:`${item.action} ${item.logInfo.name} [${item.logInfo.gtin}] `,
                    username:item.username,
                    creationTime:item.logInfo.creationTime,
                    keySSI:item.logInfo.keySSI,
                    allInfo: {
                        keySSI:item.keySSI,
                        all:JSON.stringify(item),
                    }
                };
                return le;
            };

            function batchLog(item){
                let le = {
                    action:`${item.action} ${item.logInfo.batchNumber} [${item.logInfo.gtin}] version ${item.logInfo.version}`,
                    username:item.username,
                    creationTime:item.logInfo.creationTime,
                    keySSI:item.logInfo.keySSI,
                    allInfo: {
                        keySSI:item.keySSI,
                        all:JSON.stringify(item),
                    }
                };
                return le;
            };

            if (typeof logs === "undefined" || logs === null) {
                logs = [];
            }
            this.model.logs = logs.map( item => {
                console.log("Log item", item);
                try{
                    switch(item.logType){
                        case "PRODUCT_LOG": return productLog(item); break;
                        case "BATCH_LOG": return batchLog(item); break;
                        default: return unknownLog(item);
                    }
                } catch(err){
                    return unknownLog(item);
                }
            });
        })
    }
}