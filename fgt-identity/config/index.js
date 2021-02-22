let serverConfig;
let tokenIssuers;

function getConfig(...keys) {
    const path = require("swarmutils").path;

    if (!serverConfig) {
        let serverJson;
        if (typeof process.env.PSK_CONFIG_LOCATION === "undefined") {
            console.log("PSK_CONFIG_LOCATION env variable not set. Not able to load any external config. Using default configuration.")
            serverJson = {};
        } else {
            console.log("Trying to read the server.json file from the location pointed by PSK_CONFIG_LOCATION env variable.");
            serverJson = typeof serverConfig === "undefined" ? require(path.join(path.resolve(process.env.PSK_CONFIG_LOCATION), 'server.json')) : '';
        }

        serverConfig = new ServerConfig(serverJson);
    }

    if (!Array.isArray(keys) || !keys) {
        return serverConfig;
    }

    return getSource(keys, serverConfig);
}

function ServerConfig(conf) {
    const defaultConf = require('./default');

    function createConfig(config, defaultConfig) {
        if (typeof config === "undefined") {
            return defaultConfig;
        }

        //ensure that the config object will contain all the necessary keys for server configuration
        for (let mandatoryKey in defaultConfig) {
            if (typeof config[mandatoryKey] === "undefined") {
                config[mandatoryKey] = defaultConfig[mandatoryKey];
            }
        }
        return __createConfigRecursively(conf, defaultConf);

        function __createConfigRecursively(config, defaultConfig) {
            for (let prop in defaultConfig) {
                if (typeof config[prop] === "object" && !Array.isArray(config[prop])) {
                    __createConfigRecursively(config[prop], defaultConfig[prop]);
                } else {
                    if (typeof config[prop] === "undefined") {
                        config[prop] = defaultConfig[prop];
                        __createConfigRecursively(config[prop], defaultConfig[prop]);
                    }
                }
            }
            return config;
        }
    }

    conf = createConfig(conf, defaultConf);
    conf.defaultEndpoints = defaultConf.activeEndpoints;
    return conf;
}

function getSource(arrayKeys, source) {
    if (!arrayKeys.length || source === undefined) {
        return source;
    }

    return getSource(arrayKeys, source[arrayKeys.shift()]);
}

function getTokenIssuers(callback) {
    const fs = require("fs");
    const path = require("swarmutils").path;

    if (tokenIssuers) {
        return callback(null, tokenIssuers);
    }

    if (typeof process.env.PSK_CONFIG_LOCATION === "undefined") {
        tokenIssuers = [];
        return callback(null, tokenIssuers);
    }

    const filePath = path.join(path.resolve(process.env.PSK_CONFIG_LOCATION), "issuers-public-identities");
    console.log(
        `Trying to read the token-issuers.txt file from the location pointed by PSK_CONFIG_LOCATION env variable: ${filePath}`
    );

    fs.access(filePath, fs.F_OK, (err) => {
        if (err) {
            console.log(`${filePath} doesn't exist so skipping it`);
            tokenIssuers = [];
            callback(null, tokenIssuers);
        }

        fs.readFile(filePath, "utf8", function (err, data) {
            if (err) {
                console.error(`Cannot load ${filePath}`, err);
                return;
            }

            const openDSU = require("opendsu");
            const crypto = openDSU.loadApi("crypto");

            tokenIssuers = data.split(/\s+/g).filter((issuer) => issuer).map(issuer => crypto.getReadableSSI(issuer));

            callback(null, tokenIssuers);
        });
    });
}

module.exports = {getConfig, getTokenIssuers}
