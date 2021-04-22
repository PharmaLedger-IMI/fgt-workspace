/* eslint-disable */
/* tslint:disable */
/**
 * This is an autogenerated file created by the Stencil compiler.
 * It contains typing information for all components that exist in this project.
 */
import { HTMLStencilElement, JSXBase } from "@stencil/core/internal";
export namespace Components {
    interface BarcodeGenerator {
        "data": any;
        /**
          * description: `This option allows to print the input data below the generated barcode.`, isMandatory: false, propertyType: `boolean`
         */
        "includeText": boolean;
        "scale"?: any;
        /**
          * description: `The size of the barcode in mm. Default is set to 32 mm.`, isMandatory: false, propertyType: `integer`
         */
        "size"?: any;
        /**
          * description: `A title that will be used for the current component instance.`, isMandatory: false, propertyType: `string`
         */
        "title": string;
        /**
          * description: `The barcode type. Accepted values are 'gs1datamatrix','datamatrix','qrcode', 'code128','code11','isbn'.`, isMandatory: true, propertyType: `string`
         */
        "type": string;
    }
    interface BatchListItem {
    }
    interface ManagedBatchListItem {
        "gtinBatch": string;
        "refresh": () => Promise<void>;
    }
    interface ManagedProductListItem {
        "gtin": string;
        "refresh": () => Promise<void>;
    }
    interface PdmIonTable {
        "buttons"?: string[];
        /**
          * Shows the search bar or not. (not working)
         */
        "canQuery"?: boolean;
        "currentPage"?: number;
        "iconName"?: string;
        /**
          * if the {@link PdmIonTable} is set to mode:  - {@link ION_TABLE_MODES.BY_REF}: must be the querying attribute name so the items can query their own value  - {@link ION_TABLE_MODES.BY_MODEL}: must be the model chain for content list
         */
        "itemReference": string;
        /**
          * The tag for the item type that the table should use eg: 'li' would create list items
         */
        "itemType": string;
        "itemsPerPage"?: number;
        "loadingMessage": string;
        /**
          * sets the name of the manager to use Only required if mode if {@link PdmIonTable#mode} is set to {@link ION_TABLE_MODES.BY_REF}
         */
        "manager"?: string;
        /**
          * can be any of {@link ION_TABLE_MODES} Decides if the tables works by:  - {@link ION_TABLE_MODES.BY_MODEL}: uses the WebCardinal model api
         */
        "mode": string;
        "noContentMessage": string;
        "pageCount"?: number;
        "paginated"?: boolean;
        /**
          * Querying/paginating Params - only available when mode is set by ref
         */
        "query"?: string;
        "refresh": () => Promise<void>;
        "sort"?: string;
        /**
          * Graphical Params
         */
        "title": string;
    }
    interface ProductListItem {
    }
    interface StockListItem {
    }
}
declare global {
    interface HTMLBarcodeGeneratorElement extends Components.BarcodeGenerator, HTMLStencilElement {
    }
    var HTMLBarcodeGeneratorElement: {
        prototype: HTMLBarcodeGeneratorElement;
        new (): HTMLBarcodeGeneratorElement;
    };
    interface HTMLBatchListItemElement extends Components.BatchListItem, HTMLStencilElement {
    }
    var HTMLBatchListItemElement: {
        prototype: HTMLBatchListItemElement;
        new (): HTMLBatchListItemElement;
    };
    interface HTMLManagedBatchListItemElement extends Components.ManagedBatchListItem, HTMLStencilElement {
    }
    var HTMLManagedBatchListItemElement: {
        prototype: HTMLManagedBatchListItemElement;
        new (): HTMLManagedBatchListItemElement;
    };
    interface HTMLManagedProductListItemElement extends Components.ManagedProductListItem, HTMLStencilElement {
    }
    var HTMLManagedProductListItemElement: {
        prototype: HTMLManagedProductListItemElement;
        new (): HTMLManagedProductListItemElement;
    };
    interface HTMLPdmIonTableElement extends Components.PdmIonTable, HTMLStencilElement {
    }
    var HTMLPdmIonTableElement: {
        prototype: HTMLPdmIonTableElement;
        new (): HTMLPdmIonTableElement;
    };
    interface HTMLProductListItemElement extends Components.ProductListItem, HTMLStencilElement {
    }
    var HTMLProductListItemElement: {
        prototype: HTMLProductListItemElement;
        new (): HTMLProductListItemElement;
    };
    interface HTMLStockListItemElement extends Components.StockListItem, HTMLStencilElement {
    }
    var HTMLStockListItemElement: {
        prototype: HTMLStockListItemElement;
        new (): HTMLStockListItemElement;
    };
    interface HTMLElementTagNameMap {
        "barcode-generator": HTMLBarcodeGeneratorElement;
        "batch-list-item": HTMLBatchListItemElement;
        "managed-batch-list-item": HTMLManagedBatchListItemElement;
        "managed-product-list-item": HTMLManagedProductListItemElement;
        "pdm-ion-table": HTMLPdmIonTableElement;
        "product-list-item": HTMLProductListItemElement;
        "stock-list-item": HTMLStockListItemElement;
    }
}
declare namespace LocalJSX {
    interface BarcodeGenerator {
        "data"?: any;
        /**
          * description: `This option allows to print the input data below the generated barcode.`, isMandatory: false, propertyType: `boolean`
         */
        "includeText"?: boolean;
        "scale"?: any;
        /**
          * description: `The size of the barcode in mm. Default is set to 32 mm.`, isMandatory: false, propertyType: `integer`
         */
        "size"?: any;
        /**
          * description: `A title that will be used for the current component instance.`, isMandatory: false, propertyType: `string`
         */
        "title"?: string;
        /**
          * description: `The barcode type. Accepted values are 'gs1datamatrix','datamatrix','qrcode', 'code128','code11','isbn'.`, isMandatory: true, propertyType: `string`
         */
        "type"?: string;
    }
    interface BatchListItem {
        /**
          * Through this event model is received (from webc-container, webc-for, webc-if or any component that supports a controller).
         */
        "onWebcardinal:model:get"?: (event: CustomEvent<any>) => void;
    }
    interface ManagedBatchListItem {
        "gtinBatch"?: string;
        /**
          * Through this event errors are passed
         */
        "onSendErrorEvent"?: (event: CustomEvent<any>) => void;
    }
    interface ManagedProductListItem {
        "gtin"?: string;
        /**
          * Through this event errors are passed
         */
        "onSendErrorEvent"?: (event: CustomEvent<any>) => void;
    }
    interface PdmIonTable {
        "buttons"?: string[];
        /**
          * Shows the search bar or not. (not working)
         */
        "canQuery"?: boolean;
        "currentPage"?: number;
        "iconName"?: string;
        /**
          * if the {@link PdmIonTable} is set to mode:  - {@link ION_TABLE_MODES.BY_REF}: must be the querying attribute name so the items can query their own value  - {@link ION_TABLE_MODES.BY_MODEL}: must be the model chain for content list
         */
        "itemReference"?: string;
        /**
          * The tag for the item type that the table should use eg: 'li' would create list items
         */
        "itemType"?: string;
        "itemsPerPage"?: number;
        "loadingMessage"?: string;
        /**
          * sets the name of the manager to use Only required if mode if {@link PdmIonTable#mode} is set to {@link ION_TABLE_MODES.BY_REF}
         */
        "manager"?: string;
        /**
          * can be any of {@link ION_TABLE_MODES} Decides if the tables works by:  - {@link ION_TABLE_MODES.BY_MODEL}: uses the WebCardinal model api
         */
        "mode"?: string;
        "noContentMessage"?: string;
        /**
          * Through this event errors are passed
         */
        "onSendErrorEvent"?: (event: CustomEvent<any>) => void;
        /**
          * Through this event model is received (from webc-container, webc-for, webc-if or any component that supports a controller).
         */
        "onWebcardinal:model:get"?: (event: CustomEvent<any>) => void;
        "pageCount"?: number;
        "paginated"?: boolean;
        /**
          * Querying/paginating Params - only available when mode is set by ref
         */
        "query"?: string;
        "sort"?: string;
        /**
          * Graphical Params
         */
        "title"?: string;
    }
    interface ProductListItem {
        /**
          * Through this event model is received (from webc-container, webc-for, webc-if or any component that supports a controller).
         */
        "onWebcardinal:model:get"?: (event: CustomEvent<any>) => void;
    }
    interface StockListItem {
        /**
          * Through this event model is received (from webc-container, webc-for, webc-if or any component that supports a controller).
         */
        "onWebcardinal:model:get"?: (event: CustomEvent<any>) => void;
    }
    interface IntrinsicElements {
        "barcode-generator": BarcodeGenerator;
        "batch-list-item": BatchListItem;
        "managed-batch-list-item": ManagedBatchListItem;
        "managed-product-list-item": ManagedProductListItem;
        "pdm-ion-table": PdmIonTable;
        "product-list-item": ProductListItem;
        "stock-list-item": StockListItem;
    }
}
export { LocalJSX as JSX };
declare module "@stencil/core" {
    export namespace JSX {
        interface IntrinsicElements {
            "barcode-generator": LocalJSX.BarcodeGenerator & JSXBase.HTMLAttributes<HTMLBarcodeGeneratorElement>;
            "batch-list-item": LocalJSX.BatchListItem & JSXBase.HTMLAttributes<HTMLBatchListItemElement>;
            "managed-batch-list-item": LocalJSX.ManagedBatchListItem & JSXBase.HTMLAttributes<HTMLManagedBatchListItemElement>;
            "managed-product-list-item": LocalJSX.ManagedProductListItem & JSXBase.HTMLAttributes<HTMLManagedProductListItemElement>;
            "pdm-ion-table": LocalJSX.PdmIonTable & JSXBase.HTMLAttributes<HTMLPdmIonTableElement>;
            "product-list-item": LocalJSX.ProductListItem & JSXBase.HTMLAttributes<HTMLProductListItemElement>;
            "stock-list-item": LocalJSX.StockListItem & JSXBase.HTMLAttributes<HTMLStockListItemElement>;
        }
    }
}
