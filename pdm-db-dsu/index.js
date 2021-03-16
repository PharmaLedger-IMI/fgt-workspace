/**
 * @module pdm-db-dsu
 */


/*

class Database {
    get(key);

    set(key, value);

    list(key);
}

class Sender{
    sendMessage(api, key);
}

module.exports = {
    Database,
    Sender
}
*/

module.exports = {
	/**
	 * Exposes DatabaseJson class.
	 */
	DatabaseJson: require("./jsonbased/DatabaseJsonBased"),
};
