# managed-batch-list-item



<!-- Auto Generated Below -->


## Properties

| Property    | Attribute    | Description | Type     | Default     |
| ----------- | ------------ | ----------- | -------- | ----------- |
| `gtinBatch` | `gtin-batch` |             | `string` | `undefined` |


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

### Graph
```mermaid
graph TD;
  managed-batch-list-item --> multi-spinner
  managed-batch-list-item --> pdm-item-organizer
  pdm-item-organizer --> more-chip
  style managed-batch-list-item fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
