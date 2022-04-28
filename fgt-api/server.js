const {ROLE, CREDENTIALS_FILE, SWAGGER_SERVER} = process.env;
const fs = require('fs');
const path = require('path');

const currentPath = process.cwd();

if (!ROLE){
    console.log("No ROLE Definition found. Assuming simple APIHUB")
    process.exit(0);
}

console.log(`ENVIRONMENT VARIABLES: ROLE: ${ROLE}, CREDENTIALS_FILE: ${CREDENTIALS_FILE} and SWAGGER_SERVER: ${SWAGGER_SERVER}`)

function failServerBoot(reason){
    console.error("Server boot failed: " + reason);
    process.exit(1);
}

function runCommand(command, ...args){
    const { spawn } = require("child_process");
    const callback = args.pop()

    const spawned = spawn(command, args);

    const log = {
        data: [],
        error: []
    }

    function errorCallback(err, log, callback){
        const error = new Error(`ERROR in child Process: ${err.message || err}\n
                                 -- log: \n${log.data.join("\n")}\n
                                 -- error: \n${log.error.join("\n")}`);
        callback(error)
    }

    spawned.stdout.on("data", data => {
        console.log(data.toString());
        log.data.push(data.toString());
    });

    spawned.stderr.on("data", data => {
        console.log(data.toString());
        log.error.push(data.toString());
    });

    spawned.on('error', (error) => {
        console.log(`error: ${error.message}`);
        errorCallback(error, log, callback);
    });

    spawned.on("close", code => {
        console.log(`child process exited with code ${code}`);
        return code === 0 ? callback(undefined, log) : callback(new Error("exist code " + code), log);
    });

    return spawned;
}

function getWallet(){
    switch (ROLE){
        case "mah":
            return "mah";
        case "whs":
            return 'wholesaler';
        case "pha":
            return "pharmacy";
        default:
            return ROLE;
    }
}

function overWriteCredentialsByRole(){
    fs.copyFileSync(path.join(currentPath, "..", "docker", "api", "env", CREDENTIALS_FILE),
        path.join(currentPath, "config", `fgt-${getWallet()}-wallet`, "credentials.json"))
}

async function bootAPIServer(){
    require(path.join(currentPath, "participants", ROLE, "index.js"));
}

async function bootSwagger(){
    const YAML = require('yamljs');
    const express = require('express');
    const cors = require('cors');
    const swaggerUi = require('swagger-ui-express');

    const config = {
        port: 3009,
        server: SWAGGER_SERVER,
        path: "./swagger/docs",
        participant: ROLE.toUpperCase()
    };
    const PORT = config.port;
    const PATH = config.path;
    const PARTICIPANT = config.participant;
    const API_SERVER = config.server;
    console.log('[FGT-API] Swagger load config=', config);

    const swaggerPathResolve = path.resolve(PATH, PARTICIPANT.toUpperCase() + '.yml');
    const swaggerDocument = YAML.parse(fs.readFileSync(swaggerPathResolve, 'utf8'));
    swaggerDocument.servers = [{url: API_SERVER}];
    const options = {
        customCss: '.swagger-ui .topbar { display: none }'
    };

    const app = express();
    app.use(cors());
    app.use(express.json());

    app.use('/', swaggerUi.serve, swaggerUi.setup(swaggerDocument, options));

    app.get('*', (req, res) => {
        res.redirect('/');
    });

    app.listen(PORT, console.log(`[FGT-API] Swagger API DOC listening on :${PORT} and able to make requests to API: ${API_SERVER}`));
}

try {
    overWriteCredentialsByRole();
    Promise.all([bootAPIServer(), bootSwagger()]).then(_ => console.log(`Completed Boot`)).catch(e => failServerBoot(e.message));
} catch (e){
    failServerBoot(e.message);
}

