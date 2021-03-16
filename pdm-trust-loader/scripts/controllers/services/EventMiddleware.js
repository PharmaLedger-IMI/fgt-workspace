function EventMiddleware(iframe, identity) {

	let queriesHandlers = {};
	let statusesHandlers = {};


	window.document.addEventListener(identity, eventHandler);

	function eventHandler(event) {

		const data = event.detail || {};

		if (typeof data.query === "string") {
			if (!queriesHandlers[data.query]) {
				console.error(`Error: Query [${data.query} could not be resolved. Did you added registered a handler for it?]`);
				return;
			}

			let handlerResponse = queriesHandlers[data.query](data);

			if (!(handlerResponse instanceof Promise)) {
				handlerResponse = Promise.resolve(handlerResponse);
			}

			return handlerResponse.then((responseData) => {
				iframe.contentWindow.document.dispatchEvent(new CustomEvent(identity, {
					detail: responseData
				}));
			})
		}

		if (typeof data.status === "string") {
			if (!statusesHandlers[data.status]) {
				//console.error(`Error: Status [${data.status} could not be resolved. Did you added registered a handler for it?]`);
				return;
			}

			return statusesHandlers[data.status](data);
		}

	}


	this.registerQuery = function (query, callback) {
		if(typeof callback !== "function"){
			throw new Error("[EventMiddleware.addCommand] Callback is not a function");
		}
		queriesHandlers [query] = callback;
	};

	this.unregisterQuery = function (query) {
		if(queriesHandlers[query]){
			delete queriesHandlers[query];
		}
	};

	this.onStatus = function(status,callback){
		if(typeof callback!=="function"){
			throw new Error("[EventMiddleware.onStatus] Callback is not a function");
		}
		statusesHandlers[status] = callback;
	};

	this.offStatus = function(status){
		if(statusesHandlers[status]){
			delete statusesHandlers[status];
		}
	};
}

export default EventMiddleware;
