/*
html API space
*/

/**
 * Returns a DossierBuilder Instance
 * @param {Archive} [sourceDSU]
 * @return {DossierBuilder}
 */
const getDossierBuilder = (sourceDSU) => {
    return new (require("./DossierBuilder2").DossierBuilder)(sourceDSU)
}

module.exports = {
    getDossierBuilder,
    Operations: require("./DossierBuilder").operations
}
