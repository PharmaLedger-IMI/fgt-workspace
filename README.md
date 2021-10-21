# UC3 Finished Goods Traceability fgt-workspace

[![GitHub license](https://img.shields.io/github/license/PharmaLedger-IMI/fgt-workspace?style=plastic)](https://github.com/PharmaLedger-IMI/fgt-workspace/blob/master/LICENSE.md)
[![GitHub issues](https://img.shields.io/github/issues/PharmaLedger-IMI/fgt-workspace?style=plastic)](https://github.com/PharmaLedger-IMI/fgt-workspace/issues)
[![GitHub stars](https://img.shields.io/github/stars/PharmaLedger-IMI/fgt-workspace?style=plastic)](https://github.com/PharmaLedger-IMI/fgt-workspace/stargazers)
[![Build Status](https://travis-ci.org/{ORG-or-USERNAME}/{REPO-NAME}.png?branch=master)](https://travis-ci.org/{ORG-or-USERNAME}/{REPO-NAME})
[![JavaScript Style Guide: Good Parts](https://img.shields.io/badge/code%20style-goodparts-brightgreen.svg?style=flat)](https://github.com/PharmaLedger-IMI/fgt-workspace/goodparts "JavaScript The Good Parts")
[![Known Vulnerabilities](https://snyk.io/test/github/dwyl/hapi-auth-jwt2/badge.svg?targetFile=package.json)](https://github.com/PharmaLedger-IMI/fgt-workspace/hapi-auth-jwt2?targetFile=package.json)

![](https://img.shields.io/endpoint?url=https://api.keyvalue.xyz/9f895049/coverage&style=plastic)
![](https://img.shields.io/endpoint?url=https://api.keyvalue.xyz/9f895049/coverage&style=plastic)
![](https://img.shields.io/endpoint?url=https://api.keyvalue.xyz/9f895049/coverage&style=plastic)

*fgt-workspace*  bundles all the necessary dependencies for building and running Finished Goods Traceability SSApps in a single package.

( This workspace was originally forked from the https://github.com/PharmaLedger-IMI/epi-workspace )

[Documentation Page](https://pharmaledger-imi.github.io/fgt-workspace/)

### Licence

MIT License

Copyright (c) 2021 PharmaLedger Consortium 

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.


### Running
To run the application launch your browser (preferably Chrome) in Incognito mode and access the http://localhost:8080 link.

You will be present with a menu from where you can choose the SSApp you with to launch

# Modules

[PDM-DSU-Toolkit](pdm-dsu-toolkit/index.html)

[FGT DSU Wizard](fgt-dsu-wizard/index.html)

[Web Components](pdm-web-components/index.html)

[MAH Enterprise Wallet](fgt-mah-ssapp/index.html)

[Wholesaler Wallet](fgt-wholesaler-ssapp/index.html)

[Pharmacy Wallet](fgt-mah-ssapp/index.html)

### Architecture

#### Concrete SSApp Architecture

SSApps built under the PDM Architecture present the following structure:

![Current SSApp Architecture](resources/drawings/finishedGoodsTraceabilityDSUTypes-BaseSSAppArchitecture.png)

Please note the following elements:

 - Id DSU: Holds some the registration information (the public parts);
 - Participant const DSU: A readOnly DSU with a reference to the ID DSU also in readOnly. This allows the key to this DSU to be shared, and its info to be used to generate the specific DID for that participant enabling him ti send/received messages.
 - DB DSU: Specific DSU Database implementation DSU, allowing for querying and storing information. Can be replaced by a Classical Database implementation if desired;
 - Code: this folder if mounted in read-only and contains the base code for the web application (javascript, html etc)


That Structure is achieve during the build process of the SSApp, which happens following a registration.

By registering, you are deterministically generating a KeySSI from the provided registrations details, 
and using it to anchor a new DSU to the blockchain, containing all the necessary code to run the application
(by mounting the SSApp template DSU in read-only).

To achieve this necessary structure, a small scripting language was developed, 
so the build script could be incorporated into the SSApp code, and for the Architecture presented above
look like: 

```shell
define $ID$ -$Identity-
define $ENV$ -$Environment-

with createdsu seed traceability specificstring
    define $SEED$ getidentifier
    createfile info $ID$
endwith

createfile environment.json $ENV$
mount $SEED$ /id

with $SEED$
    define $READ$ derive
endwith

define $SECRETS$ objtoarray $ID$

with createdsu const traceability $SECRETS$
    mount $READ$ /id
    define $CONST$ getidentifier
endwith

mount $CONST$ /participant

with createdsu seed traceability innerdb
    define $INNER$ getidentifier
endwith

with createdsu seed traceability fordb
    mount $INNER$ /data
    define $DB$ getidentifier
endwith

mount $DB$ /db
```

The documentation for the Scripting language and build process can be found in the pdm-dsu-toolkit module.

Both the Pharmacy and Wholesaler SSApp present the following structure:

![Ex: Wholesaler SSApp](resources/drawings/finishedGoodsTraceabilityDSUTypes-WholesalerSSAppArchitecture.png)

While the MAH one will have 3 more managers, for Products, Batches and ShipmentLines

### DSU Types

In the link bellow please find the main DSU types currently in use and how they relate to each other

![DSU Constitution](resources/drawings/finishedGoodsTraceabilityDSUTypes-DSUTypes.png)

### Environment Definition

In the link bellow please find the Environment definition

![Environment](resources/drawings/finishedGoodsTraceabilityDSUTypes-Deployment.png)







### Traceability

#### On the Batch Level

By always transmitting to the manufacturer of each Product, the shipmentLines on a batch level, and by chaining this information,
we can, without change to the existing wholesaler processes other than a simple API call, upon the sale/administration
of a product, recreate the chain of custody back to the manufacturer with a variable degree of confidence,
depending on how many different shipments of a single gtin/batch combination each participant has received.

This will also allow the manufacturer to know the stock of his products/batches in each participant.

#### Batch Recall

After obtaining the aforementioned traceability on the batch level, the batch Recall feature will be implemented, where 
upon an action by the manufacturer, each participant with any stock of the product/batch will be warned of the recall, 
so they can adapt their processes accordingly.

### Installation

In order to use the workspace, we need to follow a list of steps presented below.

[![Node version](https://img.shields.io/node/v/[fgt-workspace].svg?style=flat)](http://nodejs.org/download/)

#### Step 1: Clone the workspace

```sh
$ git clone https://github.com/PharmaLedger-IMI/fgt-workspace.git
```

After the repository was cloned, you must install all the dependencies.

For the latest versions do:
```sh
$ cd fgt-workspace
#Important: If you plan to contribute to the project and/or dependecies please set DEV:true
#in the file env.json before you run the installation!
$ npm run dev-install
```

For latest 'stable' version do:
```sh
$ npm run install
```
instead.

**Note:** this command might take quite some time depending on your internet connection and you machine processing power.

#### Step 2: Launch the "server"

While in the *fgt-workspace* folder run:

```sh
$ npm run server
```

At the end of this command you get something similar to:

![alt text](resources/scr-npm-run-server.png)

#### Step 3: Build all DSUs and anchor them to the 'blockchain'.

Open a new console inside *fgt-workspace* folder and run:

```sh
# Note: Run this in a new console inside "fgt-workspace" folder
$ npm run build-all
```

#### Step 4: Build Environment (optional).

Open a new console inside *fgt-workspace* folder and run:
- For a test environment setup (random data/credentials): ```npm run environment-trace```;
- For *THE* test setup (with predefined credentials/data): ```npm run environment-test```;


### Documentation

To be able to generate the documentation for this project via

```sh
$ npm run docs
```

[draw.io](https://github.com/jgraph/drawio-desktop/releases) must be installed. Can be also obtained via

```sh
$ snap install drawio
```

in linux

after instalation if not present, add drawio to path

```shell
$ which drawio
```

add a file under ```docs/bin``` called ```drawio_exec_command.os``` containing the command/path to execute drawio

 - Linux:
    ```echo "drawio"```
 - Windows:
    ```echo "${PATH_TO_DRAW_IO}\drawio.exe"```


### Deploy and test with a local blockchain

- (optional) clean 'fake' blockchain: ```npm run clean```
- stop the server;
- run ```npm run deploy-test-chain```. This will build a local blockchain infrastrucure and point the tracebility
  domain anchoring to that blockchain;
- run ```npm run server``` to load the server with the new settings;
- run ```npm run build-all``` to build the environment in the 'real' blockchain;
- follow up with whatever environment build required

### Build Mobile

Currently Not Supported

#### Build Android APK

TODO Not working...

Steps

1. Install all dependencies (as develoment) for this workspace
```sh
npm run dev-install
```

2. Bind Android repository into workspace
```sh
npm run install-mobile
```

3. Launch API HUB
```sh
npm run server
```

4. Prepare the Node files that will be packed into the Android app
```sh
#In another tab / console
npm build-mobile
```

5. Have /mobile/scan-app/android/local.properties file with the following content

```sh
# Change the value to your SDK path
sdk.dir=/home/alex/Android/Sdk
```
More on this [here](https://github.com/PrivateSky/android-edge-agent#iv-setup-local-environment-values)

6. Build the APK
```sh
npm build-android-apk
```

This concludes the steps to build the APK file.

**Note:** The .apk file should be in folder
```
mobile/scan-app/android/app/build/outputs/apk/release
```

### Build iOS App

Currently not supported

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




