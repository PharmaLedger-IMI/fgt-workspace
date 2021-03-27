# PDM's DSU Toolkit
Proposes a Standardized Architecture for SSApps and provides the base implementation for that architecture.

[![Build Status](https://travis-ci.org/{ORG-or-USERNAME}/{REPO-NAME}.png?branch=master)](https://travis-ci.org/{ORG-or-USERNAME}/{REPO-NAME})
[![JavaScript Style Guide: Good Parts](https://img.shields.io/badge/code%20style-goodparts-brightgreen.svg?style=flat)](https://github.com/dwyl/goodparts "JavaScript The Good Parts")
[![Known Vulnerabilities](https://snyk.io/test/github/dwyl/hapi-auth-jwt2/badge.svg?targetFile=package.json)](https://snyk.io/test/github/dwyl/hapi-auth-jwt2?targetFile=package.json)


[SSApp Architecture](resources/drawings/finishedGoodsTraceabilityDSUTypes-BaseSSAppArchitecture.png)

### Bundling
THis Module was developed with ease of test in mind, using node syntax, incompatible with the browsers.

Therefore bundling (via privatesky's implementation of `browserify``) is required.

a configuration placed at `build/build.json` eg:

<pre>
{
  "toolkit": {
    "deps": "../../../pdm-dsu-toolkit:toolkit",
    "autoLoad":  true
  }
}
</pre>

used by the bundle command in `octopus.json`:

<pre>
"prebuild": [
    {
      "name": "Bundles",
      "src": "",
      "actions": [
        {
          "type": "execute",
          "cmd": "node ../privatesky/psknode/bin/scripts/pskbuild.js --projectMap=./build/build.json  --prod=true --output=./build/bundles"
        },
        {
          "type": "remove",
          "target": "./builds"
        }]
    }
</pre>

outputs the `build/bundles/wizard.js` 
bundle file that will then be copied onto each ssapp during their own build processes.
