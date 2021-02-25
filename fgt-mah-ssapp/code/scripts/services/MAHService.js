function MAHService(domain, strategy){
    const strategies = require('./strategy');
    const resolver = require('opendsu').loadApi('resolver');
    const model = require('../model');

    let isSimple = strategies.SIMPLE === (strategy || strategies.SIMPLE);

    /**
     * Creates an order
     * @param {Order} order
     * @param {function} callback
     * @return {string} keySSI;
     */
    this.create = function(order, callback){
        if (isSimple){
            createSimple(order, callback);
        } else {
            throw new Error("Not implemented"); // createAuthorized(order, callback);
        }
    }

    let createSimple = function(mah, callback){
        let keyGenFunction = require('../commands/setOrderSSI').createOrderSSI;
        let keySSI = keyGenFunction(order, domain);
        resolver.createDSUForExistingSSI(keySSI, (err, dsu) => {
            if (err)
                return callback(err);
            dsu.writeFile('/data', JSON.stringify(order), (err) => {
                if (err)
                    return callback(err);
                createOrderLines(order, (err, orderLines) => {
                    if (err)
                        return callback(err);
                    dsu.writeFile('/lines', JSON.stringify(orderLines.map(o => o.getIdentifier(true))), (err) => {
                        if (err)
                            return callback(err);
                        callback(undefined, keySSI);
                    });
                });
            });
        });
    }

}