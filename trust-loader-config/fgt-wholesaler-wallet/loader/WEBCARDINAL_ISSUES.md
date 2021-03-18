Just to help describe the situation I'm finding with WebCardinal - wholesaler-ssapp:
Right now it has only 3 Controllers

HomeController - base controller
RegistrationController - Handles the modal
IndexController - Hack controller to get around the model setting situation

in each controller's constructor I have the follwoing line right after the super call:
```js
console.log(`The translation model in the ${controllername} controller is: ${WebCardinal.translations.en}`);
```

environment.js:

```js
export default {
  "appName": "Wholesaler Traceability App",
  "vault": "server",
  "agent": "browser",
  "system":   "any",
  "browser":  "any",
  "mode":  "dev-secure",
  "domain":  "vault",
  "sw": true,
  "pwa": true,
  "basePath": "/fgt-wholesaler-wallet/loader/",
  "legenda for properties": " vault:(server, browser) agent:(mobile,  browser)  system:(iOS, Android, any) browser:(Chrome, Firefox, any) mode:(autologin,dev-autologin, secure, dev-secure) sw:(true, false) pwa:(true, false)"
}
```

manifest.webmanifest
```
(...)
  ],
  "start_url": "/fgt-wholesaler-wallet/loader/",
  "scope": "/fgt-wholesaler-wallet/loader/"
}
```


## Situation 1:

I use the index as a fallback, and the index controoler sends to the /home page.

Really ugly hack

I use webcardinal.json:
```json
{
  "identity": {
    "avatar": "/resources/images/mah.jpeg",
    "name": " ",
    "email": " "
  },
  "theme": "pdm-theme",
  "pagesFallback": {
    "name": "indexOld",
    "path": "./indexold.html"
  },
  "pages": [
    {
      "name": "Home",
      "path": "/home",
      "src": "home.html",
      "indexed": false,
      "tag": "home"
    }
  ]
}
```

The console reads (without any errors):
```
The index model in the registration controller is: undefined
(...)
The translation model in the Home controller is: [object Object]
(...)
The translation model in the registration controller is: [object Object]
```

The ugly hack works.

## Situation 2:

I Follow the the way it's supposed to be:

with the same environment and manifest files, i use the following webcardinal.json:
```json
{
  "identity": {
    "avatar": "/resources/images/mah.jpeg",
    "name": " ",
    "email": " "
  },
  "theme": "pdm-theme",
  "pagesFallback": {
    "name": "404",
    "path": "./404.html"
  },
  "pages": [
    {
      "name": "Home",
      "path": "/",
      "src": "home.html",
      "indexed": false,
      "tag": "home"
    }
  ]
}
```
