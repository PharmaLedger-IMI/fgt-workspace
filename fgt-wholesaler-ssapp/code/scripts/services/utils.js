
function getPostHandlerFor(apiname){

	function getBaseURL() {
		const protocol = window.location.protocol;
		const host = window.location.hostname;
		const port = window.location.port;

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
		url = `${baseURL}${url}#x-blockchain-domain-request`;
		http.fetch(url, {
			method: 'POST',
			headers: options.headers,
			body: data
		}).then((response) => {
			return response.text().then((data) => {
				if (!response.ok) {
					return callback(new Error(`Post to ${url} request failed.` + response.statusText));
				}
				callback(undefined, data);
			})
		}).catch(err => {
			return callback(err);
		});
	}
	return doPost;
}
export default {
	getPostHandlerFor
}