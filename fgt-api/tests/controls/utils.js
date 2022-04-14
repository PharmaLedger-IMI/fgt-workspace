const path = require("path");
const fs = require("fs");
const {encodeBase64, decodeBase64} = require("../../utils/basicAuth");

const getParticipantIdFromCredentials = function (walletName) {
    const credentialsFilePath = path.resolve(__dirname, "..", "..", "config", walletName, "credentials.json");

    let credentials;
    try {
        credentials = fs.readFileSync(credentialsFilePath);
        credentials = JSON.parse(credentials);
    } catch (e) {
        throw e;
    }
    return credentials.id.secret;
}

const getTokenFromCredentials = function (walletName) {
    const credentialsFilePath = path.resolve(__dirname, "..", "..", "config", walletName, "credentials.json");

    let credentials;
    try {
        credentials = fs.readFileSync(credentialsFilePath);
        credentials = JSON.parse(credentials);
    } catch (e) {
        throw e;
    }
    return `${credentials.id.secret}:${encodeBase64(credentials.email.secret)}`;
}

module.exports = {
    MAH_API: 'http://localhost:8081/traceability',
    WHS_API: 'http://localhost:3001/traceability',
    PHA_API: 'http://localhost:3002/traceability',
    getParticipantIdFromCredentials,
    getTokenFromCredentials
}