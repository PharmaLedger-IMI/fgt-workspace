/**
 * Provides a Environment Independent and Versatile Dossier Building API
 * @module opendsu.dt
 */

/**
 * Returns a DossierBuilder Instance
 * @param {Archive} [sourceDSU]
 * @return {DossierBuilder}
 * @module opendsu.dt
 */
const getDossierBuilder = (sourceDSU) => {
    return new (require("./DossierBuilder").DossierBuilder)(sourceDSU)
}

module.exports = {
    getDossierBuilder,
    Operations: require("./DossierBuilder").OPERATIONS,
    AppBuilderService: require('./AppBuilderService')
}
