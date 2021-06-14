/**
 * Provides a Environment Independent and Versatile Dossier Building API.
 *
 * Meant to be integrated into OpenDSU
 */

/**
 * Returns a DossierBuilder Instance
 * @param {Archive} [sourceDSU] should only be provided when cloning a DSU
 * @return {DossierBuilder}
 * @module dt
 */
const getDossierBuilder = (sourceDSU, ) => {
    return new (require("./DossierBuilder"))(sourceDSU)
}

module.exports = {
    getDossierBuilder,
    Commands: require('./commands'),
    AppBuilderService: require('./AppBuilderService')
}
