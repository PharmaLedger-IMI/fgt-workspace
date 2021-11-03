
class SimpleShipment {
    requesterId;
    senderId;
    status;
    shipmentLines;


    constructor(simpleShipment){
        if (typeof simpleShipment !== undefined)
            for (let prop in simpleShipment)
                if (simpleShipment.hasOwnProperty(prop))
                    this[prop] = simpleShipment[prop];
    }


}