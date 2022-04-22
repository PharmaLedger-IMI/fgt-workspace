
const METHODS = {
    CREATE: "create",
    CREATE_ALL: "createAll",
    GET: "get",
    GET_ALL: "getAll",
    UPDATE: "update",
    UPDATE_ALL: "updateAll",
    DELETE: "delete",
    DELETE_ALL: "deleteAll"
}

/**
 * @param {string} endpoint
 */
class ApiStorage {

    constructor(endPoint) {
        this.endPoint = endPoint;
    }

    setToken(token){
        this.securityToken = btoa(token);
    }

    __getUrl(tableName, method, pathParams, ...params){
        let url = `${this.endPoint}/${tableName}/${method}`;
        if (params && params.length)
            url = `${url}/${params.join("/")}`
        if (pathParams)
            url = url + `?${Object.entries(pathParams).map(([key, value]) => `${key}=${value}`).join("&")}`
        return encodeURI(url);
    }

    __createRequest(url, verb, body){
        const headers = new Headers();
        if (this.securityToken)
            headers.append('Authorization', 'Basic ' + this.securityToken)
        const options = {
            method: verb.toUpperCase(),
            headers: headers,
            mode: "cors",
            body: body ? JSON.stringify(body) : undefined
        }

        return fetch(url, options);
    }

    __executeRequest(requestPromise, callback){
        Promise.resolve(requestPromise).then(async (response) => {
            if (!response.ok)
                return callback(response.status);
            try {
                response = await response.json();
            } catch (e) {
                return callback(e)
            }
            callback(undefined, response);
        }).catch(e => callback(e));
    }

    getRecord(tableName, key, callback){
        const url = this.__getUrl(tableName, METHODS.GET, undefined, ...(Array.isArray(key) ? key : [key]));
        const request = this.__createRequest(url, "get")
        this.__executeRequest(request, callback);
    }

    insertRecord(tableName, key, record, callback){
        const url = this.__getUrl(tableName, METHODS.CREATE);
        const request = this.__createRequest(url, "post", record);
        this.__executeRequest(request, callback);
    }

    insertRecords(tableName, keys, records, callback){
        const url = this.__getUrl(tableName, METHODS.CREATE_ALL);
        const request = this.__createRequest(url, "post", records);
        this.__executeRequest(request, callback);
    }

    updateRecord(tableName, key, newRecord, callback){
        const url = this.__getUrl(tableName, METHODS.UPDATE, undefined, ...(Array.isArray(key) ? key : [key]));
        const request = this.__createRequest(url, "put", newRecord);
        this.__executeRequest(request, callback);
    }

    /**
     *
     * @param {string} tableName
     * @param query
     * @param sort
     * @param limit
     * @param [props]
     * @param callback
     */
    query(tableName, query, sort, limit, props, callback){
        if (!callback){
            callback = props;
            props = {};
        }
        const url = this.__getUrl(tableName, METHODS.GET_ALL, Object.assign({}, {
            query: JSON.stringify(query),
            sort: sort,
            limit: limit
        }, props));
        const request = this.__createRequest(url, "get")
        this.__executeRequest(request, callback);
    }

    deleteRecord(tableName, key, callback){
        callback();
    }
}

module.exports = {
    METHODS,
    ApiStorage
}