
/**
 * @param {string} domain: anchoring domain. defaults to 'default'
 * @param {strategy} strategy
 */
function MAHService(domain, strategy){
    const strategies = require('./strategy');
    const resolver = require('opendsu').loadApi('resolver');

    let isSimple = strategies.SIMPLE === (strategy || strategies.SIMPLE);
    domain = domain || "default";

    /**
     * Creates an order
     * @param {MAH} mah
     * @param {function} callback
     * @return {string} keySSI;
     */
    this.create = function(mah, callback){
        if (isSimple){
            createSimple(mah, callback);
        } else {
            throw new Error("Not implemented"); // createAuthorized(order, callback);
        }
    }

    let createSimple = function(mah, callback){
        let keyGenFunction = require('../commands/setMAHSSI').createMAHSSI;
        let templateKeySSI = keyGenFunction(mah, domain);
        resolver.createDSUForExistingSSI(templateKeySSI, (err, dsu) => {
            if (err)
                return callback(err);
            dsu.writeFile('/', JSON.stringify(mah), (err) => {
                if (err)
                    return callback(err);
                dsu.getKeySSIAsString((err, keySSI) => {
                    if (err)
                        return callback(err);
                    callback(undefined, keySSI);
                });
            });
        });
    }

}