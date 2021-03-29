/**
 * @module dt
 */

/**
 * Forked from PrivateSky
 * Provides an environment independent file service to the {@link AppBuilderService}
 */
function FileService(options) {
    const isBrowser = $$.environmentType === 'browser';

    function constructUrlBase(prefix){
        let url, protocol, host;
        prefix = prefix || "";
        let appName = '';
        if (isBrowser){
            let location = window.location;
            const paths = location.pathname.split("/");
            while (paths.length > 0) {
                if (paths[0] === "") {
                    paths.shift();
                } else {
                    break;
                }
            }
            appName = paths[0];
            protocol = location.protocol;
            host = location.host;
            url = `${protocol}//${host}/${prefix}${appName}`;
            return url;
        } else {
            return `http://${options.hosts}/${prefix}${options.walletPath}`;
        }
    }

    this.getWalletSeed = function(callback){
        this.getAppSeed(options.slots.primary, callback);
    }

    this.getAppSeed = function(appName, callback){
        this.getFile(appName, options.seedFileName, (err, data) => {
            if (err)
                return OpenDSUSafeCallback(callback)(createOpenDSUErrorWrapper(err));
           Utf8ArrayToStr(data, callback);
        });
    }

    function doGet(url, options, callback){
        if (typeof options === "function") {
            callback = options;
            options = {};
        }

        const http = require("opendsu").loadApi("http");
        http.fetch(url, {
            method: 'GET'
        }).then((response) => {
            return response.arrayBuffer().then((data) => {
                if (!response.ok)
                    return callback("array data failed")
                callback(undefined, data);
            }).catch(e => callback(e));
        }).catch(err => callback(err));
    }

    /**
     * Returns the content of a file as a uintArray
     * @param {string} appName
     * @param {string} fileName
     * @param {function(err, U8intArray)} callback
     */
    this.getFile = function(appName, fileName, callback){
        const suffix = `${appName}/${fileName}`;
        const base = constructUrlBase();
        const joiner = suffix && base[base.length - 1] !== '/' && suffix[0] !== '/'
            ? '/'
            : '';

        let url = base + joiner + suffix;
        doGet(url, callback);
    };


    /**
     *
     * @param innerFolder
     * @param callback
     */
    this.getFolderContentAsJSON = function(innerFolder, callback){
        if (typeof innerFolder === 'function'){
            callback = innerFolder;
            innerFolder = undefined;
        }
        let url = constructUrlBase("directory-summary/") + (innerFolder ? `/${innerFolder}` : '') ;
        doGet(url, (err, data) => {
            if (err)
                return OpenDSUSafeCallback(callback)(createOpenDSUErrorWrapper(err));
            Utf8ArrayToStr(data, callback);
        });
    }

    /**
     * Util method to convert Utf8Arrays to Strings in the browser
     * (simpler methods fail for big content jsons)
     * @param {U8intArray} array
     * @param {function(err, string)} callback
     */
    function Utf8ArrayToStr(array, callback) {
        if (!isBrowser)
            return callback(undefined, array.toString());
        var bb = new Blob([array]);
        var f = new FileReader();
        f.onload = function(e) {
            callback(undefined, e.target.result);
        };
        f.readAsText(bb);
    }
}

module.exports = FileService;