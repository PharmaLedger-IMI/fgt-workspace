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





