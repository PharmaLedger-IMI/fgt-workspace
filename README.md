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

[REST API](fgt-api/index.html)

[PDM-DSU-Toolkit](pdm-dsu-toolkit/index.html)

[FGT DSU Wizard](fgt-dsu-wizard/index.html)

[Web Components](pdm-web-components/index.html)

[MAH Enterprise Wallet](fgt-mah-ssapp/index.html)

[Wholesaler Wallet](fgt-wholesaler-ssapp/index.html)

[Pharmacy Wallet](fgt-mah-ssapp/index.html)

### Architecture

#### REST API Architecture

As of release 0.8, Finished Goods Traceability moved from a UI based Wallet system, to an ERP integrated one, with all the Architectural considerations than came with that change.

Please go to the REST API Module for details

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
#Important: If you plan to contribute to the project and/or dependencies please set DEV:true
#in the file env.json before you run the installation!
$ npm run dev-install
```

For latest 'stable' version do:
```sh
$ npm ci
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



#### Step 4: (Pre-Requisite) Build and install one participant's Dashboard

On another terminal, 

```sh
cd fgt-api
npm run build-api-mah-dashboard
npm run export-api-credentials -- --role=mah
```

(Replace "mah" with "whs" or "pha" as appropriate).

Open the browser at http://localhost:8080/dashboard/

(The password should be pre-filled. Do not login yet, as you need to start REST services... next.)


#### Step 4a: Run one participant REST services.

Choose if you want to run a MAH, WHS, ou PHA.

For MAH:
```sh
cd fgt-api
npm run run-mah
```

(You can now login to the dashboard started in step 4.)

Change the command to "npm run run-whs" or "npm run run-pha" for other participant category.

Credentials for the API are defined in files 
```sh
fgt-api/config/
├── fgt-mah-wallet
│   └── credentials.json
├── fgt-pharmacy-wallet
│   └── credentials.json
├── fgt-wholesaler-wallet
│   └── credentials.json
└── readme.md
```

API calls need HTTP BASIC Auth using the credentials defined above. Username is the "id" secret property value (in the credentials.json file). The password is the "pass" secret property value.

Example to list all products:

```sh
curl -X 'GET' \
  'http://localhost:8081/traceability/product/getAll?page=1&itemPerPage=10&sort=dsc' \
  -H 'accept: application/json' \
  -H 'Authorization: Basic TUFIMTE2MjY3OTg2OlRoaXMxc1N1Y2hBUzNjdXJlUGFzc3cwcmQ='
```



#### Step 4b: Run one participant OpenAPI/Swagger.

On another terminal, 

```sh
cd fgt-api
npm run run-swagger
```

You can open the URL http://localhost:3009 and use the Swagger UI to invoke the REST services.


#### Run all participants

You need several instances to test that.
See docker/api/bootCompose.sh that starts several dockers for the DEV/TST environments.


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

### API

#### Deployment Diagram

##### Real World Scenario

The proposed REST Api deployment diagram is as follows

![Proposed Intrastructure](resources/drawings/finishedGoodsTraceabilityDSUTypes-fgt-api-deployment.png)

where each participant has its own environment, running it's own:
 - ERP System;
 - OpenDSU API (ApiHub);
 - FGT REST API;
 - (optional, typically for MAHs) blockchain node;

##### Testing Scenario

Because the above infrastructure is not testable at this moment, we propose to deploy the following on our servers:

![Proposed Intrastructure](resources/drawings/finishedGoodsTraceabilityDSUTypes-fgt-api-test-deployment.png)

where each participant has its own environment, running it's own:
- Swagger Instance (mocks the ERP System);
- OpenDSU API (ApiHub);
- FGT REST API;

**How to deploy**

ssh into the machine;
clone the workspace;
go to ```fgt-workspace/docker/api```
run ```./bootCompose.sh ${env}``` where env can be nothing (localhost), dev (fgt-dev.pharmaledger.pdmfc.com) or anything else (fgt.pharmaledger.pdmfc.com)



### Deploy and test with a local blockchain

- (optional) clean 'fake' blockchain: ```npm run clean```
- stop the server;
- run ```npm run deploy-test-chain```. This will build a local blockchain infrastrucure and point the tracebility
  domain anchoring to that blockchain;
- run ```npm run server``` to load the server with the new settings;
- run ```npm run build-all``` to build the environment in the 'real' blockchain;
- follow up with whatever environment build required

### REST API Client Example

There is an internal REST test client (written in JavaScript, to run on the command line with nodejs) on
https://github.com/PharmaLedger-IMI/fgt-workspace/blob/master/bin/environment/wsCreateStuff.js

This is more of a test tool (that relies on pre-configured participant, product and batch data), that performs a test scenario: create products ; create batches ; create shipments ; update shipments ; perform sales ; checks receipts ; traceability requests ; quarantine and recall batch.

The complex pre-configured test data for the scenario might make this tool a bit too hard to read and fork for a simple test, but, feel free to read the comments at the start, and attempt to run it over a local instance, and compare the requests/responses logged to the console.

Remember also that the Swagger UI provides JSON examples and schemas, so that it should be easy to create a REST client on any technology that supports HTTPS JSON REST services.


### Build Mobile

Currently there are no mobile apps in this B2B solution.


### Workspace Description

* apihub-root: Folder containing the root of what is served by the server
    * external-volume: configs directory;
    * internal-volume: volume folder (brick storage). contains the several configured domains
* bin - development and build tools
* docker/api - folders and files for building and configuring docker images and running a docker-compose environment.
* blockchain-patch - configuration files used to override other files when switching between simulated anchoring services, and an external blockchain service.
* dashboard-wizard - code library used by the dashboard web application.
* fgt-api - main REST server, Swagger UI web application server, and dashboard web application server. Only one instance for one role MAH/WHS/PHA can run on the same environment at a time. See README.md above for details on starting each server.
* fgt-dsu-wizard: business logic code. (Based on gtin-dsu-wizard.)
* fgt-mah-ssapp
* fgt-whs-ssapp
* fgt-pha-ssapp
    * Part of graphical dashboard code for each one of the roles
* pdm-dsu-toolkit
* pdm-trust-loader
* pdm-web-toolkit
    * code libraries
* tests
    * test tools and data
* trust-loader-config
    * deprecated
* workdocs - self-generated documentation.




