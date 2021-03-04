/**
 * @module fgt-dsu-wizard.services
 */
const utils = require('./utils');

/**
 * @param {string} domain: anchoring domain. defaults to 'default'
 * @param {strategy} strategy
 */
function IdService(domain, strategy){
    const strategies = require('./strategy');

    let isSimple = strategies.SIMPLE === (strategy || strategies.SIMPLE);
    domain = domain || "default";

    /**
     * Creates an Actor's Id DSU
     * @param {Actor} actor
     * @param {function} callback
     * @return {Object} keySSI;
     */
    this.create = function(actor, callback){
        if (isSimple){
            createSimple(actor, callback);
        } else {
            throw new Error("Not implemented"); // createAuthorized(order, callback);
        }
    }

    let createSimple = function(actor, callback){
        let keyGenFunction = require('../commands/setIdSSI').createIdSSI;
        let templateKeySSI = keyGenFunction(actor, domain);
        utils.selectMethod(templateKeySSI)(templateKeySSI, (err, dsu) => {
            if (err)
                return callback(err);
            dsu.writeFile('/info', JSON.stringify(actor), (err) => {
                if (err)
                    return callback(err);
                dsu.getKeySSIAsObject((err, keySSI) => {
                    if (err)
                        return callback(err);
                    callback(undefined, keySSI);
                });
            });
        });
    }
}

module.exports = IdService;