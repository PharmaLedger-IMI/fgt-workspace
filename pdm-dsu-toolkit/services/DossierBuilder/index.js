/*
html API space
*/

/**
 *
 * @param {boolean} fromDisk
 * @return {DossierBuilder}
 */
const getDossierBuilder = (fromDisk) => {
    return new (require("./DossierBuilder").DossierBuilder)(fromDisk)
}

module.exports = {
    getDossierBuilder,
    Operations: require("./DossierBuilder").operations
}
