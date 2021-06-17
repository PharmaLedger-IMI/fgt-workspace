# batch-chip



<!-- Auto Generated Below -->


## Properties

| Property          | Attribute          | Description | Type     | Default                     |
| ----------------- | ------------------ | ----------- | -------- | --------------------------- |
| `expiryThreshold` | `expiry-threshold` |             | `number` | `30`                        |
| `gtinBatch`       | `gtin-batch`       |             | `string` | `undefined`                 |
| `loaderType`      | `loader-type`      |             | `string` | `SUPPORTED_LOADERS.circles` |
| `mode`            | `mode`             |             | `string` | `CHIP_TYPE.SIMPLE`          |
| `quantity`        | `quantity`         |             | `number` | `undefined`                 |


## Events

| Event         | Description | Type                  |
| ------------- | ----------- | --------------------- |
| `selectEvent` |             | `CustomEvent<string>` |


## Dependencies

### Used by

 - [line-stock-manager](../line-stock-manager)
 - [managed-received-order](../managed-received-order)

### Depends on

- [multi-spinner](../multi-spinner)
- [generic-chip](../generic-chip)

### Graph
```mermaid
graph TD;
  batch-chip --> multi-spinner
  batch-chip --> generic-chip
  line-stock-manager --> batch-chip
  managed-received-order --> batch-chip
  style batch-chip fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
