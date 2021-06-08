# generic-chip



<!-- Auto Generated Below -->


## Properties

| Property    | Attribute    | Description | Type      | Default       |
| ----------- | ------------ | ----------- | --------- | ------------- |
| `badges`    | `badges`     |             | `any`     | `undefined`   |
| `buttons`   | `buttons`    |             | `any`     | `undefined`   |
| `chipLabel` | `chip-label` |             | `string`  | `undefined`   |
| `color`     | `color`      |             | `string`  | `"secondary"` |
| `cssClass`  | `class`      |             | `string`  | `''`          |
| `outline`   | `outline`    |             | `boolean` | `true`        |


## Events

| Event         | Description | Type                  |
| ------------- | ----------- | --------------------- |
| `selectEvent` |             | `CustomEvent<string>` |


## Dependencies

### Used by

 - [batch-chip](../batch-chip)
 - [managed-batch](../managed-batch)

### Graph
```mermaid
graph TD;
  batch-chip --> generic-chip
  managed-batch --> generic-chip
  style generic-chip fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
