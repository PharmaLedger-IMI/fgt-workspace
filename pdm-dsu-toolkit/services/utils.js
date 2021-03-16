/**
 * @module fgt-dsu-wizard.services
 */
let resolver, DSUService;

/**
 * for singleton use
 * @returns {*}
 */
function getResolver(){
	if (!resolver)
		resolver = require('opendsu').loadApi('resolver');
	return resolver;
}

/**
 * for singleton use
 * @returns {DSUService}
 */
function getDSUService(){
	if (!DSUService)
		DSUService = new (require('./DSUService'));
	return DSUService;
}

/**
 * Convenience method to select the appropriate resolver method to use depending on the key
 * @param keySSI
 * @returns {function} the appropriate resolver method for creating dsus {@link resolver#createDSU}/{@link resolver#createDSUForExistingSSI}
 */
function selectMethod(keySSI){
	if (['array', 'const'].indexOf(keySSI.getTypeName()) > -1)
		return getResolver().createDSUForExistingSSI;
	return getResolver().createDSU;
}

/**
 * Util method to recursively create folders from a list.
 * Useful to create mount folders
 * @param {Archive} dsu
 * @param {string[]} folders
 * @param {function(err, string[])} callback the folders there where actually created (didn't already exist)
 */
function createDSUFolders(dsu, folders, callback){
	let created = [];
	let iterator = function(folderList){
		let folder = folderList.shift();
		if (!folder)
			return callback(undefined, created);
		dsu.readDir(folder, (err, files) => {
			if (!err) {
				console.log(`Found already existing folder at ${folder}. No need to create...`)
				return iterator(folderList);
			}
			dsu.createFolder(folder, (err) => {
				if (err)
					return callback(err);
				created.push(folder);
				iterator(folderList);
			});
		});
	}
	iterator(folders.slice());
}

/**
 * Util Method to select POST strategy per DSU api.
 * - Copied from PrivateSky
 * - refactored for server side use compatibility in <strong>tests</strong>
 * @param {string} apiname
 * @returns {doPost} postHandler
 */
function getPostHandlerFor(apiname){

	function getBaseURL() {
		let protocol, host, port;
		try {
			protocol = window.location.protocol;
			host = window.location.hostname;
			port = window.location.port;

		} catch (e){
			// Only used in tests
			if (process.env.BDNS_ROOT_HOSTS)
				return `${process.env.BDNS_ROOT_HOSTS}/${apiname}`;
			protocol = "http:";
			host = "localhost";
			port = "8080";
		}

		return `${protocol}//${host}:${port}/${apiname}`;
	}

	function doPost(url, data, options, callback) {
		const http = require("opendsu").loadApi("http");
		if (typeof options === "function") {
			callback = options;
			options = {};
		}

		if (typeof data === "function") {
			callback = data;
			options = {};
			data = undefined;
		}

		const baseURL = getBaseURL();
		url = `${baseURL}${url}#x-blockchain-domain-request`
		http.doPost(url, data, options, (err, response) => {
			if (err)
				return callback(err);
			callback(undefined, response);
		});
	}
	return doPost;
}

module.exports = {
	getResolver,
	getDSUService,
	getPostHandlerFor,
	selectMethod,
	createDSUFolders
}
