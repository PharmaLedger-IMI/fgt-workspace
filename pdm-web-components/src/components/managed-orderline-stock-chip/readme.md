# managed-orderline-stock-chip



<!-- Auto Generated Below -->


## Properties

| Property     | Attribute     | Description | Type     | Default                           |
| ------------ | ------------- | ----------- | -------- | --------------------------------- |
| `available`  | `available`   |             | `number` | `undefined`                       |
| `button`     | `button`      |             | `string` | `undefined`                       |
| `gtin`       | `gtin`        |             | `string` | `undefined`                       |
| `loaderType` | `loader-type` |             | `string` | `SUPPORTED_LOADERS.bubblingSmall` |
| `mode`       | `mode`        |             | `string` | `CHIP_TYPE.SIMPLE`                |
| `quantity`   | `quantity`    |             | `number` | `undefined`                       |
| `threshold`  | `threshold`   |             | `number` | `30`                              |


## Events

| Event          | Description                           | Type               |
| -------------- | ------------------------------------- | ------------------ |
| `ssapp-action` | Through this event actions are passed | `CustomEvent<any>` |


## Dependencies

### Used by

 - [line-stock-manager](../line-stock-manager)

### Depends on

- [generic-chip](../generic-chip)

### Graph
```mermaid
graph TD;
  managed-orderline-stock-chip --> generic-chip
  line-stock-manager --> managed-orderline-stock-chip
  style managed-orderline-stock-chip fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
