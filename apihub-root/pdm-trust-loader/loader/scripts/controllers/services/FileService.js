function FileService() {

	function constructUrlBase(prefix){
		let url;
		let location = window.location;
		const paths = location.pathname.split("/");
		while(paths.length>0){
			if(paths[0]===""){
				paths.shift();
			}else{
				break;
			}
		}
		let applicationName = paths[0];
		prefix = prefix || "";
		url = `${location.protocol}//${location.host}/${prefix}${applicationName}`;
		return url;
	}

	function createRequest(url, method, callback){
		let xhr = new XMLHttpRequest();
		xhr.open(method, url);
		xhr.onload = function() {
			if (xhr.status != 200) {
				callback(`Error ${xhr.status}: ${xhr.statusText}`);
			} else {
				callback(undefined, xhr.response);
			}
		};
		xhr.onerror = function() {
			callback("Request failed");
		};
		return xhr;
	}

	this.getFile = function(url, callback){
		url = constructUrlBase()+"/"+url;
		createRequest(url, "GET", callback).send();
	};

	this.getFolderContentAsJSON = function(url, callback){
		url = constructUrlBase("directory-summary/")+"/"+url;
		createRequest(url, "GET", callback).send();
	}
}

export default FileService;