## Refactor FGT

### What needs to be changed?

##### 'Backend':
- Management process of for `Shipments` and `ShipmentLines`. New attributes mean new logic and new tests;
- Creation process for `Batch`; When creating a batch a new attribute will have to be considered that is not part of the `Batch` model. The location GLN;
- Management process of for `Batch`. New attributes mean new logic and new tests;
- GLN management: Each participant will need to manage the GLNs they control.
- Data model for `Sale` and `Receipts`; Both will now need to include the `soldAt` property, than should map to GLNs;
- Stock management: Very big change there. 
   - Stock will have to be managed for n GLNs per wallet. that means, for performance and OpenDSU's concurrency's sake, to split one 'database table' into n tables;
     - This specifically means a lot of concurrency and stress testing... OpenDSU Wallet databases are not REAL databases... this single change alone might make it worthwhile to integrate with an actual database
   - All current stock calculations and traceability math will have to be changed;
- Update `Shipment`, `ShipmentLine`, `Batch`, `Sale`, `Receipts`, `Stock` and `Traceability` FGT REST APIs;
- Add `GLN` FGT REST API;


##### UI:
 - Update `Shipment`, `ShipmentLine`, `Batch`, `Sale`, `Receipts`, `Stock` and `Traceability` swagger APIs
 - Ad `GLN` swagger APIs
 - All `Batch` management screens: (`Batch` List item, `Batch` Chip, and `Batch` WebComponents)
 - All `Shipment` management screens: (`Shipment` List item, new `Shipment` and manage `Shipment` WebComponents)
 - All `ShipmentLine` management screens: (`ShipmentLine` List item WebComponent)
 - All `Sale` management screens: (`Sale` List item, new `Sale`, `Sale` Chip and manage `Sale` WebComponents)
 - All `Receipt` management screens: (`Receipt` List item, manage `Receipt` WebComponents)
 - All `Stock` management screens: (`Stock` List item)
 - All controllers for all the above models: `Shipment`, `ShipmentLine`, `Batch`, `Sale`, `Receipt`, `Stock` and `Traceability`


##### Questions:
- How to we ensure the GLNs match each participant. How can we ensure the data is and valid? Without a validation mechanism, any participant can claim he sends from GLN X and remove trust in the traceability;
    - GLNs, unlike wallet creation in the Pharmaledger ecosystem (or DID issuing for that regard), that should, in a later stage be controlled by an eGovernance mechanism, that does not apply to GLNs... Or must it?
- Who will have multiple GLNs? MAHs, Wholesalers and Pharmacies?
    - If pharmacies have multiple locations, but the sale system (FGT) is centralized, are the updates in real time? If they're not, then the EPI integration possibilities will fall a bit short, since the user, when scanning a just bought medicine pack will get a "medicine not sold" type error (until the pharmacy reports the sale and it gets entered into the system)


