const Manager = require('./Manager')
const { _err } = require('../services/utils')
const { MESSAGE_REFRESH_RATE, DID_METHOD, MESSAGE_TABLE } = require('../constants');

/**
 * @typedef W3cDID
 */

/**
 * Class to wrap messages
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
 * @param {function(Message)} [onNewMessage] defaults to a console log
 * @module managers
 * @class MessageManager
 */
class MessageManager extends Manager{
    constructor(baseManager, didString){
        super(baseManager, MESSAGE_TABLE);
        this.w3cDID = require('opendsu').loadApi('w3cdid');
        this.didString = didString;
        this.did = undefined;
        let self = this;
        this._listeners = {};
        this.timer = undefined;
        this.getOwnDID((err, didDoc) => err
            ? createOpenDSUErrorWrapper(`Could not get Own DID`, err)
            : self._startMessageListener(didDoc));
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
            if (api in self._listeners) {
                console.log(`Found ${self._listeners[api].length} listeners for the ${api} message api`)
                self._listeners[api].forEach(apiListener => {
                    apiListener(message);
                });
            }
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
     */
    registerListeners(api, onNewApiMsgListener){
        if (!(api in this._listeners))
            this._listeners[api] = [];
        this._listeners[api].push(onNewApiMsgListener);
    }

    /**
     * Sends a Message to the provided did
     * @param {string|W3cDID} did
     * @param {Message} message
     * @param {function(err)}callback
     */
    sendMessage(did, message, callback){
        if (typeof did !== 'object')
            return this._getDID(did + '', (err, didDoc) => err
                ? _err(`Could not get DID Document for string ${did}`, err, callback)
                : this.sendMessage(didDoc, message, callback));

        this.getOwnDID((err, selfDID) => {
            selfDID.sendMessage(message, did.getIdentifier(), err => err
                ? _err(`Could not send Message`, err, callback)
                : callback());
        });
    }

    /**
     * Delete a message from the MESSAGE_TABLE.
     * @param {string} [tableName] defaults to MESSAGE_TABLE
     * @param {object} message. Must have a key property.
     * @param {function(err)} callback 
     * @returns 
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
            this.query(MESSAGE_TABLE, `api == ${api}`, undefined, 10, callback);
        } else {
            // list all messages
            this.query(MESSAGE_TABLE, "__timestamp > 0", undefined, 10, callback);
        }
    }

    _startMessageListener(did){
        let self = this;
        console.log("_startMessageListener", did.getIdentifier());
        did.readMessage((err, message) => {
            if (err)
                return console.log(createOpenDSUErrorWrapper(`Could not read message`, err));
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
            console.log("did.readMessage", message);
            self._startMessageListener(did);
            self._receiveMessage(message, (err, message) => {
                if (err)
                    return console.log(createOpenDSUErrorWrapper(`Failed to receive message`, err));
                console.log(`Message received ${message}`);
            });
        });
    }

    getOwnDID(callback){
        if (this.did)
            return callback(undefined, this.did);
        this._getDID(this.didString, callback);
    }

    _getDID(didString, callback){
        this.w3cDID.createIdentity(DID_METHOD, didString, (err, didDoc) => err
            ? _err(`Could not create DID identity`, err, callback)
            : callback(undefined, didDoc));
    }
}

let messageManager;

/**
 * @param {BaseManager} baseManager  only required the first time, if not forced
 * @param {string} didString
 * @param {function(Message)} [onNewMessage]
 * @param {boolean} [force] defaults to false. overrides the singleton behaviour and forces a new instance.
 * Makes DSU Storage required again!
 * @returns {MessageManager}
 * @module managers
 */
const getMessageManager = function(baseManager, didString, onNewMessage, force) {
    if (typeof onNewMessage === 'boolean'){
        force = onNewMessage;
        onNewMessage = undefined;
    }
    if (!messageManager || force) {
        if (!baseManager || !didString)
            throw new Error("Missing Objects for instantiation");
        messageManager = new MessageManager(baseManager, didString, onNewMessage);
    }
    return messageManager;
}

module.exports = {
    getMessageManager,
    Message
};