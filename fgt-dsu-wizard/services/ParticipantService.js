/**
 * @module fgt-dsu-wizard.services
 */
 const {INFO_PATH, PUBLIC_ID_MOUNT_PATH} = require('../constants');
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
     * Creates an Participant's DSU, including the const and MQ.
     * @param {Participant} participant
     * @param {function(err, participantKeySSI)} callback
     */
    this.create = function(participant, callback){
        if (isSimple){
            createSimple(participant, callback);
        } else {
            throw new Error("Not implemented"); // createAuthorized(order, callback);
        }
    }

    let createSimple = function(participant, callback){
        let participantKeyGenFunction = require('../commands/setParticipantSSI').createParticipantSSI;
        let participantConstKeyGenFunction = require('../commands/setParticipantConstSSI').createParticipantConstSSI;
        let participantTemplateKeySSI = participantKeyGenFunction(participant, domain);
        let participantConstTemplateKeySSI = participantConstKeyGenFunction(participant, domain);
        // Test of the const already exists for the given participant.id.
        // Commented out because error messages are not very good!
        // Let it fail on creating a dup const.
        //
        // TODO better error message for duplicate id ?
        //
        //const openDSU = require('opendsu');
        //const resolver = openDSU.loadApi("resolver");
        //resolver.loadDSU(participantConstTemplateKeySSI, undefined, (err, participantConstDsu) => {
        //    console.log("loadDSU error", err);
        //    if (!err) {
        //        callback("There is already a ParticipantConst DSU id=" + participant.id);
        //    }
        //
        // Create the const first. As it is non-transactional, if it fails, stop right away.
        utils.selectMethod(participantConstTemplateKeySSI)(participantConstTemplateKeySSI, (err, participantConstDsu) => {
            if (err)
                return callback(err);
            participantConstDsu.writeFile(INFO_PATH, JSON.stringify({ id: participant.id }), (err) => {
                if (err)
                    return callback(err);
                utils.selectMethod(participantTemplateKeySSI)(participantTemplateKeySSI, (err, participantDsu) => {
                    if (err)
                        return callback(err);
                    participantDsu.writeFile(INFO_PATH, JSON.stringify(participant), (err) => {
                        if (err)
                            return callback(err);
                        participantDsu.getKeySSIAsObject((err, participantKeySSI) => {
                            if (err)
                                return callback(err);
                            participantDsu.mount(PUBLIC_ID_MOUNT_PATH, participantKeySSI.getIdentifier(), (err) => {
                                if (err)
                                    return callback(err);
                                callback(undefined, participantKeySSI);
                            });
                        });
                    });
                });
            });
        });
    }
}

module.exports = ParticipantService;