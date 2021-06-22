/**
 * Defines the strategies for the KeySSI's for each DSU Type
 * @namespace Commands
 */
module.exports = {
    setSSI: require("./setSSI"),
    createParticipantSSI: require("./setParticipantSSI").createParticipantSSI,
    createParticipantConstSSI: require("./setParticipantConstSSI").createParticipantConstSSI
};
