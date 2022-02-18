# managed-product-list-item



<!-- Auto Generated Below -->


## Properties

| Property            | Attribute             | Description | Type      | Default     |
| ------------------- | --------------------- | ----------- | --------- | ----------- |
| `batchDisplayCount` | `batch-display-count` |             | `number`  | `3`         |
| `gtin`              | `gtin`                |             | `string`  | `undefined` |
| `isHeader`          | `is-header`           |             | `boolean` | `undefined` |


## Events

| Event                | Description                                             | Type               |
| -------------------- | ------------------------------------------------------- | ------------------ |
| `ssapp-navigate-tab` | Through this event navigation requests to tabs are made | `CustomEvent<any>` |
| `ssapp-send-error`   | Through this event errors are passed                    | `CustomEvent<any>` |


## Methods

### `refresh() => Promise<void>`



#### Returns

Type: `Promise<void>`




## Dependencies

### Depends on

- [multi-spinner](../multi-spinner)
- [pdm-item-organizer](../pdm-item-organizer)
- [list-item-layout](../list-item-layout)

### Graph
```mermaid
graph TD;
  managed-product-list-item --> multi-spinner
  managed-product-list-item --> pdm-item-organizer
  managed-product-list-item --> list-item-layout
  pdm-item-organizer --> more-chip
  style managed-product-list-item fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
