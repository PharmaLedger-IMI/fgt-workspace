function authenticate(user, password) {
    return (process.env.PARTICIPANT_ID === user) &&  (password === decodeBase64(process.env.TOKEN));
}

function encodeBase64(str) {
    return Buffer.from(`${str}`).toString('base64');
}

function decodeBase64(base64Str) {
    return Buffer.from(base64Str, 'base64').toString('ascii');
}

module.exports = {
    authenticate,
    encodeBase64,
    decodeBase64
}