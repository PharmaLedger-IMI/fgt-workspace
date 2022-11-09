/**
 * Extends the functionality and Architecture to the Use Case's specific Business needs
 * @module fgt-dsu-wizard
 */

/**
 * Handles interactions with OpenDSU's ApiHub Server
 * @namespace Server
 */

const path = require("path");

/**
 * iterates through all the commands in the command folder and registers them
 * Is called by the apihub via the server.json
 */
function Init(server){
	const path = require('path');
	const cmdsDir = path.join(__dirname, "commands");
	require('fs').readdir(cmdsDir, (err, files) => {
		if (err)
			throw err;
		files.filter(f => f !== 'setSSI.js' && f !== 'index.js' && f !== "environment.js").forEach(f => {
			try {
				require(path.join(cmdsDir, f)).command(server);
			} catch (e) {
				console.error(`Failed to boot ${f} api`)
			}
		});
	});
}

module.exports = {
	Init,
	/**
	 * Exposes constants.
	 */
	Constants: require("./constants"),
	 /**
	 * Exposes the Model module
	 */
	Model: require("./model"),
	/**
	 * exposes the Commands module
	 */
	Commands: require("./commands"),
	/**
	 * instantiates a new DSUService
	 */
	DSUService: new (require('./services').DSUService),
	/**
	 * Exposes the Services Module
	 */
	Services: require("./services"),
	/**
	 * Exposes the Managers module
	 */
	Managers: require("./managers"),
    /**
	 * Exposes Version.
	 */
	Version: require("./version"),
};
