function FileService() {

    function constructUrlBase(appName, prefix){

        let url, protocol, host;
        prefix = prefix || "";
        try {
            let location = window.location;
            const paths = location.pathname.split("/");
            while (paths.length > 0) {
                if (paths[0] === "") {
                    paths.shift();
                } else {
                    break;
                }
            }
            appName = appName || paths[0];
            protocol = location.protocol;
            host = location.host;
        } catch (e)
        {
            // Only used in tests
            if (process.env.BDNS_ROOT_HOSTS)
                return `${process.env.BDNS_ROOT_HOSTS}/${prefix}${appName}`;
            protocol = "http:";
            host = "localhost:8080";
        }
        url = `${protocol}//${host}/${prefix}${appName}`;
        return url;
    }

    function doGet(url, options, callback){
        const http = require("opendsu").loadApi("http");
        if (typeof options === "function") {
            callback = options;
            options = {};
        }

        http.fetch(url, {
            method: 'GET'
        }).then((response) => {
            return response.arrayBuffer().then((data) => {
                if (!response.ok){
                    console.log("array buffer not ok");
                    return callback("array data failed")
                }
                callback(undefined, data);
            }).catch(e => {
               return callback(e);
            });
        }).catch(err => {
            return callback(err);
        });
    }

    this.getFile = function(appName, url, callback){
        url = constructUrlBase(appName)+"/"+url;
        doGet(url, callback);
    };

    this.getFolderContentAsJSON = function(appName, url, callback){
        url = constructUrlBase(appName,"directory-summary/")+"/"+url;
        doGet(url, callback);
    }
}

module.exports = FileService;