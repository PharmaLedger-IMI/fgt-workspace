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