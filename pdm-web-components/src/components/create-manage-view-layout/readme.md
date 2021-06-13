# create-manage-view-layout



<!-- Auto Generated Below -->


## Properties

| Property            | Attribute             | Description | Type      | Default           |
| ------------------- | --------------------- | ----------- | --------- | ----------------- |
| `backString`        | `back-string`         |             | `string`  | `"Back"`          |
| `breakpoint`        | `break-point`         |             | `string`  | `"lg-4-3"`        |
| `clearString`       | `clear-string`        |             | `string`  | `"Clear"`         |
| `createString`      | `create-string`       |             | `string`  | `"Create"`        |
| `createTitleString` | `create-title-string` |             | `string`  | `"Create String"` |
| `iconName`          | `icon-name`           |             | `string`  | `"grid"`          |
| `isCreate`          | `is-create`           |             | `boolean` | `true`            |
| `manageTitleString` | `manage-title-string` |             | `string`  | `"Manage String"` |


## Events

| Event         | Description | Type               |
| ------------- | ----------- | ------------------ |
| `createEvent` |             | `CustomEvent<{}>`  |
| `goBackEvent` |             | `CustomEvent<any>` |


## Methods

### `clear() => Promise<void>`



#### Returns

Type: `Promise<void>`



### `getInput(name: string) => Promise<any>`



#### Returns

Type: `Promise<any>`




## Dependencies

### Used by

 - [managed-batch](../managed-batch)
 - [managed-order](../managed-order)
 - [managed-product](../managed-product)
 - [managed-shipment](../managed-shipment)

### Graph
```mermaid
graph TD;
  managed-batch --> create-manage-view-layout
  managed-order --> create-manage-view-layout
  managed-product --> create-manage-view-layout
  managed-shipment --> create-manage-view-layout
  style create-manage-view-layout fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
