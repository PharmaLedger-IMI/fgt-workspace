const {getBricksDomain, BRICKS_DOMAIN_KEY, getDomain} = require("./environment");

/**
 * Creates a seedSSI meant to contain participant 'participant' data.
 * could be used as an identity
 * @param {Participant} participant
 * @param {string} domain: anchoring domain
 * @returns {SeedSSI} (template)
 * @memberOf Commands
 */
function createParticipantSSI(participant, domain) {
    domain = getDomain(domain)

    console.log("New Participant_SSI in domain", domain);
    const openDSU = require('opendsu');
    const keyssiSpace = openDSU.loadApi("keyssi");
    let hint;
    const bricksDomain = getBricksDomain();
    if (bricksDomain){
        hint = {}
        hint[BRICKS_DOMAIN_KEY] = bricksDomain
    }
    return keyssiSpace.buildTemplateSeedSSI(domain, participant.id + participant.name + participant.tin, undefined, 'v0', undefined);
}

/**
 * Registers the endpoint on the api-hub's dsu-wizard.
 * @param {HttpServer} server
 * @memberOf Server
 */
function command(server){
    const setSSI = require('../../pdm-dsu-toolkit/commands/setSSI');
    setSSI(server, "participant", createParticipantSSI, "setParticipantSSI", getDomain("traceability"));
}

module.exports = {
    command,
    createParticipantSSI: createParticipantSSI
};
