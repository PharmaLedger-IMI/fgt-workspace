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


## Methods

### `refresh() => Promise<void>`



#### Returns

Type: `Promise<void>`




## Dependencies

### Used by

 - [line-stock-manager](../line-stock-manager)

### Depends on

- [multi-spinner](../multi-spinner)
- [generic-chip](../generic-chip)
- [status-badge](../status-badge)

### Graph
```mermaid
graph TD;
  batch-chip --> multi-spinner
  batch-chip --> generic-chip
  batch-chip --> status-badge
  line-stock-manager --> batch-chip
  style batch-chip fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
