/**
 * @module fgt-mah-ssapp.managers
 */
const Order = require('../model/Order');
const OrderStatus = require('../model/OrderStatus');
const {INBOX_RECEIVED_ORDERS_PROP, INBOX_RECEIVED_SHIPMENTS_PROP, INFO_PATH, PARTICIPANT_MOUNT_PATH, INBOX_MOUNT_PATH} = require('../constants');

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
        this.inboxService = new (require('../services').InboxService)(domain);
        this.participantService = new (require('../services').ParticipantService)(domain);
        this.resolver = undefined;
        this.participantDSU = undefined;
    };

    getParticipantDSU(){
        if (!this.participantDSU)
            throw new Error("ParticipantDSU not cached");
        return this.participantDSU;
    };

    /**
     * Creates a {@link Participant} dsu
     * @param {Participant} participant
     * @param {object} [inbox] - optional initial inbox contents.
     * @param {function(err, keySSI, string)} callback where the string is the mount path
     */
    create(participant, inbox, callback) {
        let self = this;
        if (!inbox)
            inbox = {};
        if (!callback) {
            callback = inbox;
            inbox = {};
        }
        if (typeof callback != "function")
            throw new Error("callback must be a function!");
        self.DSUStorage.enableDirectAccess(() => {
            self.participantService.create(participant, inbox, (err, keySSI) => {
                if (err)
                    return callback(err);
                console.log(`Participant DSU created with ssi: ${keySSI.getIdentifier(true)}`);
                self.DSUStorage.mount(PARTICIPANT_MOUNT_PATH, keySSI.getIdentifier(), (err) => {
                    if (err)
                        return callback(err);
                    console.log(`Participant ${participant.id} created and mounted at '${PARTICIPANT_MOUNT_PATH}'`);
                    self._cacheParticipantDSU((err) => {
                        if (err)
                            return callback(err);
                        callback(undefined, keySSI, PARTICIPANT_MOUNT_PATH);
                    });
                });
            });
        });
    };

    /**
     * Creates an Order DSU and mounts it under issuedOrders/order.id
     * @param {OrderManager} orderManager 
     * @param {Order} order
     * @param {function(err, keySSI, mountPath)} callback
     */
    createIssuedOrder(orderManager, order, callback) {
        let self = this;
        self.locateConstWithInbox(order.senderId, INBOX_RECEIVED_ORDERS_PROP, (err, senderParticipantConstDSU) => {
            if (err)
                callback(err); 
            orderManager.create(order, (err, keySSI, mountPath) => {
                if (err)
                    return callback(err);
                const sReadSSI = keySSI.derive();
                // order.requesterId is me. order.senderId is the supplier.
                self.inboxAppend(senderParticipantConstDSU, INBOX_RECEIVED_ORDERS_PROP, sReadSSI.getIdentifier(true), (err) => {
                    if (err)
                        callback(err); // TODO rollback order creation ??
                    callback(undefined, keySSI, mountPath);
                });
            });
        });
    };

    _cacheParticipantDSU(callback){
        if (this.participantDSU)
            return callback();
        let self = this;
        self.DSUStorage.enableDirectAccess(() => {
            self.DSUStorage.listMountedDSUs('/', (err, mounts) => {
                if (err)
                    return callback(err);
                if (!mounts)
                    return callback("no mounts found!");
                self._matchParticipantDSU(mounts, (err, dsu) => {
                    if (err)
                        return callback(err);
                    self.participantDSU = dsu;
                    callback();
                });
            });
        });
    };

    _matchParticipantDSU(mounts, callback){
        // m.path has "participant". PARTICIPANT_MOUNT_PATH has "/participant".
        let mount = mounts.filter(m => m.path === PARTICIPANT_MOUNT_PATH.substr(1));
        if (!mount || mount.length !== 1)
            return callback("No participant mount found");
        this._loadDSU(mount[0].identifier, (err, dsu) => {
            if (err)
                return callback(err);
            console.log(`Participant DSU Successfully cached: ${mount[0].identifier}`);
            callback(undefined, dsu);
        });
    };

    _loadDSU(keySSI, callback){
        if (!this.resolver)
            this.resolver = require('opendsu').loadApi('resolver');
        this.resolver.loadDSU(keySSI, callback);
    };

    /**
     * reads the participant information (if exists)
     * @param {function(err, PARTICIPANT_MOUNT_PATH)} callback
     */
    getParticipant(callback){
        let self = this;
        self._cacheParticipantDSU((err) => {
            if (err)
                return callback(err);
            self.DSUStorage.getObject(`${PARTICIPANT_MOUNT_PATH}${INFO_PATH}`, (err, participant) => {
                if (err)
                    return callback(err);
                callback(undefined, participant);
            });
        });
    };

    /**
     * Append a message to the otherParticipantConstDSU.inbox.inboxPropName.
     * @param {Archive} otherParticipantConstDSU 
     * @param {string} inboxPropName 
     * @param {object} message 
     * @param {function(err)} callback
     */
    inboxAppend(otherParticipantConstDSU, inboxPropName, message, callback) {
        let self = this;
        let inboxPropPathName = self.inboxService.getPathFromProp(inboxPropName);
        if (!inboxPropPathName) 
            return callback("There is no property Inbox."+inboxPropName);
        let otherInboxPropPath = INBOX_MOUNT_PATH.substring(1)+inboxPropPathName;
        //otherParticipantConstDSU.listFiles("/",  {recursive: true}, (err, files) => {
        //    console.log("inboxAppend.FILES", files);
            otherParticipantConstDSU.readFile(otherInboxPropPath, (err, buffer) => {
                if (err)
                    return callback(createOpenDSUErrorWrapper("Cannot read file " + otherInboxPropPath, err));
                let inboxPropArray = JSON.parse(buffer);
                inboxPropArray.push(message);
                let inboxPropData = JSON.stringify(inboxPropArray);
                otherParticipantConstDSU.writeFile(otherInboxPropPath, inboxPropData, (err) => {
                    callback(err);
                });
            });
        //});
    };

    /**
     * Locate an Inbox from another participant.
     * The Inbox must have .propName data.
     * The propName is parsed in JSON into an array, message appended, and written back.
     * If not, and error is signaled.
     * @param {string} participantId 
     * @param {string} inboxPropName 
     * @param {function(err, participantConstDSU)} callback
     */
     locateConstWithInbox(participantId, inboxPropName, callback) {
        let self = this;
        self.participantService.locateConstDSU(participantId, (err, participantConstDSU) => {
            if (err)
                return callback(createOpenDSUErrorWrapper("Could not locate participant.id="+participantId,err));
            participantConstDSU.listFiles("/", {recursive: true}, (err, files) => {
                if (err)
                    return callback(err);
                console.log("locateConstWithInbox.FILES ", files);
                let inboxPropPathName = self.inboxService.getPathFromProp(inboxPropName);
                if (!inboxPropPathName) 
                    return callback("There is no property Inbox."+inboxPropName);
                // files returns a list of files without leading "/".
                // Remove leading "/" from paths.
                const filePath = INBOX_MOUNT_PATH.substring(1)+inboxPropPathName;
                if (!files.includes(filePath)) {
                    return callback("Participant.id="+participantId+" does not have "+filePath);
                };
                return callback(undefined, participantConstDSU);
            });
        });
    };
    
    /**
     * Creates a blank Order filled up with the details of this participant.
     * @param {OrderManager} orderManager 
     * @param {function(err, order)} callback
     */
    newBlankOrder(orderManager, callback) {
        let self = this;
        self.getParticipant((err, participant) => {
            if (err)
                return callback(err);
            let orderId = Math.floor(Math.random() * Math.floor(99999999999)); // TODO sequential unique numbering ? It should comes from the ERP anyway.
            let requestorId = participant.id;
            let shippingAddress = participant.address;
            let order = orderManager.newBlankOrderSync(orderId, requestorId, shippingAddress);
            callback(undefined, order);
        });
    };

    /**
     * Register a Participant for a Pharmacy and and mounts it to the participant path.
     * @param {Participant} participant 
     * @param {function(err)} callback 
     */
    registerPharmacy(participant, callback) {
        let self = this;
        // The Pharmacy has a receivedShipments inbox
        let inbox = {};
        inbox[INBOX_RECEIVED_SHIPMENTS_PROP] = [];
        self.create(participant, inbox, (err, keySSI, mountPath) => {
            if (err)
                return callback(err);
            callback();
        });
    };

    /**
     * Register a Participant for a Wholesaler and and mounts it to the participant path.
     * @param {Participant} participant 
     * @param {function(err)} callback 
     */
    registerWholesaler(participant, callback) {
        let self = this;
        // The Wholesaler has a receivedOrders and receivedShipments inbox
        let inbox = {};
        inbox[INBOX_RECEIVED_SHIPMENTS_PROP] = [];
        inbox[INBOX_RECEIVED_ORDERS_PROP] = [];
        self.create(participant, inbox, (err, keySSI, mountPath) => {
            if (err)
                return callback(err);
            callback();
        });
    };

    /**
     * Removes the PARTICIPANT_MOUNT_PATH DSU (does not delete/invalidate DSU, simply 'forgets' the reference)
     * @param {function(err)} callback
     */
    remove(callback) {
        this.DSUStorage.enableDirectAccess(() => {
            this.DSUStorage.unmount(PARTICIPANT_MOUNT_PATH, (err) => {
                if (err)
                    return callback(err);
                console.log(`Participant removed from mount point ${PARTICIPANT_MOUNT_PATH}`);
                callback();
            });
        });
    };

    /**
     * Edits/Overwrites the Participant details
     * @param {Participant} participant
     * @param {function(err)} callback
     */
    edit(participant, callback) {
        this.DSUStorage.enableDirectAccess(() => {
            this.DSUStorage.writeFile(`${PARTICIPANT_MOUNT_PATH}${INFO_PATH}`, JSON.stringify(participant), (err) => {
                if (err)
                    return callback(err);
                console.log(`Participant updated`);
                callback();
            });
        });
    };
};

let participantManager;

/**
 * @param {DSUStorage} [dsuStorage]
 * @param {string} [domain]
 * @returns {ParticipantManager}
 */
const getParticipantManager = function (dsuStorage, domain) {
    if (!participantManager) {
        if (!dsuStorage)
            throw new Error("No DSUStorage provided");
        if (!domain)
            throw new Error("No domain provided");
        participantManager = new ParticipantManager(dsuStorage, domain);
    }
    return participantManager;
}

module.exports = getParticipantManager;