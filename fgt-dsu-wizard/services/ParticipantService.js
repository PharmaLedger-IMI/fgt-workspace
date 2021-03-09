/**
 * @module fgt-dsu-wizard.services
 */
const utils = require('./utils');

/**
 * @param {string} domain: anchoring domain. defaults to 'default'
 * @param {strategy} strategy
 */
function ParticipantService(domain, strategy){
    const strategies = require('./strategy');

    let isSimple = strategies.SIMPLE === (strategy || strategies.SIMPLE);
    domain = domain || "default";

    /**
     * Creates an Participant's DSU
     * @param {Participant} participant
     * @param {function} callback
     * @return {Object} keySSI;
     */
    this.create = function(participant, callback){
        if (isSimple){
            createSimple(participant, callback);
        } else {
            throw new Error("Not implemented"); // createAuthorized(order, callback);
        }
    }

    let createSimple = function(participant, callback){
        let keyGenFunction = require('../commands/setParticipantSSI').createParticipantSSI;
        let templateKeySSI = keyGenFunction(participant, domain);
        utils.selectMethod(templateKeySSI)(templateKeySSI, (err, dsu) => {
            if (err)
                return callback(err);
            dsu.writeFile('/info', JSON.stringify(participant), (err) => {
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

module.exports = ParticipantService;