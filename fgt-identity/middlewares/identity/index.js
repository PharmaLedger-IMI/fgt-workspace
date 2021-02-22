const openDSU = require("opendsu");
const crypto = openDSU.loadApi("crypto");
let config;

const IDENTITIES_FOLDER = "identity"

function verifyIdentitiesCache(idConfig, callback){
    const fs = require('fs');
    const path = require('swarmutils').path;
    const configLocation = process.env.PSK_CONFIG_LOCATION
    let createRoles = function(actors, callback){
        let actor = actors.shift();
        if (!actor)
            return callback(undefined, actors);
        fs.access(path.join(path.resolve(configLocation), IDENTITIES_FOLDER, actor.name), fs.F_OK, (err) => {
            if (err){
                console.log(`Could not find ${actor.name}, creating now...`);
                try {
                    fs.closeSync(fs.openSync(path.join(path.resolve(configLocation), IDENTITIES_FOLDER, actor.name), 'w'));
                    console.log(`Created actor ${actor.name}`);
                    createRoles(actors, callback);
                } catch (e){
                    return callback(err);
                }
            } else {
                console.log(`Found actor ${actor.name}`);
                createRoles(actors, callback);
            }
        });
    };

    fs.access(path.join(path.resolve(configLocation), IDENTITIES_FOLDER), err => {
        if (err){
            if (!fs.mkdirSync(path.join(path.resolve(configLocation), IDENTITIES_FOLDER)))
                return callback("could not create base identity folder");
        }
        createRoles(idConfig.actors.slice(), callback);
    });

}

function sendUnauthorizedResponse(req, res, reason, error) {
    console.error(`[Auth] [${req.method}] ${req.url} blocked: ${reason}`, error);
    res.statusCode = 403;
    res.end();
}

function authorization(urlsToSkip){
    return function(req, res, next) {
        let {url} = req;
        let jwt = req.headers['authorization'];

        const canSkipAuthorisation = urlsToSkip.some((urlToSkip) => url.indexOf(urlToSkip) === 0);
        if (url === "/" || canSkipAuthorisation)
            return next();

        if (!config.getConfig("enableLocalhostAuthorization") && req.headers.host.indexOf("localhost") === 0)
            return next();

        if (!jwt)
            return sendUnauthorizedResponse(req, res, "Missing required Authorization header");

        config.getTokenIssuers((err, tokenIssuers) => {
            if (err)
                return sendUnauthorizedResponse(req, res, "error while getting token issuers", err);
            jwt = jwt.replace("Bearer ", "");
            crypto.verifyAuthToken(jwt, tokenIssuers, (error, isValid) => {
                if (error || !isValid)
                    return sendUnauthorizedResponse(req, res, "JWT could not be verified", error);
                next();
            });
        });
    }
}

function registration(req, res){
    let {url} = req;
    let sRead = request.params
    console.log(sRead);
}

function Identity(server){
    config = require("../../config");
    let identityCfg = config.getConfig('identity');
    if (!identityCfg)
        return;

    console.log(`Registering Identity middleware`);

    const skipAuthorisation = config.getConfig("skipAuthorisation");
    const urlsToSkip = skipAuthorisation && Array.isArray(skipAuthorisation) ? skipAuthorisation : [];

    verifyIdentitiesCache(identityCfg, (err) => {
        if (err)
            throw err;
        server.use(authorization(urlsToSkip));
        server.post(`/:domain/register/:role`, registration);
    });
}

module.exports = Identity