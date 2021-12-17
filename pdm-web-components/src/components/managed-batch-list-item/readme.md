# managed-batch-list-item



<!-- Auto Generated Below -->


## Properties

| Property    | Attribute    | Description | Type      | Default     |
| ----------- | ------------ | ----------- | --------- | ----------- |
| `gtinBatch` | `gtin-batch` |             | `string`  | `undefined` |
| `isHeader`  | `is-header`  |             | `boolean` | `undefined` |


## Events

| Event                     | Description                                             | Type               |
| ------------------------- | ------------------------------------------------------- | ------------------ |
| `fgt-request-stock-trace` |                                                         | `CustomEvent<any>` |
| `ssapp-navigate-tab`      | Through this event navigation requests to tabs are made | `CustomEvent<any>` |
| `ssapp-send-error`        | Through this event errors are passed                    | `CustomEvent<any>` |


## Methods

### `refresh() => Promise<void>`



#### Returns

Type: `Promise<void>`




## Dependencies

### Depends on

- [status-badge](../status-badge)
- [multi-spinner](../multi-spinner)
- [pdm-item-organizer](../pdm-item-organizer)
- [list-item-layout](../list-item-layout)

### Graph
```mermaid
graph TD;
  managed-batch-list-item --> status-badge
  managed-batch-list-item --> multi-spinner
  managed-batch-list-item --> pdm-item-organizer
  managed-batch-list-item --> list-item-layout
  pdm-item-organizer --> more-chip
  style managed-batch-list-item fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
