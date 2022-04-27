/**
 * Extends the functionality and Architecture to the Use Case's specific Business needs through the FGT API
 * @module dashboard-wizard
 */

const fgtModel = require("../fgt-dsu-wizard/model");

module.exports = {
    /**
     * Exposes constants.
     */
    Constants: require("../fgt-dsu-wizard/constants"),
    /**
     * Exposes the Model module
     */
    Model: Object.assign({}, fgtModel, {
        SimpleShipment: require('../fgt-api/model/SimpleShipment')
    }),
    /**
     * Exposes the Services Module
     */
    Services: require("./services"),
    /**
     * Exposes the Managers module
     */
    Managers: require("./managers"),
    /**
     * Exposes Version.
     */
    Version: require("../fgt-dsu-wizard/version"),
};
