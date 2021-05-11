# managed-received-order



<!-- Auto Generated Below -->


## Properties

| Property              | Attribute            | Description | Type     | Default                        |
| --------------------- | -------------------- | ----------- | -------- | ------------------------------ |
| `availableString`     | `available-string`   |             | `string` | `'Available:'`                 |
| `confirmedString`     | `confirmed-string`   |             | `string` | `'Confirmed:'`                 |
| `delayString`         | `delay-string`       |             | `string` | `'Delay:'`                     |
| `detailsString`       | `details-string`     |             | `string` | `'Details:'`                   |
| `noStockString`       | `no-stock-string`    |             | `string` | `'Empty'`                      |
| `orderId`             | `order-id`           |             | `string` | `undefined`                    |
| `proceedString`       | `proceed-string`     |             | `string` | `'Continue:'`                  |
| `productsString`      | `products-string`    |             | `string` | `'Products:'`                  |
| `rejectString`        | `reject-string`      |             | `string` | `'Reject'`                     |
| `remainingString`     | `remaining-string`   |             | `string` | `'Remaining:'`                 |
| `selectProductString` | `select-product`     |             | `string` | `'Please Select a Product...'` |
| `stockString`         | `stock-string`       |             | `string` | `'Stock:'`                     |
| `titleString`         | `title-string`       |             | `string` | `'Process Order'`              |
| `unavailableString`   | `unavailable-string` |             | `string` | `'Unavailable:'`               |


## Events

| Event             | Description                                             | Type               |
| ----------------- | ------------------------------------------------------- | ------------------ |
| `sendCreateEvent` | Through this event shipment creation requests are made  | `CustomEvent<any>` |
| `sendErrorEvent`  | Through this event errors are passed                    | `CustomEvent<any>` |
| `sendNavigateTab` | Through this event navigation requests to tabs are made | `CustomEvent<any>` |
| `sendRejectEvent` | Through this event shipment rejection requests are made | `CustomEvent<any>` |


## Methods

### `refresh() => Promise<void>`



#### Returns

Type: `Promise<void>`



### `selectOrderLine(gtin: any) => Promise<void>`



#### Returns

Type: `Promise<void>`




## Dependencies

### Depends on

- [batch-chip](../batch-chip)
- [managed-orderline-stock-chip](../managed-orderline-stock-chip)

### Graph
```mermaid
graph TD;
  managed-received-order --> batch-chip
  managed-received-order --> managed-orderline-stock-chip
  batch-chip --> multi-spinner
  style managed-received-order fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
