const Actor = require('./Actor');

class Wholesaler extends Actor{
    originAddress = "";
    deliveryAddress = "";

    constructor(wholesaler) {
        super();
        if (typeof wholesaler !== undefined)
            for (let prop in wholesaler)
                if (wholesaler.hasOwnProperty(prop))
                    this[prop] = wholesaler[prop];
    }
}

module.exports = Wholesaler;