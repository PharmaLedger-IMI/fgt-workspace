const Manager = require('./Manager')
const { _err } = require('../services/utils')
const { MESSAGE_REFRESH_RATE, DID_METHOD, DID_DOMAIN, MESSAGE_TABLE } = require('../constants');
const opendsu = require("opendsu");
const scAPI = opendsu.loadAPI("sc");

/**
 * @typedef W3cDID
 */

/**
 * Class to wrap messages
 * @memberOf MessageManager
 */
class Message{
    /**
     *
     * @param {string} api
     * @param {*} message anything as long as it is serializable i guess
     */
    constructor(api, message){
        this.api = api;
        this.message = message;
    }
}
/**
 * Manager Classes in this context should do the bridge between the controllers
 * and the services exposing only the necessary api to the controllers while encapsulating <strong>all</strong> business logic.
 *
 * All Manager Classes should be singletons.
 *
 * This complete separation of concerns is very beneficial for 2 reasons:
 * <ul>
 *     <li>Allows for testing since there's no browser dependent code (i think) since the DSUStorage can be 'mocked'</li>
 *     <li>Allows for different controllers access different business logic when necessary (while benefiting from the singleton behaviour)</li>
 * </ul>
 *
 * @param {Database} storage the DSU where the storage should happen or more commonly the Database Object
 * @param {BaseManager} baseManager the base manager to have access to the identity api
 * @param {string} didString
 * @param {function(err, Manager)} [callback] optional callback for when the assurance that the table has already been indexed is required.
 * @memberOf Managers
 * @extends Manager
 * @class MessageManager
 */
class MessageManager extends Manager{
    constructor(baseManager, didString, callback){
        super(baseManager, MESSAGE_TABLE, ['api'], (err, manager) => {
            if (err)
                return callback(err);

            manager.w3cDID = require('opendsu').loadApi('w3cdid');
            manager.didString = didString;
            manager.did = undefined;
            manager._listeners = {};
            manager.timer = undefined;
            manager.sc = baseManager.sc;

            manager.getOwnDID((err, didDoc) => {
                if (err)
                    throw new Error(`Could not get Own DID: ${err}`);
                manager._startMessageListener(didDoc);
                if (callback)
                    callback(undefined, manager);
            });

        });
        this.w3cDID = this.w3cDID || require('opendsu').loadApi('w3cdid');
        this.didString = this.didString || didString;
        this.did = this.did || undefined;
        this._listeners = this._listeners || {};
        this.timer = this.timer || undefined;
        this.sc = this.sc || undefined;
    }

    shutdown(){
        if (!this.timer)
            return console.log(`The message service for ${this.didString} is not running`);
        clearInterval(this.timer);
        console.log(`The messenger for ${this.didString} stopped`);
    }

    _receiveMessage(message, callback){
        const {api} = message;
        let self = this;
        self._saveToInbox(message, (err) => {
            if (err)
                return _err(`Could not save message to inbox`, err, callback);
            console.log(`Message ${JSON.stringify(message)} saved to table ${self._getTableName()} on DID ${self.didString}`);
            if (!(api in self._listeners)) {
                console.log(`No listeners registered for ${api} messages.`);
                return callback();
            }

            console.log(`Found ${self._listeners[api].length} listeners for the ${api} message api`);

            const listenerIterator = function(listeners, callback){
                const listener = listeners.shift();
                if (!listener)
                    return callback(undefined, message);
                listener(message, (err) => {
                    if (err)
                        console.log(`Error processing Api ${api}`, err);
                    listenerIterator(listeners, callback);
                });
            }

            listenerIterator(self._listeners[api].slice(), callback);
        });
    }

    _saveToInbox(message, callback){
        const key = Date.now() + '';
        message.key = key; // jpsl: add a key to the message, so that it can be deleted later based on the record object
        this.insertRecord(key, message, callback);
    }

    /**
     *
     * @param {string} api - should match one the DB constants with the tableName.
     * @param {function(Message)} onNewApiMsgListener where Message is an object obtained by JSON.parse(message)
     *
     */
    registerListeners(api, onNewApiMsgListener){
        if (!(api in this._listeners))
            this._listeners[api] = [];
        this._listeners[api].push(onNewApiMsgListener);
        const self = this;
        console.log(`registering a new listener on ${api}`);
        self.getAll(true, {
            query: [
                `api like /${api}/g`
            ]
        }, (err, messages) => {
            if (err)
                return console.log(`Could not list messages from Inbox, api: ${api}`);
            if (!messages || !messages.length)
                return console.log(`No Stashed Messages Stored for ${api}...`);
            console.log(`${messages.length} Stashed Messages found for manager ${api}`);
            messages.forEach(m => onNewApiMsgListener(m));
        });
    }

    /**
     * Sends a Message to the provided did
     * @param {string|W3cDID} did
     * @param {Message} message
     * @param {function(err)}callback
     */
    sendMessage(did, message, callback){
        if (typeof did !== 'object') {
            console.log("(error msg) sendMessage.message=", message);
            return this._getDID(did + '', (err, didDoc) => err
                ? _err(`Could not get DID Document for string ${did}`, err, callback)
                : this.sendMessage(didDoc, message, callback));
        }

        if (!(message instanceof Message))
            return callback(`Message ${message} must be instance of class Message`);

        console.log("(error msg) sendMessage.message=", message);
        this.getOwnDID((err, selfDID) => {
            console.log("Sending message", message, "to did", did.getIdentifier());
            selfDID.sendMessage(JSON.stringify(message), did, err => err
                ? _err(`Could not send Message`, err, callback)
                : callback());
        });
    }

    /**
     * Delete a message from the MESSAGE_TABLE.
     * @param {string} [tableName] defaults to MESSAGE_TABLE
     * @param {object} message. Must have a key property.
     * @param {function(err)} callback 
     */
    deleteMessage(tableName, message, callback) {
        if (!callback){
            callback = message;
            message = tableName;
            tableName = MESSAGE_TABLE;
        }
        if (!message)
            return callback("Message undefined");
        if (!message.key)
            return callback(`Message ${message} key property undefined`);
        this.deleteRecord(tableName, message.key, (err, oldRecord) => {
            return callback(err);
        });
    }

    getMessages(api, callback){
        if (!callback){
            callback = api;
            api = undefined;
        }
        if (api) {
            // filter messages for this api only
            this.query(MESSAGE_TABLE, `api == ${api}`, undefined, undefined, callback);
        } else {
            // list all messages
            this.query(MESSAGE_TABLE, "__timestamp > 0", undefined, undefined, callback);
        }
    }

    _startMessageListener(did){
        let self = this;
        console.log("_startMessageListener", did.getIdentifier());
        did.readMessage((err, message) => {
            if (err){
                console.log("error in message: ", message);
                if (err.message !== 'socket hang up')
                    console.log(createOpenDSUErrorWrapper(`Could not read message`, err));
                return self._startMessageListener(did);
            }

            console.log("did.readMessage did", did.getIdentifier(), "message", message);
            // jpsl: did.readMessage appears to return a string, but db.insertRecord requires a record object.
            // ... So JSON.parse the message into an object.
            // https://opendsu.slack.com/archives/C01DQ33HYQJ/p1618848231120300
            if (typeof message == "string") {
                try {
                    message = JSON.parse(message);
                } catch (error) {
                    console.log(createOpenDSUErrorWrapper(`Could not JSON.parse message ${message}`, err));
                    self._startMessageListener(did);
                    return;
                }
            }
            self._receiveMessage(message, (err, message) => {
                if (err)
                    console.log(`Failed to receive message`, err);
                else
                    console.log(`Message received ${message}`);
                self._startMessageListener(did);
            });
        });
    }

    getOwnDID(callback){
        if (this.did)
            return callback(undefined, this.did);
        const self = this;
        this._getDID(this.didString, (err, ownDID) => {
            if (err)
                return callback(err);
            self.did = ownDID;
            callback(undefined, self.did);
        });
    }

    _getDID(didString, callback){
        const didIdentifier = `did:ssi:name:${DID_DOMAIN}:${didString}`;

        if(this.sc){
            return this.w3cDID.resolveDID(didIdentifier, (err, resolvedDIDDoc) => {
                if (!err)
                    return callback(undefined, resolvedDIDDoc);

                this.w3cDID.createIdentity(DID_METHOD, DID_DOMAIN, didString, (err, didDoc) => {
                    if (err)
                        return _err(`Could not create DID identity`, err, callback);
                    // didDoc.setDomain('traceability');
                    callback(undefined, didDoc);
                });
            })
        }

        callback(`Security Context not initialised`)
    }
}

/**
 * @param {BaseManager} baseManager  only required the first time, if not forced
 * @param {string} didString
 * @param {boolean} [force] defaults to false. overrides the singleton behaviour and forces a new instance.
 * Makes DSU Storage required again!
 * @param {function(err, Manager)} [callback] optional callback for when the assurance that the table has already been indexed is required.
 * @returns {MessageManager}
 * @memberOf managers
 */
const getMessageManager = function(baseManager, didString, callback) {
    let manager;
    try {
        manager = baseManager.getManager(MessageManager);
        if (callback)
            return callback(undefined, manager);
    } catch (e){
        manager = new MessageManager(baseManager, didString, callback);
    }
    return manager;
}

module.exports = {
    getMessageManager,
    Message
};