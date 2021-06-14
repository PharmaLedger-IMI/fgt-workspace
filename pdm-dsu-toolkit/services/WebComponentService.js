const { INFO_PATH } = require('../constants');
const { _err } = require('./utils');
/**
 * This service is the bridge between custom webcomponents and PDM's openDSU SSApp Architecture
 * module Services
 * @deprecated
 */
function WebComponentService() {
    const { getResolver, getKeySSISpace } = require('./utils');

    /**
     * retrieves the object stored at {@link INFO_PATH} to the dsu with the provided keySSI
     * @param {string} keySSI
     * @param {function(err, object)} callback
     */
    this.getInfo = function(keySSI, callback){
        let key;
        try {
            key = getKeySSISpace().parse(keySSI);
        } catch (e){
            return _err(`Could not parse keySSI`, e, callback);
        }

        getResolver().loadDSU(key, (err, dsu) => {
           if (err)
               return _err(`Could not load dsu`, err, callback);
           dsu.readFile(INFO_PATH, (err, data) => {
               if (err)
                   return _err(`Could not read file at ${INFO_PATH}`, err, callback);
               try {
                   const result = JSON.parse(data);
                   callback(undefined, result);
               } catch(e) {
                   _err(`Could not parse info file`, err, callback);
               }
           })
        });
    }
}

module.exports = WebComponentService;
