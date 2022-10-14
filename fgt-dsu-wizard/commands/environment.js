const TRACEABILITY_DOMAIN_KEY = "TRACEABILITY_DOMAIN";
const BRICKS_DOMAIN_KEY = require('opendsu').constants.BRICKS_DOMAIN_KEY

function getDomain(defaultDomain){
    if (!globalThis || !globalThis.process || !globalThis.process.env || !globalThis.process.env[TRACEABILITY_DOMAIN_KEY])
        return defaultDomain;
    return globalThis.process.env[TRACEABILITY_DOMAIN_KEY];
}

function getBricksDomain(){
    if (!globalThis || !globalThis.process || !globalThis.process.env || !globalThis.process.env[BRICKS_DOMAIN_KEY])
        return undefined;
    return globalThis.process.env[BRICKS_DOMAIN_KEY];
}

module.exports = {
   getDomain,
   getBricksDomain,
   BRICKS_DOMAIN_KEY
}