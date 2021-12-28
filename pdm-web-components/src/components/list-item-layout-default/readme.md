# list-item-layout



<!-- Auto Generated Below -->


## Properties

| Property      | Attribute          | Description | Type                          | Default  |
| ------------- | ------------------ | ----------- | ----------------------------- | -------- |
| `buttons`     | `buttons`          |             | `boolean`                     | `false`  |
| `labelConfig` | `label-col-config` |             | `string`                      | `""`     |
| `lines`       | `lines`            |             | `"full" \| "inset" \| "none"` | `"none"` |
| `orientation` | `orientation`      |             | `"end" \| "start"`            | `"end"`  |
| `start`       | `start`            |             | `boolean`                     | `false`  |


## Dependencies

### Used by

 - [managed-batch-list-item](../managed-batch-list-item)
 - [managed-shipment-list-item](../managed-shipment-list-item)
 - [managed-stock-list-item](../managed-stock-list-item)

### Graph
```mermaid
graph TD;
  managed-batch-list-item --> list-item-layout-default
  managed-shipment-list-item --> list-item-layout-default
  managed-stock-list-item --> list-item-layout-default
  style list-item-layout-default fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
