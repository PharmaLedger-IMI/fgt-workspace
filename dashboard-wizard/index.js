/**
 * Extends the functionality and Architecture to the Use Case's specific Business needs through the FGT API
 * @module dashboard-wizard
 */

module.exports = {
    /**
     * Exposes constants.
     */
    Constants: require("../fgt-dsu-wizard/constants"),
    /**
     * Exposes the Model module
     */
    Model: require("../fgt-dsu-wizard/model"),
    /**
     * Exposes the Managers module
     */
    Managers: require("./managers"),
    /**
     * Exposes Version.
     */
    Version: require("../fgt-dsu-wizard/version"),
};
