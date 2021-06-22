/**
 * This Toolkit proposes a Standard Enterprise DSU SSApp Architecture && Provides the underlying API to handle DSUs
 * in that environment in such a way that approximates the expected of a standard enterprise application
 * @module pdm-dsu-toolkit
 */

/**
 *
 * @typedef {function} KeySSI
 */

/**
 * represents the error object of callback Functions
 * @typedef {string | {}} err
 */

/**
 * Handles interactions with OpenDSU's ApiHub Server
 * @namespace Server
 */

/**
 * Represents OpenDSU's Server object
 * @typedef {*} HttpServer
 */

/**
 * iterates through all the commands in the command folder and registers them
 * Is called by the apihub via the server.json
 * @memberOf Server
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
	Model: require("./model"),
	/**
	 * exposes the Model module
	 */
	Constants: require("./constants")
};
