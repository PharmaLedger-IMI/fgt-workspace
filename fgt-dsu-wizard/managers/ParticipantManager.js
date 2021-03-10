/**
 * @module fgt-mah-ssapp.managers
 */


const Order = require('../model/Order');
const OrderStatus = require('../model/OrderStatus');
const Manager = require('./Manager');
const PARTICIPANT_MOUNT_PATH = "/participant";

/**
 * Participant Manager Class
 *
 * Manager Classes in this context should do the bridge between the controllers
 * and the services exposing only the necessary api to the controllers while encapsulating <strong>all</strong> business logic.
 *
 * All Manager Classes should be singletons.
 *
 * This complete separation of concerts is very beneficial for 2 reasons:
 * <ul>
 *     <li>Allows for testing since there's no browser dependent code (i think) since the DSUStorage can be 'mocked'</li>
 *     <li>Allows for different controllers access different business logic when necessary (while benefiting from the singleton behaviour)</li>
 * </ul>
 *
 * Should eventually integrate with the WP3 decisions
 *
 * @param {DSUStorage} dsuStorage the controllers dsu storage
 * @param {string} domain the anchoring domain
 */
class ParticipantManager{
    constructor(dsuStorage, domain) {
        this.DSUStorage = dsuStorage;
        this.ParticipantService = new (require('wizard').Services.ParticipantService)(domain);
    }

    /**
     * Creates a {@link Participant} dsu
     * @param {Participant} participant
     * @param {function(err, keySSI, string)} callback where the string is the mount path
     */
    create(participant, callback) {
        this.DSUStorage.enableDirectAccess(() => {
            this.ParticipantService.create(participant, (err, keySSI) => {
                if (err)
                    return callback(err);
                console.log(`Participant DSU created with ssi: ${keySSI.getIdentifier(true)}`);
                this.DSUStorage.mount(PARTICIPANT_MOUNT_PATH, keySSI.getIdentifier(), (err) => {
                    if (err)
                        return callback(err);
                    console.log(`Participant ${participant.id} created and mounted at '${PARTICIPANT_MOUNT_PATH}'`);
                    this._getParticipantSSI((err, mainSSI) => {
                        if (err)
                            console.log(err);
                        else
                            console.log("THIS IS THE MAIN SSI " + mainSSI);
                        callback(undefined, keySSI, PARTICIPANT_MOUNT_PATH);
                    });
                });
            });
        });
    }

    _getParticipantSSI(callback){
        this.DSUStorage.listMountedDossiers(PARTICIPANT_MOUNT_PATH, (err, mounts) =>{
           if (err)
               return callback(err);
           if (!mounts)
               return callback("no mounts found!");
           console.log(mounts);
           callback(mounts[0].identifier);
        });
    }

    /**
     * reads the participant information (if exists)
     * @param {function(err, PARTICIPANT_MOUNT_PATH)} callback
     */
    getParticipant(callback){
        this.DSUStorage.getObject(`${PARTICIPANT_MOUNT_PATH}/info`, (err, participant) => {
            if (err)
                return callback(err);
            callback(undefined, participant);
        });
    }

    /**
     * Removes the PARTICIPANT_MOUNT_PATH DSU (does not delete/invalidate DSU, simply 'forgets' the reference)
     * @param {function(err)} callback
     */
    removeParticipant(callback) {
        this.DSUStorage.enableDirectAccess(() => {
            this.DSUStorage.unmount(PARTICIPANT_MOUNT_PATH, (err) => {
                if (err)
                    return callback(err);
                console.log(`Participant removed from mount point ${PARTICIPANT_MOUNT_PATH}`);
                callback();
            });
        });
    }

    /**
     * Edits/Overwrites the Participant details
     * @param {Participant} participant
     * @param {function(err)} callback
     */
    editParticipant(participant, callback) {
        this.DSUStorage.enableDirectAccess(() => {
            this.DSUStorage.writeFile(`${PARTICIPANT_MOUNT_PATH}/info`, JSON.stringify(participant), (err) => {
                if (err)
                    return callback(err);
                console.log(`Participant updated`);
                callback();
            });
        });
    }

    /**
     * Fetches the orders of this Participant
     * @param {Participant} participant
     * @param {function(err,orders)} callback
     */
    getOrders(participant, callback) {
        // TODO fetch this from the DSU ?
        let order1 = new Order("ORDER001", "ReqID-TPPH0124", "SendID-TPPH4822", "ShipToAddress1", OrderStatus.CREATED, []);
        callback(undefined, [order1]);
    }
}

let participantManager;

/**
 * @param {DSUStorage} dsuStorage
 * @param {string} domain
 * @returns {ParticipantManager}
 */
const getParticipantManager = function (dsuStorage, domain) {
    if (!participantManager) {
        if (!dsuStorage)
            throw new Error("No DSUStorage provided");
        participantManager = new ParticipantManager(dsuStorage, domain);
    }
    return participantManager;
}

module.exports = getParticipantManager;