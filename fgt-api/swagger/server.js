const path = require('path');
const YAML = require('yamljs');
const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');

const config = require('./config');
const PORT = config.port;
const PATH = config.path;
const PARTICIPANT = config.participant;
console.log('[FGT-API] Swagger load config=', config);

const swaggerPathResolve = path.resolve(PATH, PARTICIPANT + '.yml');
const swaggerDocument = YAML.load(swaggerPathResolve);
const options = {
    customCss: '.swagger-ui .topbar { display: none }'
};

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, options));

app.get('*', (req, res) => {
    res.redirect('/api-docs');
});

app.listen(PORT, console.log(`[FGT-API] Swagger API DOC listening on ${PORT}`));