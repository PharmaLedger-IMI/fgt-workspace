# managed-shipmentline-list-item



<!-- Auto Generated Below -->


## Properties

| Property         | Attribute          | Description | Type      | Default         |
| ---------------- | ------------------ | ----------- | --------- | --------------- |
| `batchLabel`     | `bach-label`       |             | `string`  | `"Batch:"`      |
| `createdOnLabel` | `created-on-label` |             | `string`  | `"Created on:"` |
| `gtinLabel`      | `gtin-label`       |             | `string`  | `"Gtin:"`       |
| `isHeader`       | `is-header`        |             | `boolean` | `undefined`     |
| `nameLabel`      | `name-label`       |             | `string`  | `"Name:"`       |
| `quantityLabel`  | `quantity-label`   |             | `string`  | `"Quantity:"`   |
| `requesterLabel` | `requester-label`  |             | `string`  | `"Requester:"`  |
| `senderLabel`    | `sender-label`     |             | `string`  | `"Sender:"`     |
| `shipmentLine`   | `shipment-line`    |             | `string`  | `undefined`     |
| `statusLabel`    | `status-label`     |             | `string`  | `"Status:"`     |


## Events

| Event                | Description                                             | Type               |
| -------------------- | ------------------------------------------------------- | ------------------ |
| `ssapp-navigate-tab` | Through this event navigation requests to tabs are made | `CustomEvent<any>` |
| `ssapp-send-error`   | Through this event errors are passed                    | `CustomEvent<any>` |


## Methods

### `refresh() => Promise<void>`



#### Returns

Type: `Promise<void>`




## Dependencies

### Depends on

- [multi-spinner](../multi-spinner)
- [pdm-item-organizer](../pdm-item-organizer)
- [status-badge](../status-badge)
- [list-item-layout](../list-item-layout)

### Graph
```mermaid
graph TD;
  managed-shipmentline-list-item --> multi-spinner
  managed-shipmentline-list-item --> pdm-item-organizer
  managed-shipmentline-list-item --> status-badge
  managed-shipmentline-list-item --> list-item-layout
  pdm-item-organizer --> more-chip
  style managed-shipmentline-list-item fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
