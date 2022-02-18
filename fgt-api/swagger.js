const {ROLE, CREDENTIALS_FILE, SWAGGER_SERVER} = process.env;
const fs = require('fs');
const path = require('path');


if (!ROLE){
    console.log("No ROLE Definition found. Assuming simple APIHUB")
    process.exit(0);
}

console.log(`ENVIRONMENT VARIABLES: CREDENTIALS_FILE: ${CREDENTIALS_FILE} and SWAGGER_SERVER: ${SWAGGER_SERVER}`)

function failServerBoot(reason){
    console.error("Server boot failed: " + reason);
    process.exit(1);
}

function bootSwagger(){
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
    bootSwagger();
} catch (e){
    failServerBoot(e.message);
}

