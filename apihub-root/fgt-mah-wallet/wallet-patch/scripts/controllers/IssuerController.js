import ContainerController from "../../cardinal/controllers/base-controllers/ContainerController.js";
import constants from "./constants.js";
import {copyToClipboard} from "../helpers/document-utils.js";

export default class IssuerController extends ContainerController {
    constructor(element, history) {
        super(element, history);

        this.setModel({displayCredential: false});
        this.model.domain = "epi";

        this.DSUStorage.getObject(constants.ISSUER_FILE_PATH, (err, issuer) => {
            if (err || typeof issuer === "undefined") {
                return this.History.navigateToPageByTag("issuer-enter-domain");
            }

            this.model.issuer = issuer;
            const keyssi = require("opendsu").loadApi("keyssi");
            let seedSSI = keyssi.parse(issuer.ssi);
            this.model.issuerPublicIdentity = seedSSI.derive().getIdentifier(true);
            this.model.title = `Copy/paste the identifier of a new user in domain [${issuer.domain}]`;
        });

        this.on('openFeedback', (e) => {
            this.feedbackEmitter = e.detail;
        });

        this.on("generate-credential", (event) => {
            const opendsu = require("opendsu");
            const crypto = opendsu.loadApi("crypto");
            const keyssi = opendsu.loadApi("keyssi");

            let userIdentity = this.model.userIdentity;
            let userSSI = keyssi.parse(userIdentity);
            userIdentity = userSSI.derive ? userSSI.derive().getIdentifier() : userSSI.getIdentifier();

            crypto.createCredential(this.model.issuer.ssi, userIdentity, (err, credential) => {
                if (err) {
                    return this.showError(err, "Failed to create credential.");
                }
                this.model.credential = credential;
                this.model.displayCredential = true;
            });

        }, {capture: true});

        this.on('copy-text', (e) => {
            copyToClipboard(e.data);
        });
    }
}