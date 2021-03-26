/**
 * @module fgt-dsu-wizard.services
 */
 const {INBOX_MOUNT_PATH, INFO_PATH, PUBLIC_ID_MOUNT_PATH} = require('../constants');
const utils = require('../../pdm-dsu-toolkit/services/utils');

/**
 * @param {string} domain: anchoring domain. defaults to 'default'
 * @param {strategy} strategy
 */
function ParticipantService(domain, strategy){
    const strategies = require("../../pdm-dsu-toolkit/services/strategy");
    const inboxService = new (require('./InboxService'))(domain, strategy);

    let isSimple = strategies.SIMPLE === (strategy || strategies.SIMPLE);
    domain = domain || "default";

    /**
     * Creates an Participant's DSU, including the const and MQ.
     * @param {Participant} participant
     * @param {object} [inbox] - optional initial inbox contents.
     * @param {function(err, participantKeySSI)} callback
     */
    this.create = function(participant, inbox, callback){
        if (!inbox)
            inbox = {};
        if (!callback) {
            callback = inbox;
            inbox = {};
        }
        if (typeof callback != "function")
            throw new Error("callback must be a function!");
        if (isSimple){
            createSimple(participant, inbox, callback);
        } else {
            throw new Error("Not implemented"); // createAuthorized(order, callback);
        }
    }

    let createSimple = function (participant, inbox, callback) {
        inboxService.create(inbox, (err, inboxSSI) => {
            if (err)
                return err;
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
                participantConstDsu.getKeySSIAsObject((err, participantConstKeySSI) => {
                    if (err)
                        return callback(err);
                    console.log("participantConstKeySSI ", participantConstKeySSI.getIdentifier());
                    participantConstDsu.writeFile(INFO_PATH, JSON.stringify({ id: participant.id }), (err) => {
                        if (err)
                            return callback(err);
                        participantConstDsu.mount(INBOX_MOUNT_PATH, inboxSSI.getIdentifier(), (err) => {
                            if (err)
                                return callback(err);
                            console.log(`Inbox ${inboxSSI.getIdentifier()} mounted at ${INBOX_MOUNT_PATH}`);
                            utils.selectMethod(participantTemplateKeySSI)(participantTemplateKeySSI, (err, participantDsu) => {
                                if (err)
                                    return callback(err);
                                participantDsu.writeFile(INFO_PATH, JSON.stringify(participant), (err) => {
                                    if (err)
                                        return callback(err);
                                    participantDsu.getKeySSIAsObject((err, participantKeySSI) => {
                                        if (err)
                                            return callback(err);
                                        participantDsu.mount(PUBLIC_ID_MOUNT_PATH, participantConstKeySSI.getIdentifier(), (err) => {
                                            if (err)
                                                return callback(err);
                                            callback(undefined, participantKeySSI);
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    };

    /**
     * Locate the const DSU of a participant, given the id.
     * @param {string} id - a Participant.id
     * @param {function(err, participantConstDsu)} callback
     */
    this.locateConstDSU = function(id, callback) {
        const opendsu = require("opendsu");
        const resolver = opendsu.loadApi("resolver");
        const participantConstKeyGenFunction = require('../commands/setParticipantConstSSI').createParticipantConstSSI;
        const participantConstKeySSI = participantConstKeyGenFunction({id: id}, domain);
        resolver.loadDSU(participantConstKeySSI, (err, participantConstDsu) => {
            if (err)
                return callback(err);
            callback(undefined, participantConstDsu);
        });
    };

};

module.exports = ParticipantService;