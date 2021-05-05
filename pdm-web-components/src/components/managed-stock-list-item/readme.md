# managed-stock-list-item



<!-- Auto Generated Below -->


## Properties

| Property | Attribute | Description | Type     | Default     |
| -------- | --------- | ----------- | -------- | ----------- |
| `gtin`   | `gtin`    |             | `string` | `undefined` |


## Events

| Event                | Description                                             | Type               |
| -------------------- | ------------------------------------------------------- | ------------------ |
| `sendErrorEvent`     | Through this event errors are passed                    | `CustomEvent<any>` |
| `ssapp-navigate-tab` | Through this event navigation requests to tabs are made | `CustomEvent<any>` |


## Methods

### `refresh() => Promise<void>`



#### Returns

Type: `Promise<void>`




## Dependencies

### Depends on

- [barcode-generator](../barcode-generator)
- [batch-chip](../batch-chip)

### Graph
```mermaid
graph TD;
  managed-stock-list-item --> barcode-generator
  managed-stock-list-item --> batch-chip
  batch-chip --> multi-spinner
  style managed-stock-list-item fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
