# managed-product-list-item



<!-- Auto Generated Below -->


## Properties

| Property  | Attribute  | Description | Type     | Default             |
| --------- | ---------- | ----------- | -------- | ------------------- |
| `orderId` | `order-id` |             | `string` | `undefined`         |
| `type`    | `type`     |             | `string` | `ORDER_TYPE.ISSUED` |


## Events

| Event                | Description                                             | Type               |
| -------------------- | ------------------------------------------------------- | ------------------ |
| `ssapp-navigate-tab` | Through this event navigation requests to tabs are made | `CustomEvent<any>` |
| `ssapp-send-error`   | Through this event errors are passed                    | `CustomEvent<any>` |


## Methods

### `refresh(newOrder?: any, oldOrder?: any) => Promise<void>`



#### Returns

Type: `Promise<void>`




## Dependencies

### Depends on

- [status-badge](../status-badge)
- [pdm-item-organizer](../pdm-item-organizer)
- [list-item-layout](../list-item-layout)

### Graph
```mermaid
graph TD;
  managed-order-list-item --> status-badge
  managed-order-list-item --> pdm-item-organizer
  managed-order-list-item --> list-item-layout
  pdm-item-organizer --> more-chip
  style managed-order-list-item fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
