### Workspace Description
#### pre-install (before running npm install)

* apihub-root: Folder containing the root of what is served by the server
    * external-volume: configs directory;
    * internal-volume: volume folder (brick storage). contains the several configured domains
    * wallet patch folders: the folders contain, in the wallet-patch folder and for each case, the custom 'behaviour' that is added to the template folder:
        * fgt-mah-wallet/wallet-patch;
        * fgt-pharmacy-wallet/wallet-patch;
        * fgt-wholesaler-wallet/wallet-patch;
* fgt-dsu-wizard: based on gtin-dsu-wizard
* fgt-mah-wallet
* fgt-pharmacy-wallet
* fgt-wholesaler-wallet
    * Wallets for each one of the actors
* trust-loader-config: custom config to override the wallet loader default ones for each case:
    * fgt-mah-fabric-wallet/loader;
    * fgt-pharmacy-fabric-wallet/loader;
    * fgt-wholesaler-fabric-wallet/loader;

#### post install (after running npm install)

* General use:
    * cardinal: the web framework used for frontend;
    * pharmaledger-wallet: the default wallet implementation to be used by all ssapps - comes from http://github.com/privatesky/menu-wallet-prototype.git
    * node_modules: node modules folder (includes the octopus custom builder)
    * privatesky: the openDSU code. notable folders are:
        * privatesky/modules: all the code for the several modules (openDSU is one of them);
        * privatesky/psknode/bundles: all the code from the previous path, with each module bundled into a single file;
    * themes: the folder with all the installed themes:
        * pharmaledger-theme: custom theme for the pharmaledger implementation comes from https://github.com/PrivateSky/blue-fluorite-theme;
* Use case related:
    * Apihub-root: Folder changes:
        * wallet loaders: clones the loader into each of the wallets:
            * fgt-mah-wallet/loader;
            * fgt-pharmacy-wallet/loader;
            * fgt-wholesaler wallet/loader;
    * fgt-mah-ssapp: The application for the Mah;
    * fgt-pharmacy-ssapp: The application for the pharmacy;
    * fgt-wholesaler-ssapp: The application for the wholesaler;
    * gtin-dsu-wizard: the ssapp the creates GTIN based DSUs. *Cloned from epi*;
    * gtin-resolver: the 'library' to resolve gtin+batchs to dsus. *Cloned from epi*;
