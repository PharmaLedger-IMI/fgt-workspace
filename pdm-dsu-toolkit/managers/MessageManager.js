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
     * @param {W3cDID} senderDID
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
 * @param {string} didString
 * @param {function(Message)} [onNewMessage] defaults to a console log
 * @module managers
 * @class Manager
 */
class MessageManager extends Manager{
    constructor(db, didString){
        super(db);
        this.w3cDID = require('opendsu').loadApi('w3cdid');
        this.didString = didString;
        this.did = undefined;
        let self = this;
        this._listeners = {};
        this.getOwnDID((err, didDoc) => err
            ? createOpenDSUErrorWrapper(`Could not get Own DID`, err)
            : self._startMessageListener(didDoc));
    }

    _receiveMessage(message, callback){
        const {api} = message;
        let self = this;
        self._saveToInbox(message, (err) => {
            if (err)
                return _err(`Could not save message to inbox`, err, callback);
            console.log(`Message ${JSON.stringify(message)} saved to inbox`);
            if (api in self._listeners) {
                console.log(`Found ${self._listeners[api].length} listeners for the ${api} message api`)
                self._listeners[api].forEach(apiListener => {
                    apiListener(message);
                });
            }
        });
    }

    _saveToInbox(message, callback){
        this.storage.insertRecord(MESSAGE_TABLE, Date.now().toISOString(), JSON.stringify(message), callback);
    }

    /**
     *
     * @param {string} api
     * @param {function(Message)} onNewApiMsgListener
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
        if (typeof did === 'string')
            return this._getDID(did, (err, didDoc) => err
                ? _err(`Could not get DID Document for string ${did}`, err, callback)
                : sendMessage(didDoc, message, callback));

        this.getOwnDID((selfDID) => {
            selfDID.sendMessage(message, did.getIdentifier(), err => err
                ? _err(`Could not send Message`, err, callback)
                : callback());
        });
    }

    getMessages(api, callback){
        if (typeof api === 'function'){
            callback = api;
            api = MESSAGE_TABLE;
        }
        this.storage.filter(api, () => true, undefined, 10, callback);
    }

    _startMessageListener(did){
        let self = this;
        setTimeout(() => {
            did.readMessage((err, message) => {
                if (err)
                    return createOpenDSUErrorWrapper(`Could not read message`, err);
                self._receiveMessage(message, (err, message) => err
                    ? createOpenDSUErrorWrapper(`Failed to receive message`, err)
                    : console.log(`Message received ${message}`));
            });
        }, MESSAGE_REFRESH_RATE);
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
 * @param {Database} storage the DSU where the storage should happen or more commonly the Database Object
 * @param {string} didString
 * @param {function(Message)} onNewMessage
 * @returns {MessageManager}
 * @module managers
 */
const getMessageManager = function (storage, didString, onNewMessage) {
    if (!messageManager) {
        if (!storage)
            throw new Error("No storage provided");
        messageManager = new MessageManager(storage, didString, onNewMessage);
    }
    return messageManager;
}

module.exports = {
    getMessageManager,
    Message
};