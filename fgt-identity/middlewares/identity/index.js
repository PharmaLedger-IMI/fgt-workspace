const openDSU = require("opendsu");
const crypto = openDSU.loadApi("crypto");
//const keyssi = openDSU.loadApi('keyssi');
let idManager;
let config;

function startIdManager(idConfig, callback){
    idManager = new (require('./IdentityManager'))(idConfig, callback);
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
    let {url, params} = req;
    let {domain, role} = params;
    let data = [];

    req.on('data', (chunk) => {
        data.push(chunk);
    });

    req.on('end', () => {
        try{
            data = JSON.parse(data);
        } catch (e){
            data = data.toString();
        }
        //let keySSI = keyssi.parse(data);
        idManager.register(domain, role, data, (err, summary) => {
            if (err)
                res.send('503', `Error registering as ${role}: ${err}`);
            res.send('200', summary);
        });
    });
}

function Identity(server){
    config = require("../../config");
    let identityCfg = config.getConfig('identity');
    if (!identityCfg)
        return;

    console.log(`Registering Identity middleware`);
    const skipAuthorisation = config.getConfig("skipAuthorisation");
    const urlsToSkip = skipAuthorisation && Array.isArray(skipAuthorisation) ? skipAuthorisation : [];
    //server.use(authorization(urlsToSkip));
    server.post(`/:domain/register/:role`, registration);

    startIdManager(identityCfg, (err) => {
        if (err)
            throw err;
        console.log("loaded Id Manager. server is now ready to use...");
    });
}

module.exports = Identity