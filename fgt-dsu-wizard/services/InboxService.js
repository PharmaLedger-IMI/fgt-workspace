/**
 * @module fgt-dsu-wizard.services
 */
const utils = require('../../pdm-dsu-toolkit/services/utils');
const {INBOX_PATHS_AND_PROPS} = require('../constants');

/**
 * @param {string} domain: anchoring domain. defaults to 'default'
 * @param {strategy} strategy
 */
function InboxService(domain, strategy){
    const strategies = require("../../pdm-dsu-toolkit/services/strategy");

    domain = domain || "default";
    let isSimple = strategies.SIMPLE === (strategy || strategies.SIMPLE);

    /**
     * Creates an Inbox DSU
     * @param {object} inbox
     * @param {function(err, inboxKeySSI)} callback
     */
    this.create = function(inbox, callback){
        if (isSimple){
            this.createSimple(inbox, callback);
        } else {
            throw new Error("Not implemented"); // createAuthorized(order, callback);
        }
    };

    this.createSimple = function(inbox, callback) {
        let inboxKeyGenFunction = require('../commands/setInboxSSI').createInboxSSI;
        let inboxTemplateKeySSI = inboxKeyGenFunction(inbox, domain);

        utils.selectMethod(inboxTemplateKeySSI)(inboxTemplateKeySSI, (err, inboxDsu) => {
            if (err)
                return callback(err);
            inboxDsu.getKeySSIAsObject((err, inboxKeySSI) => {
                if (err)
                    return callback(err);
                let writeInfoArray = [...INBOX_PATHS_AND_PROPS];
                let writeInboxProp = function() {
                    if (!writeInfoArray || writeInfoArray.length == 0) {
                        return callback(undefined, inboxKeySSI);
                    } else {
                        const writeInfo = writeInfoArray.shift();
                        const propPath = writeInfo.path;
                        const propValue = inbox[writeInfo.prop];
                        console.log("Writing "+writeInfo.prop+" to "+propPath+" as "+JSON.stringify(propValue));
                        if (propValue) {
                            inboxDsu.writeFile(propPath, JSON.stringify(propValue), (err) => {
                                if (err)
                                    return callback(err);
                                writeInboxProp();
                            });
                        } else {
                            writeInboxProp();
                        }
                    }
                };
                writeInboxProp();
            });
        });
    };

    /**
     * Given an Inbox propName, locate the mounth path.
     * @param {string} propName 
     * @returns string. Undefined if propName not found.
     */
    this.getPathFromProp = function (propName) {
        let locatedPath;
        INBOX_PATHS_AND_PROPS.forEach((inboxPathAndProp) => {
            //console.log(inboxPathAndProp);
            if (inboxPathAndProp.prop == propName) {
                locatedPath = inboxPathAndProp.path;
            }
        });
        console.log("getPathFromProp ",propName,locatedPath);
        return locatedPath;
    };
}

module.exports = InboxService;