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
		files.filter(f => f !== 'setSSI.js').forEach(f => {
			require(path.join(cmdsDir, f)).command(server);
		});
	});
}

module.exports = {
	Init,
	DSUService: new (require('./services/DSUService'))
};
