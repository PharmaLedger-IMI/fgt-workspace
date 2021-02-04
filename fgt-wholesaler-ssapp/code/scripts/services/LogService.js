import constants from '../constants.js';
import SharedStorage from "./SharedDBStorageService.js";

export default class LogService {

	constructor(dsuStorage) {
		this.storageService = new SharedStorage(dsuStorage);
	}

	log (logDetails, callback) {
		if (logDetails === null || logDetails === undefined) {
			return;
		}
		this.getLogs((err, logs) => {
			if (err) {
				return console.log("Error retrieving logs.")
			}
			logs.push({
				...logDetails,
				timestamp: new Date().getTime()
			});
			this.storageService.setArray(constants.LOGS_TABLE, logs, (err) => {
				if (err) {
					return console.log("Error adding a log.")
				}
				callback(err, true);
			});
		})
	}

	getLogs (callback) {
		this.storageService.getArray(constants.LOGS_TABLE, callback);
	}
}