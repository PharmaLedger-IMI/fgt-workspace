/**
 * Provides a Environment Independent and Versatile Dossier Building API.
 *
 * Meant to be integrated into OpenDSU
 * @namespace dt
 * @memberOf Services
 */

/**
 * Returns a DossierBuilder Instance
 * @param {Archive} [sourceDSU] should only be provided when cloning a DSU
 * @return {DossierBuilder}
 * @memberOf dt
 */
const getDossierBuilder = (sourceDSU, ) => {
    return new (require("./DossierBuilder"))(sourceDSU)
}

module.exports = {
    getDossierBuilder,
    Commands: require('./commands'),
    AppBuilderService: require('./AppBuilderService')
}
