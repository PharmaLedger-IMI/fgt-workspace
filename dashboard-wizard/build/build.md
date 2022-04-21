### Bundling
THis Module was developed with ease of test in mind, using node syntax, incompatible with the browsers.

Therefore bundling (via privatesky's implementation of `browserify``) is required.

a configuration placed at `build/build.json` eg:

<pre>
{
  "wizard": {
    "deps": "../../../fgt-dsu-wizard:wizard",
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