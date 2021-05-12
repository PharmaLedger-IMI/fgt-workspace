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

| Event        | Description                           | Type                                   |
| ------------ | ------------------------------------- | -------------------------------------- |
| `sendAction` | Through this event actions are passed | `CustomEvent<OverlayEventDetail<any>>` |


## Dependencies

### Used by

 - [managed-issued-shipment](../managed-issued-shipment)
 - [managed-received-order](../managed-received-order)
 - [managed-received-order-list-item](../managed-received-order-list-item)
 - [managed-shipment-list-item](../managed-shipment-list-item)

### Graph
```mermaid
graph TD;
  managed-issued-shipment --> managed-orderline-stock-chip
  managed-received-order --> managed-orderline-stock-chip
  managed-received-order-list-item --> managed-orderline-stock-chip
  managed-shipment-list-item --> managed-orderline-stock-chip
  style managed-orderline-stock-chip fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
