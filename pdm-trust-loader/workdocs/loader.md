## SSApp Loading and Configuration

### PWA capabilities
The current setup is configured to ensure that the web application is 100% compatible with the PWA standard.
For a detailed guide please check [here](https://github.com/Axiologic/wpa-demo1/blob/gh-pages-guide/index.md).

#### Development flow
**!!! To ensure a correct functionality, anytime a static file changes inside the current project, a new service worker must be generated. !!!**
The service worker keeps a list of each file that is registered for caching (defined inside *workbox-config.js*) along with its revision. 
The file revision represents a hash generated based on the file content.
The following command must be run after any of the tracked file changes:

```
npm run build
```

#### Changes that must be made on the current setup

- Every time the URL at which the application is available changes, the following changes must be made:
    1. **manifest.webmanifest**
    - **scope**: defines the navigation scope of this web application's context
        - usually it's the root URL, e.g.: */secure-channels/loader/*
        - if the scope is a relative URL, the base URL will be the URL of the manifest.
    - **start_url**: represents the start URL of the web application
        - cannot be outside of scope, usually it's the same as **scope**, e.g.: */secure-channels/loader/*
        - if the URL is relative, the manifest URL is used as the base URL to resolve it.
    2. **index.html**
    - when the service worker is registered, the **scope** should be the same as the **scope** defined inside **manifest.webmanifest**
    - the line `const wb = new Workbox("swPwa.js", { scope: "/secure-channels/loader/" });` should have the correct scope specified

- Every time the color scheme and/or application images changes, the following changes must be made:
    - **manifest.webmanifest**
        - **icons**
        - **background_color**
        - **theme_color**
    - **index.html**
        - meta **theme-color**
        - links rel="apple-touch-icon"
        - links ref="apple-touch-startup-image"

- In order to detect when a service worker must update its cached files, a regular check is made in order to see if another service worker is available. Each time an update is available, the user will receive a confirmation popup notifying him that a new update is available and to confirm if he wants to reload in order to see the changes. In the current setup the check is done every minute. In order to change the confirmation popup, the `showNewContentAvailable` method should be changed inside **index.html**. To change the check interval, inside the **index.html** file the following should be updated:

```
setInterval(() => {
  wb.update();
}, 60 * 1000);
```