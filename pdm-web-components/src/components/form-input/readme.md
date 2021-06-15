# form-input



<!-- Auto Generated Below -->


## Properties

| Property        | Attribute        | Description | Type                                                                                                                                                                                                                       | Default              |
| --------------- | ---------------- | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------- |
| `cssClass`      | `class`          |             | `string \| string[]`                                                                                                                                                                                                       | `''`                 |
| `input`         | --               |             | `{ name: string; element: string; label: string; props: { type?: string; subtype?: string; value?: string; required?: boolean; children?: []; }; validation?: { required?: { error: string; }; }; score: { any: any; }; }` | `undefined`          |
| `inputPrefix`   | `input-prefix`   |             | `string`                                                                                                                                                                                                                   | `INPUT_FIELD_PREFIX` |
| `labelPosition` | `label-position` |             | `"fixed" \| "floating" \| "stacked"`                                                                                                                                                                                       | `'floating'`         |
| `lines`         | `lines`          |             | `"full" \| "inset" \| "none"`                                                                                                                                                                                              | `'inset'`            |


## Events

| Event              | Description                                 | Type               |
| ------------------ | ------------------------------------------- | ------------------ |
| `ssapp-action`     | Through this event action requests are made | `CustomEvent<any>` |
| `ssapp-send-error` | Through this event errors are passed        | `CustomEvent<any>` |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
