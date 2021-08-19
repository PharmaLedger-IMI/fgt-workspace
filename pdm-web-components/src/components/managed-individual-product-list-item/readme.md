# managed-individual-product-list-item



<!-- Auto Generated Below -->


## Properties

| Property          | Attribute           | Description | Type      | Default     |
| ----------------- | ------------------- | ----------- | --------- | ----------- |
| `gtinBatchSerial` | `gtin-batch-serial` |             | `string`  | `undefined` |
| `showCloseButton` | `show-close-button` |             | `boolean` | `true`      |
| `showTrackButton` | `show-track-button` |             | `boolean` | `true`      |


## Events

| Event               | Description                                   | Type               |
| ------------------- | --------------------------------------------- | ------------------ |
| `fgt-track-request` | Through this event tracking requests are made | `CustomEvent<any>` |
| `ssapp-action`      | Through this event action requests are made   | `CustomEvent<any>` |
| `ssapp-send-error`  | Through this event errors are passed          | `CustomEvent<any>` |


## Methods

### `refresh(newValue?: any) => Promise<void>`



#### Returns

Type: `Promise<void>`




## Dependencies

### Used by

 - [managed-stock-product-input](../managed-stock-product-input)

### Depends on

- [multi-spinner](../multi-spinner)
- [generic-chip](../generic-chip)
- [list-item-layout](../list-item-layout)

### Graph
```mermaid
graph TD;
  managed-individual-product-list-item --> multi-spinner
  managed-individual-product-list-item --> generic-chip
  managed-individual-product-list-item --> list-item-layout
  managed-stock-product-input --> managed-individual-product-list-item
  style managed-individual-product-list-item fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
