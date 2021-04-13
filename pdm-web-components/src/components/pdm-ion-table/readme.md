# pdm-ion-table



<!-- Auto Generated Below -->


## Properties

| Property            | Attribute             | Description                 | Type      | Default             |
| ------------------- | --------------------- | --------------------------- | --------- | ------------------- |
| `canQuery`          | `can-query`           |                             | `boolean` | `false`             |
| `currentPage`       | `current-page`        |                             | `number`  | `undefined`         |
| `iconName`          | `icon-name`           |                             | `string`  | `undefined`         |
| `itemReferenceName` | `item-reference-name` |                             | `string`  | `undefined`         |
| `itemType`          | `item-type`           |                             | `string`  | `undefined`         |
| `itemsPerPage`      | `items-per-page`      |                             | `number`  | `10`                |
| `loadingMessage`    | `loading-message`     |                             | `string`  | `"Loading..."`      |
| `manager`           | `manager`             |                             | `string`  | `undefined`         |
| `mode`              | `mode`                | can be 'bymodel' or 'byref' | `string`  | `undefined`         |
| `noContentMessage`  | `no-content-message`  |                             | `string`  | `"No Content"`      |
| `sort`              | `sort`                |                             | `string`  | `"asc"`             |
| `title`             | `title`               |                             | `string`  | `'PDM Ionic Table'` |


## Events

| Event                   | Description                                                                                                                | Type               |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------- | ------------------ |
| `webcardinal:model:get` | Through this event model is received (from webc-container, webc-for, webc-if or any component that supports a controller). | `CustomEvent<any>` |


## Methods

### `refresh() => Promise<void>`



#### Returns

Type: `Promise<void>`




----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
