/*
html API space
*/

/**
 * Returns a DossierBuilder Instance
 * @param {boolean} [fromDisk] defaults to true
 * @return {DossierBuilder}
 */
const getDossierBuilder = (fromDisk) => {
    return new (require("./DossierBuilder").DossierBuilder)(fromDisk)
}

module.exports = {
    getDossierBuilder,
    Operations: require("./DossierBuilder").operations
}
