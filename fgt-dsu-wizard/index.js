/**
 * @module fgt-dsu-wizard
 */

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
		files.filter(f => f !== 'setSSI.js' && f !== 'index.js').forEach(f => {
			require(path.join(cmdsDir, f)).command(server);
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
