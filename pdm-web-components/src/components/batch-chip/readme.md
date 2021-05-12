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


## Dependencies

### Used by

 - [managed-issued-shipment](../managed-issued-shipment)
 - [managed-product-list-item](../managed-product-list-item)
 - [managed-received-order](../managed-received-order)
 - [managed-stock-list-item](../managed-stock-list-item)

### Depends on

- [multi-spinner](../multi-spinner)

### Graph
```mermaid
graph TD;
  batch-chip --> multi-spinner
  managed-issued-shipment --> batch-chip
  managed-product-list-item --> batch-chip
  managed-received-order --> batch-chip
  managed-stock-list-item --> batch-chip
  style batch-chip fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
