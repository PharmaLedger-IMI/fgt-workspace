
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
	getPostHandlerFor
}
