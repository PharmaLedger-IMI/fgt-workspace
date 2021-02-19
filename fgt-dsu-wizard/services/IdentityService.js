const ROLES = {
    MAH: "mah",
    PHARMACY: "pha",
    WHOLESALER: "who"
}

function IdentityService(){
    const openDSU = require('opendsu');
    const keyssi = openDSU.loadApi("keyssi");
    const resolver = openDSU.loadApi("resolver");
}

module.exports = {
    ROLES,
    IdentityService
}