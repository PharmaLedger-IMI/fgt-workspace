## Install and enable DSU Explorer

The DSU Explorer allows that encrypted data to be decrypted and explored as long as you have the seedSSI's. To enable it you need to install its dependencies:
```sh
$ npm run install-dsu-explorer
```

After running it, `dossier-explorer-wallet-prototype` and `dossier-explorer-ssapp` folders will be created on `fgt-workspace`, to build and make it available under `apiHub-root` run:

```sh
$ npm run build-dsu-explorer
```

Restart the `apiHub server` if already running.