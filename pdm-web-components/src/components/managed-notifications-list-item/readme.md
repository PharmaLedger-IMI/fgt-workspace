# managed-notifications-list-item



<!-- Auto Generated Below -->


## Properties

| Property         | Attribute        | Description | Type      | Default     |
| ---------------- | ---------------- | ----------- | --------- | ----------- |
| `isHeader`       | `is-header`      |             | `boolean` | `undefined` |
| `notificationid` | `notificationid` |             | `string`  | `undefined` |


## Events

| Event                | Description                                             | Type               |
| -------------------- | ------------------------------------------------------- | ------------------ |
| `fgt-track-request`  |                                                         | `CustomEvent<any>` |
| `ssapp-navigate-tab` | Through this event navigation requests to tabs are made | `CustomEvent<any>` |
| `ssapp-send-error`   | Through this event errors are passed                    | `CustomEvent<any>` |


## Methods

### `refresh() => Promise<void>`



#### Returns

Type: `Promise<void>`




## Dependencies

### Depends on

- [list-item-layout-default](../list-item-layout-default)

### Graph
```mermaid
graph TD;
  managed-notifications-list-item --> list-item-layout-default
  style managed-notifications-list-item fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
