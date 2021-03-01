/**
 * iterates through all the commands in the command folder and registers them
 * Is called to
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
	Model: require("./model"),
	Commands: require("./commands"),
	DSUService: new (require('./services/DSUService')),
	Services: require("./services"),
};
