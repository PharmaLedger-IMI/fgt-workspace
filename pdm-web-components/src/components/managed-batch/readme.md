# managed-batch



<!-- Auto Generated Below -->


## Properties

| Property                   | Attribute                    | Description | Type     | Default                                             |
| -------------------------- | ---------------------------- | ----------- | -------- | --------------------------------------------------- |
| `addBatchString`           | `add-batch-string`           |             | `string` | `"Add Batch"`                                       |
| `backString`               | `back-string`                |             | `string` | `"Back to Product"`                                 |
| `batchNumberString`        | `batch-number-string`        |             | `string` | `"Batch Number:"`                                   |
| `clearString`              | `clear-string`               |             | `string` | `"Clear"`                                           |
| `expiryPlaceholderString`  | `expiry-placeholder-string`  |             | `string` | `"Please define an expiry date..."`                 |
| `expiryString`             | `expiry-string`              |             | `string` | `"Expiry:"`                                         |
| `gtinRef`                  | `gtin-ref`                   |             | `string` | `undefined`                                         |
| `manageString`             | `manage-title-string`        |             | `string` | `"Manage Batch"`                                    |
| `serialsPlaceholderString` | `serials-placeholder-string` |             | `string` | `"Please insert comma separated serial numbers..."` |
| `serialsString`            | `serials-string`             |             | `string` | `"Serial Numbers:"`                                 |
| `statuses`                 | `statuses`                   |             | `any`    | `undefined`                                         |
| `titleString`              | `create-title-string`        |             | `string` | `"Create Batch for"`                                |


## Events

| Event                 | Description                                             | Type               |
| --------------------- | ------------------------------------------------------- | ------------------ |
| `ssapp-action`        | Through this event action requests are made             | `CustomEvent<any>` |
| `ssapp-back-navigate` | Through this event back navigation requests are made    | `CustomEvent<any>` |
| `ssapp-navigate-tab`  | Through this event navigation requests to tabs are made | `CustomEvent<any>` |
| `ssapp-send-error`    | Through this event errors are passed                    | `CustomEvent<any>` |


## Methods

### `refresh() => Promise<void>`



#### Returns

Type: `Promise<void>`



### `reset() => Promise<void>`



#### Returns

Type: `Promise<void>`




## Dependencies

### Depends on

- [pdm-item-organizer](../pdm-item-organizer)
- [status-updater](../status-updater)
- [multi-spinner](../multi-spinner)
- [create-manage-view-layout](../create-manage-view-layout)

### Graph
```mermaid
graph TD;
  managed-batch --> pdm-item-organizer
  managed-batch --> status-updater
  managed-batch --> multi-spinner
  managed-batch --> create-manage-view-layout
  pdm-item-organizer --> more-chip
  status-updater --> status-updater-button
  style managed-batch fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
