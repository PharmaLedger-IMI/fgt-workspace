let resolver, DSUService, keyssi;

/**
 * util function to get the env type.
 * Needs openDSU to be loaded to have access to $$ regardless of environment
 * @return {string} the environment type - nodejs or
 * @module Services.utils
 */
function getEnv(){
	return $$.environmentType;
}

/**
 * for singleton use
 * @returns {function} resolver
 * @module Services.utils
 */
function getResolver(){
	if (!resolver)
		resolver = require('opendsu').loadApi('resolver');
	return resolver;
}

/**
 * for singleton use
 * @returns {function} resolver
 * @module Services.utils
 */
function getKeySSISpace(){
	if (!keyssi)
		keyssi = require('opendsu').loadApi('keyssi');
	return keyssi;
}

/**
 * for singleton use
 * @returns {DSUService}
 * @module Services.utils
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
 * @module Services.utils
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
 * @module Services.utils
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

const constants = require('opendsu').constants;
const system = require('opendsu').loadApi('system');

/**
 * Util Method to select POST strategy per DSU api.
 * - Forked from PrivateSky
 * - refactored for server side use compatibility
 * @param {string} apiname
 * @returns {doPost} postHandler
 * @module Services.utils
 */
function getPostHandlerFor(apiname){

	function getBaseURL(){
		switch ($$.environmentType) {
			case constants.ENVIRONMENT_TYPES.SERVICE_WORKER_ENVIRONMENT_TYPE:
				let scope = self.registration.scope;

				let parts = scope.split("/");
				return `${parts[0]}//${parts[2]}`;

			case constants.ENVIRONMENT_TYPES.BROWSER_ENVIRONMENT_TYPE:
				const protocol = window.location.protocol;
				const host = window.location.hostname;
				const port = window.location.port;

				return `${protocol}//${host}:${port}`;

			case constants.ENVIRONMENT_TYPES.WEB_WORKER_ENVIRONMENT_TYPE:
				return self.location.origin;

			case constants.ENVIRONMENT_TYPES.NODEJS_ENVIRONMENT_TYPE:
				let baseUrl = system.getEnvironmentVariable(constants.BDNS_ROOT_HOSTS);
				if (typeof baseUrl === "undefined") {
					baseUrl = "http://localhost:8080";
				} else {
					const myURL = new URL(baseUrl);
					baseUrl = myURL.origin;
				}
				if (baseUrl.endsWith("/")) {
					baseUrl = baseUrl.slice(0, -1);
				}
				return baseUrl;

			default:
		}
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

/**
 * Wrapper around
 * <pre>
 *     OpenDSUSafeCallback(callback)(createOpenDSUErrorWrapper(msg, err));
 * </pre>
 * @param msg
 * @param err
 * @param callback
 * @protected
 * @module Services.utils
 */
const _err = function(msg, err, callback){
	return OpenDSUSafeCallback(callback)(createOpenDSUErrorWrapper(msg, err));
}

/**
 * Utll function that calls the fame function iteratively wit the next arguments (destructive)
 * @param func
 * @param args
 * @module Services.utils
 */
const functionCallIterator = function(func, ...args){
	if (!args || args.length < 1)
		throw new Error("Needs at least a callback");
	args.forEach(a => {
		if (!Array.isArray(a))
			throw new Error("arguments need to be arrays");
	})
	const callback = args.pop();

	const result = []

	const iterator = function(...argz){
		const callback = argz.pop();
		const callArgs = argz.map(a => a.shift()).filter(a => !!a);

		if (callArgs.length !== argz.length)
			callback()
		callArgs.push((err) => err ? callback(err) : iterator(...argz, callback))

		try{
			result.push(func(...callArgs));
		} catch(e){
			return callback(e);
		}
	}

	iterator(...args, (err) => err
		? callback(err)
		: callback(undefined, result));
}


module.exports = {
	getResolver,
	getKeySSISpace,
	getDSUService,
	getPostHandlerFor,
	selectMethod,
	createDSUFolders,
	getEnv,
	_err,
	functionCallIterator
}
