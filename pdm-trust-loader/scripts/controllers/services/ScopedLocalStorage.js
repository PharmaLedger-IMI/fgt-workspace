function ScopedLocalStorage() {

	let lsNativeSetItem = localStorage.setItem.bind(localStorage);
	let lsNativeGetItem = localStorage.getItem.bind((localStorage));
	let lsNativeRemoveItem = localStorage.removeItem.bind((localStorage));

	this.setLocalStorageScope = function () {

		let currentLocation = window.location.pathname;

		if (currentLocation.endsWith("/")) {
			currentLocation = currentLocation.slice(0, currentLocation.length - 1);
		}

		let currentLocationSegments = currentLocation.split("/");
		let currentPage = currentLocationSegments[currentLocationSegments.length - 1];

		let isNotLandingPage = Object.keys(LOADER_GLOBALS.APP_PATHS).some((pathKey) => {
			let path = LOADER_GLOBALS.APP_PATHS[pathKey];
			path = path.replace(/^\/|\/$/g, '');
			return path.length && path === currentPage;
		});

		let deleteIndex = currentLocationSegments.length - 1;
		if (isNotLandingPage) {
			deleteIndex = currentLocationSegments.length - 2;
		}

		let appDir = currentLocationSegments.splice(0, deleteIndex).join("/");

		localStorage.setItem = function (key, value) {
			let scopedKeyName = key + ":" + appDir;
			lsNativeSetItem(scopedKeyName, value);
		};

		localStorage.getItem = function (key) {
			let scopedKeyName = key + ":" + appDir;
			return lsNativeGetItem(scopedKeyName)
		};

		localStorage.removeItem = function (key) {
			let scopedKeyName = key + ":" + appDir;
			lsNativeRemoveItem(scopedKeyName)
		};
	};

}

export default new ScopedLocalStorage();
