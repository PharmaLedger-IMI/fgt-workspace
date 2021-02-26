const Actor = require('./Actor');

class Pharmacy extends Actor{
    deliveryAddress = "";

    constructor(pharmacy) {
        super(pharmacy);

        this._copyProps(pharmacy);
    }

}

module.exports = Pharmacy;