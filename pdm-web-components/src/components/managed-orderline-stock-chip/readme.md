# managed-orderline-stock-chip



<!-- Auto Generated Below -->


## Properties

| Property     | Attribute     | Description | Type     | Default                           |
| ------------ | ------------- | ----------- | -------- | --------------------------------- |
| `gtin`       | `gtin`        |             | `string` | `undefined`                       |
| `loaderType` | `loader-type` |             | `string` | `SUPPORTED_LOADERS.bubblingSmall` |
| `mode`       | `mode`        |             | `string` | `CHIP_TYPE.SIMPLE`                |
| `quantity`   | `quantity`    |             | `number` | `undefined`                       |
| `threshold`  | `threshold`   |             | `number` | `30`                              |


## Dependencies

### Used by

 - [managed-received-order-list-item](../managed-received-order-list-item)

### Graph
```mermaid
graph TD;
  managed-received-order-list-item --> managed-orderline-stock-chip
  style managed-orderline-stock-chip fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
