self.addEventListener('activate',  (event) => {
    event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
    let url = event.request.url;
    let newUrl = url;

    if (url.indexOf("/iframe/") !== -1) {
        let urlParts = url.split("/iframe/");
        if (urlParts.length === 2){
            let basePath = urlParts[0];
            newUrl = basePath + "/assets/app-loader/app-loader.html";
        }
    }

    event.respondWith(fetch(newUrl));
});
