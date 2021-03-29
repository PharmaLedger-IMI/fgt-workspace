/**
 * This Toolkit proposes a Standard Enterprise DSU SSApp Architecture && Provides the underlying API to handle DSUs in that environment
 * @namespace pdm-dsu-toolkit
 */

/**
 * Util functionality for model objects
 * @namespace pdm-dsu-toolkit.model
 * @property {module:model} Model
 */

/**
 * Integration with Webcardinal and Ionic Components for 2 way binding and form validation
 * @namespace pdm-dsu-toolkit.model.validations
 * @property {module:validations} Validations
 */

/**
 * Logic layer in a DSU Enterprise SSApp Environment
 * @namespace pdm-dsu-toolkit.managers
 * @property {module:managers} Managers
 */

/**
 * DAO Layer in DSU creation
 * @namespace pdm-dsu-toolkit.services
 * @property {module:services} Services
 */

/**
 * Integration with Webcardinal's translation API to manage localization
 * @namespace pdm-dsu-toolkit.locale
 * @property {module:locale} Locale
 */

/**
 * Integration with OpenDSU's ApiHub
 * @namespace pdm-dsu-toolkit.server
 * @property {module:server} Server
 */

/**
 * Util methods
 * @namespace pdm-dsu-toolkit.utils
 * @property {module:utils} Utils
 */

/**
 * Provides a Environment Independent and Versatile Dossier Building API.
 *
 * Meant to be integrated into OpenDSU
 * @namespace pdm-dsu-toolkit.dt
 * @property {module:dt} dt
 */

/**
 * iterates through all the commands in the command folder and registers them
 * Is called by the apihub via the server.json
 * @module server
 */
function Init(server){
	const path = require('path');
	const cmdsDir = path.join(__dirname, "commands");
	require('fs').readdir(cmdsDir, (err, files) => {
		if (err)
			throw err;
		files.filter(f => f !== 'setSSI.js' && f !== 'index.js').forEach(f => {
			require(path.join(cmdsDir, f)).command(server);
		});
	});
}

module.exports = {
	Init,
	/**
	 * exposes the Commands module
	 */
	Commands: require("./commands"),
	/**
	 * Exposes the Services Module
	 */
	Services: require("./services"),
	/**
	 * Exposes the Managers module
	 */
	Managers: require("./managers"),
	/**
	 * exposes the Model module
	 */
	Model: require("./model")
};
