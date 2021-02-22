import constants from "../controllers/constants"

class SharedUserSpace {
    constructor() {
        this.init();
    }

    init(){
        this.SeedSSIForSharedDSU = undefined;
    }

    getReadOnlySSI(){
        return this.SeedSSIForSharedDSU.derive();
    }

    addUser(userName, sReadSSI){

    }

}

let getCertificateForSharingWithHolder = function () {
    return new SharedUserSpace();
};


let getSharedUserSpace = function () {
    return new SharedUserSpace();
};

export { getSharedUserSpace };
