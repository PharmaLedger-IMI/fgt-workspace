# barcode-generator



<!-- Auto Generated Below -->


## Properties

| Property      | Attribute      | Description                                                                                                                                                       | Type      | Default     |
| ------------- | -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- | ----------- |
| `data`        | `data`         |                                                                                                                                                                   | `any`     | `undefined` |
| `includeText` | `include-text` |                                                                                                                                                                   | `boolean` | `false`     |
| `scale`       | `scale`        |                                                                                                                                                                   | `any`     | `3`         |
| `size`        | `size`         | description: `The size of the barcode in mm. Default is set to 32 mm.`, isMandatory: false, propertyType: `integer`                                               | `any`     | `32`        |
| `title`       | `title`        | description: `A title that will be used for the current component instance.`, isMandatory: false, propertyType: `string`                                          | `string`  | `""`        |
| `type`        | `type`         | description: `The barcode type. Accepted values are 'gs1datamatrix','datamatrix','qrcode', 'code128','code11','isbn'.`, isMandatory: true, propertyType: `string` | `string`  | `"qrcode"`  |


## Dependencies

### Used by

 - [managed-batch-list-item](../managed-batch-list-item)
 - [managed-orderline-list-item](../managed-orderline-list-item)
 - [managed-product-list-item](../managed-product-list-item)
 - [managed-stock-list-item](../managed-stock-list-item)

### Graph
```mermaid
graph TD;
  managed-batch-list-item --> barcode-generator
  managed-orderline-list-item --> barcode-generator
  managed-product-list-item --> barcode-generator
  managed-stock-list-item --> barcode-generator
  style barcode-generator fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
