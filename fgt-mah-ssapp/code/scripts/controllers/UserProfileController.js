import ContainerController from "../../cardinal/controllers/base-controllers/ContainerController.js";
import { getWalletTemplateServiceInstance } from "../services/WalletTemplateService.js";

const APPS_FOLDER = "/apps";

export default class UserProfileController extends ContainerController {
    constructor(element, history) {
        super(element, history);

        this.model = this.setModel({});
        this.walletTemplateService = getWalletTemplateServiceInstance();
        this.walletTemplateService.getUserDetails((err, userDetails) => {
            if (err) {
                return console.error(err);
            }
            userDetails.avatar = "assets/images/user.png";
            userDetails.email = userDetails.company;
            this.model.setChainValue("userDetails", userDetails);
        });

        let globalContainer = element.parentElement.parentElement;
        let appRoot = globalContainer.parentElement;

        const mobileCallback = () => {
            if (appRoot.classList.contains('is-mobile')) {
                this.model.renderer = 'mobile-profile-renderer';
                globalContainer.classList.add('is-mobile');
            } else {
                this.model.renderer = 'psk-user-profile-renderer';
                globalContainer.classList.remove('is-mobile');
            }
        }

        mobileCallback();
        window.addEventListener('resize', mobileCallback);
    }
}