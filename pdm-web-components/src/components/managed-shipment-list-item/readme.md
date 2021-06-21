# managed-shipment-list-item



<!-- Auto Generated Below -->


## Properties

| Property            | Attribute             | Description | Type     | Default                |
| ------------------- | --------------------- | ----------- | -------- | ---------------------- |
| `shipmentId`        | `shipment-id`         |             | `string` | `undefined`            |
| `shipmentLineCount` | `shipment-line-count` |             | `number` | `4`                    |
| `type`              | `type`                |             | `string` | `SHIPMENT_TYPE.ISSUED` |


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

- [pdm-item-organizer](../pdm-item-organizer)
- [list-item-layout](../list-item-layout)

### Graph
```mermaid
graph TD;
  managed-shipment-list-item --> pdm-item-organizer
  managed-shipment-list-item --> list-item-layout
  pdm-item-organizer --> more-chip
  style managed-shipment-list-item fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
