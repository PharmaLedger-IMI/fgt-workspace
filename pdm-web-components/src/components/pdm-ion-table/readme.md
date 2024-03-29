# pdm-ion-table



<!-- Auto Generated Below -->


## Properties

| Property               | Attribute                | Description                                                                                       | Type      | Default                   |
| ---------------------- | ------------------------ | ------------------------------------------------------------------------------------------------- | --------- | ------------------------- |
| `autoLoad`             | `auto-load`              | the querying attribute name so the items can query their own value                                | `boolean` | `false`                   |
| `canQuery`             | `can-query`              | Shows the search bar or not.                                                                      | `boolean` | `true`                    |
| `currentPage`          | `current-page`           |                                                                                                   | `number`  | `0`                       |
| `dsuQuery`             | `dsu-query`              |                                                                                                   | `string`  | `'[]'`                    |
| `iconName`             | `icon-name`              |                                                                                                   | `string`  | `undefined`               |
| `itemProps`            | `item-props`             | Option props to be passed to child elements in from a JSON object in value key format only format | `any`     | `undefined`               |
| `itemReference`        | `item-reference`         | the querying attribute name so the items can query their own value                                | `string`  | `undefined`               |
| `itemType`             | `item-type`              | The tag for the item type that the table should use eg: 'li' would create list items              | `string`  | `undefined`               |
| `itemsPerPage`         | `items-per-page`         |                                                                                                   | `number`  | `10`                      |
| `keywordQuery`         | `keyword-query`          | Querying/paginating Params - only available when mode is set by ref                               | `string`  | `undefined`               |
| `loadingMessage`       | `loading-message`        |                                                                                                   | `string`  | `"Loading..."`            |
| `manager`              | `manager`                | sets the name of the manager to use                                                               | `string`  | `undefined`               |
| `noContentMessage`     | `no-content-message`     |                                                                                                   | `string`  | `"No Content"`            |
| `pageCount`            | `page-count`             |                                                                                                   | `number`  | `0`                       |
| `paginated`            | `paginated`              |                                                                                                   | `boolean` | `true`                    |
| `searchBarPlaceholder` | `search-bar-placeholder` |                                                                                                   | `string`  | `"enter search terms..."` |
| `sort`                 | `sort`                   |                                                                                                   | `string`  | `undefined`               |
| `tableTitle`           | `table-title`            | Graphical Params                                                                                  | `string`  | `'PDM Ionic Table'`       |


## Events

| Event              | Description                          | Type               |
| ------------------ | ------------------------------------ | ------------------ |
| `ssapp-send-error` | Through this event errors are passed | `CustomEvent<any>` |


## Methods

### `refresh() => Promise<void>`



#### Returns

Type: `Promise<void>`




## Dependencies

### Used by

 - [managed-product](../managed-product)

### Depends on

- [multi-spinner](../multi-spinner)
- [pdm-search-bar](../pdm-search-bar)

### Graph
```mermaid
graph TD;
  pdm-ion-table --> multi-spinner
  pdm-ion-table --> pdm-search-bar
  managed-product --> pdm-ion-table
  style pdm-ion-table fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
