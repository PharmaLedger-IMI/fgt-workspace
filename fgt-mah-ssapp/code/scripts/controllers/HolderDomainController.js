import ContainerController from "../../cardinal/controllers/base-controllers/ContainerController.js";
import constants from "./constants.js";

export default class HolderDomainController extends ContainerController {
    constructor(element, history) {
        super(element, history);

        this.setModel({});
        this.model.domain = "epi";
        this.on('openFeedback', (e) => {
            this.feedbackEmitter = e.detail;
        });

        let userDetails;
        this.DSUStorage.getObject("/user-details.json", (err, _userDetails) =>{
            userDetails = _userDetails;
            console.log("userDetails:", userDetails);
        });

        this.on("generate-identity", (event) => {
            const opendsu = require("opendsu");
            const keyssiSpace = opendsu.loadApi("keyssi");
            const seedSSI = keyssiSpace.buildSeedSSI(this.model.domain);
            seedSSI.initialize(this.model.domain, (err)=>{
                if(err){
                    return this.showError(err, "Could not initialize the holder SSI");
                }
                this.DSUStorage.getObject(constants.HOLDER_FILE_PATH, (err, holder)=>{
                    if(err || typeof holder === "undefined"){
                        holder = {};
                    }

                    holder.domain = this.model.domain;
                    holder.ssi = seedSSI.getIdentifier();
                    holder.userDetails = userDetails;
                    this.DSUStorage.setObject(constants.HOLDER_FILE_PATH, holder, (err)=>{
                        if(err){
                            return this.showError(err);
                        }
                        this.History.navigateToPageByTag("holder");
                    });
                });
            });
        });
    }

    showError(err, title, type) {
        let errMessage;
        title = title ? title : 'Validation Error';
        type = type ? type : 'alert-danger';

        if (err instanceof Error) {
            errMessage = err.message;
        } else if (typeof err === 'object') {
            errMessage = err.toString();
        } else {
            errMessage = err;
        }
        this.feedbackEmitter(errMessage, title, type);
    }
}