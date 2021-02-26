const Actor = require('./Actor');

class Wholesaler extends Actor{
    originAddress = "";
    deliveryAddress = "";

    constructor(wholesaler) {
        super(wholesaler);
        this._copyProps(wholesaler);
    }
}

module.exports = Wholesaler;