
const defaultConfig = {
    "storage":  require("swarmutils").path.join(process.env.PSK_ROOT_INSTALATION_FOLDER, "tmp"),
    "sslFolder":  require("swarmutils").path.join(process.env.PSK_ROOT_INSTALATION_FOLDER, "conf", "ssl"),
    "port": 8080,
    "host": "0.0.0.0",
    "zeromqForwardAddress": "tcp://127.0.0.1:5001",
    "preventRateLimit": false,
    // staticServer needs to load last
    "activeEndpoints": ["virtualMQ", "messaging", "notifications", "filesManager", "bdns", "bricksLedger", "bricking", "anchoring", "bricksFabric", "dsu-wizard", "staticServer"],
    "endpointsConfig": {
        "messaging": {
            "module": "./components/mqManager",
            "workingDirPath": "./messaging",
            "storageDirPath": "./messaging/storage"
        },
        "notifications": {
            "module": "./components/keySsiNotifications",
            "workingDirPath": "./notifications"
        },
        "virtualMQ": {
            "module": "./components/channelManager",
            "channelsFolderName": "channels",
            "maxSize": 100,
            "tokenSize": 48,
            "tokenHeaderName": "x-tokenHeader",
            "signatureHeaderName": "x-signature",
            "enableSignatureCheck": true
        },
        "dsu-wizard": {
            "module": "dsu-wizard",
            "function": "initWizard",
            "storage": "./external-volume/dsu-wizard/transactions",
            "workers": 5,
            "bundle": "./../privatesky/psknode/bundles/openDSU.js"
        },
        "bdns": {
            "module": "./components/bdns",
        },
        "bricking": {
            "module": "./components/bricking",
            "domains": {
                "default": {
                    "path": "/internal-volume/domains/default/brick-storage"
                },
                "predefined": {
                    "path": "/internal-volume/domains/predefined/brick-storage"
                },
                "vault": {
                    "path": "/internal-volume/domains/vault/brick-storage"
                }
            }
        },
        "filesManager": {
            "module": "./components/fileManager"
        },
        "bricksFabric": {
            "module": "./components/bricksFabric",
            "path": "./",
            "domainStrategies": {
                "default": {
                    "name": "BrickStorage",
                    "option": {
                        "timeout": 15000,
                        "transactionsPerBlock": 5
                    }
                }
            }
        },
        "anchoring": {
            "module": "./components/anchoring",
            "domainStrategies": {
                "default": {
                    "type": "FS",
                    "option": {
                        "path": "/internal-volume/domains/default/anchors",
                        "enableBricksLedger": false
                    },
                    "commands": {
                        "addAnchor": "anchor"
                    }

                },
                "predefined": {
                    "type": "FS",
                    "option": {
                        "path": "/internal-volume/domains/predefined/anchors"
                    }
                },
                "vault": {
                    "type": "FS",
                    "option": {
                        "path": "/internal-volume/domains/vault/anchors"
                    }
                }
            }
        },
        "staticServer": {
            "module": "./components/staticServer"
        },
        "bricksLedger": {
            "module": "./components/bricksLedger",
            "doAnchor": "anchorCommand.js",
            "doEPIAnchor": "EPIAnchorCommand.js"
        }
    },
    "tokenBucket": {
        "cost": {
            "low": 10,
            "medium": 100,
            "high": 500
        },
        "error": {
            "limitExceeded": "error_limit_exceeded",
            "badArgument": "error_bad_argument"
        },
        "startTokens": 6000,
        "tokenValuePerTime": 10,
        "unitOfTime": 100
    },
    "enableInstallationDetails": true,
    "enableRequestLogger": true,
    "enableAuthorisation": false,
    "enableLocalhostAuthorization": false,
    "skipAuthorisation": [
        "/leaflet-wallet",
        "/anchor",
        "/bricking",
        "/bricksFabric",
        "/bricksledger",
        "/create-channel",
        "/forward-zeromq",
        "/send-message",
        "/receive-message",
        "/files",
        "/notifications",
        "/mq"
    ],
    "iframeHandlerDsuBootPath": "./psknode/bundles/nodeBoot.js"
};

module.exports = Object.freeze(defaultConfig);