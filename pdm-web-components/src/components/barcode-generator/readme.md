# barcode-generator



<!-- Auto Generated Below -->


## Properties

| Property      | Attribute      | Description                                                                                                                                                       | Type      | Default     |
| ------------- | -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- | ----------- |
| `data`        | `data`         |                                                                                                                                                                   | `any`     | `undefined` |
| `includeText` | `include-text` | description: `This option allows to print the input data below the generated barcode.`, isMandatory: false, propertyType: `boolean`                               | `boolean` | `false`     |
| `scale`       | `scale`        |                                                                                                                                                                   | `any`     | `3`         |
| `size`        | `size`         | description: `The size of the barcode in mm. Default is set to 32 mm.`, isMandatory: false, propertyType: `integer`                                               | `any`     | `32`        |
| `title`       | `title`        | description: `A title that will be used for the current component instance.`, isMandatory: false, propertyType: `string`                                          | `string`  | `""`        |
| `type`        | `type`         | description: `The barcode type. Accepted values are 'gs1datamatrix','datamatrix','qrcode', 'code128','code11','isbn'.`, isMandatory: true, propertyType: `string` | `string`  | `"qrcode"`  |


## Dependencies

### Used by

 - [batch-list-item](../batch-list-item)
 - [managed-batch-list-item](../managed-batch-list-item)
 - [managed-product-list-item](../managed-product-list-item)
 - [product-list-item](../product-list-item)
 - [stock-list-item](../stock-list-item)

### Graph
```mermaid
graph TD;
  batch-list-item --> barcode-generator
  managed-batch-list-item --> barcode-generator
  managed-product-list-item --> barcode-generator
  product-list-item --> barcode-generator
  stock-list-item --> barcode-generator
  style barcode-generator fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
