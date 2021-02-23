function IdentityManager(config, cb){
    const fs = require('fs');
    const path = require('swarmutils').path;
    const configLocation = process.env.PSK_CONFIG_LOCATION

    let verifyIdentitiesCache = function(cb2){
        let createRoles = function(domain, actors, callback){
            let actor = actors.shift();
            if (!actor)
                return callback();
            let actorPath = path.join(path.resolve(configLocation), config.baseFolder, domain, actor.name);
            fs.access(actorPath, fs.F_OK, (err) => {
                if (err){
                    console.log(`Could not find ${actor.name}, creating now...`);
                    fs.open(actorPath, "w", (err, fd) => {
                       if (err)
                           return callback(err);
                       fs.close(fd, (err) => {
                           if (err)
                               return callback(err);
                           console.log(`Created actor ${actor.name}'s authority list`);
                           createRoles(domain, actors, callback);
                       });
                    });
                } else {
                    console.log(`Found actor ${actor.name}'s existing authority list`);
                    createRoles(domain, actors, callback);
                }
            });
        };

        let createDomainsAndRoles = function(domains, callback){
            let domain = domains.shift();
            if (!domain)
                return callback();
            let domainFolder = path.join(path.resolve(configLocation), config.baseFolder, domain.domain);
            fs.access(domainFolder, (err) => {
                if (err)
                    try {
                        fs.mkdirSync(domainFolder)
                    } catch (e){
                        return callback("could not create identity domain folder");
                    }

                createRoles(domain.domain, domain.actors.slice(), (err) => {
                    if (err)
                        return callback(err);
                    createDomainsAndRoles(domains, callback);
                });
            });
        };

        let baseFolder = path.join(path.resolve(configLocation), config.baseFolder);
        fs.access(baseFolder, err => {
            if (err)
                try{
                    fs.mkdirSync(baseFolder);
                } catch (e){
                    return cb2("could not create identity folder");
                }

            let domains = Object.keys(config.domains)
                .map(domain => {
                    return {
                        "domain": domain,
                        "actors": config.domains[domain].actors
                    }
                });

            createDomainsAndRoles(domains, (err) => {
                if (err)
                    return cb2(err);
                cb2();
            });
        });
    }

    let init = function(callback){
        verifyIdentitiesCache((err) => {
            if (err)
                return callback(err);
            console.log("IdentityManager started");
            callback();
        });
    }

    let getDomain = function(domain, callback){
        if (!domain in config.domains)
            return callback("Domain not found");
        callback(undefined, config.domains[domain]);
    }

    let getActor = function(domain, actor, callback){
        getDomain(domain, (err, domainCfg) => {
           if (err)
               return callback(err);
           let matching = domainCfg.actors.filter(a => a.name === actor);
           if (!matching)
               return callback("Actor not found");
            callback(undefined, matching[0]);
        });
    }

    let getRolesByActor = function(domain, actor, callback){
        getActor(domain, actor, (err, actorCfg) => {
            if (err)
                return callback(err);
            callback(undefined, actorCfg.roles);
        });
    }

    let getEndpointsByActor = function(domain, actor, callback){
        getRolesByActor(domain, actor, (err, roles) => {
           if (err)
               return callback(err);
           getEndpointsByRoles(roles, (err, endpoints) => {
              if (err)
                  return callback(err);
              callback(undefined, endpoints);
           });
        });
    }

    let getEndpointsByRoles = function(domain, roles, callback){
        getDomain(domain, (err, domainCfg) => {
           if (err)
               return callback(err);
           let endpoints = [];
           roles.forEach(role => {
               if (!role in domainCfg.roles || !'endpoints' in role)
                   return callback(`Could nof find endpoints for role ${role}`);
               endpoints = endpoints.concat(domainCfg[role].endpoints);
           });
           callback(undefined, endpoints);
        });
    }

    let getActorFilePath = function(domain, actor, callback){
        let actorFilePath = path.join(path.resolve(configLocation), config.baseFolder, domain, actor);
        fs.access(actorFilePath, (err) =>{
            if (err)
                return callback(err);
            callback(undefined, actorFilePath);
        });
    }

    let getCredentialsByActor = function(domain, actor, callback){
        getActorFilePath(domain, actor, (err, actorFilePath) => {
            if (err)
                return callback(`No credentials for ${actor} in ${domain} found`);
            const rl = require('readline').createInterface({
                input: fs.createReadStream(actorFilePath),
                output: process.stdout,
                terminal: false
            });
            let registered = []
            rl.on('line', (line) => {
                registered.push(line);
            });
            callback(undefined, registered);
        });
    }

    let addCredentialsToActor = function(domain, actor, keySSI, callback){
        let saveCredential = function(domain, actor, callback){
            getActorFilePath(domain, actor, (err, actorFilePath) => {
                fs.appendFile(actorFilePath, keySSI + require('os').EOL, err => {
                    if (err)
                        return callback("Could not append new credential");
                    callback();
                });
            });
        }

        getCredentialsByActor(domain, actor, (err, credentials) => {
            if (err || !keySSI in credentials)
                return saveCredential(domain, actor, callback);
            return callback("Actor already registered");
        });
    }

    let getSummary = function(domain, actor){
        getActor(domain, actor, (err, actorCfg) => {
            if (err)
                return callback(err);
            getEndpointsByRoles(domain, actorCfg.roles, (err, endpoints) => {
                if (err)
                    return callback(err);
                actorCfg.endpoints = endpoints;
                callback(undefined, actorCfg);
            })
        });
    }

    this.verify = function(domain, actor, keySSI, callback){
        getCredentialsByActor(domain, actor, (err, identities) => {
           if (err)
               return callback(err);
           callback(undefined, keySSI in identities, getSummary(domain, actor));
        });
    }

    /**
     * If not already registered, will register provided keySSI in domain/actor
     * @param {string} domain: the domain name
     * @param {string} actor: the actor name
     * @param {string} keySSI: the keySSI that identifies the actor in a human readable form, i.e: from getIdentifier(true)
     * @param {function} callback: the callback function (err, authorities object)
     */
    this.register = function(domain, actor, keySSI, callback){
        this.verify(domain, actor, keySSI, (err, result) => {
            if (err)
                addCredentialsToActor(domain, actor, keySSI, (e, authorities) => {
                    if (e)
                        return callback(e);
                    return callback(undefined, getSummary(domain, actor));
                });
            if (result)
                return callback("Actor already registered", result);
        });
    };

    init(cb);
}

module.exports = IdentityManager;