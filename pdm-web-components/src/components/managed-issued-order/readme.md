# managed-issued-order



<!-- Auto Generated Below -->


## Properties

| Property                | Attribute                 | Description | Type     | Default                  |
| ----------------------- | ------------------------- | ----------- | -------- | ------------------------ |
| `detailsString`         | `details-string`          |             | `string` | `'Details:'`             |
| `directoryString`       | `directory-string`        |             | `string` | `'Directory:'`           |
| `fromPlaceholderString` | `from-placeholder-string` |             | `string` | `'Select a supplier...'` |
| `fromString`            | `from-string`             |             | `string` | `'Order from:'`          |
| `orderLines`            | `order-lines`             |             | `any`    | `undefined`              |
| `proceedString`         | `proceed-string`          |             | `string` | `'Issue Order'`          |
| `productsString`        | `products-string`         |             | `string` | `'Products:'`            |
| `requester`             | `requester`               |             | `any`    | `undefined`              |
| `titleString`           | `title-string`            |             | `string` | `'Create Order'`         |


## Events

| Event              | Description                                             | Type               |
| ------------------ | ------------------------------------------------------- | ------------------ |
| `created`          | Through this event order creation requests are made     | `CustomEvent<any>` |
| `ssapp-action`     | Through this event navigation requests to tabs are made | `CustomEvent<any>` |
| `ssapp-send-error` | Through this event errors are passed                    | `CustomEvent<any>` |


## Methods

### `updateDirectory() => Promise<void>`



#### Returns

Type: `Promise<void>`




## Dependencies

### Depends on

- [simple-managed-product-item](../simple-managed-product-item)
- [managed-orderline-stock-chip](../managed-orderline-stock-chip)

### Graph
```mermaid
graph TD;
  managed-issued-order --> simple-managed-product-item
  managed-issued-order --> managed-orderline-stock-chip
  simple-managed-product-item --> multi-spinner
  simple-managed-product-item --> barcode-generator
  style managed-issued-order fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
