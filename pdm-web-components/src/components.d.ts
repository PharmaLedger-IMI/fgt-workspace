/* eslint-disable */
/* tslint:disable */
/**
 * This is an autogenerated file created by the Stencil compiler.
 * It contains typing information for all components that exist in this project.
 */
import { HTMLStencilElement, JSXBase } from "@stencil/core/internal";
import { OverlayEventDetail } from "@ionic/core";
export namespace Components {
    interface BarcodeGenerator {
        /**
          * description: `A barcodeTitle that will be used for the current component instance.`, isMandatory: false, propertyType: `string`
         */
        "barcodeTitle": string;
        "data": any;
        "includeText"?: boolean;
        "scale"?: any;
        /**
          * description: `The size of the barcode in mm. Default is set to 32 mm.`, isMandatory: false, propertyType: `integer`
         */
        "size"?: any;
        /**
          * description: `The barcode type. Accepted values are 'gs1datamatrix','datamatrix','qrcode', 'code128','code11','isbn'.`, isMandatory: true, propertyType: `string`
         */
        "type": string;
    }
    interface BatchChip {
        "expiryThreshold"?: number;
        "gtinBatch": string;
        "loaderType"?: string;
        "mode"?: string;
        "quantity"?: number;
    }
    interface ManagedBatchListItem {
        "gtinBatch": string;
        "refresh": () => Promise<void>;
    }
    interface ManagedIssuedShipment {
        "availableString": string;
        "confirmedString": string;
        "delayString": string;
        "detailsString": string;
        "noStockString": string;
        "proceedString": string;
        "productsString": string;
        "refresh": () => Promise<void>;
        "rejectString": string;
        "remainingString": string;
        "selectOrderLine": (gtin: any) => Promise<void>;
        "selectProductString": string;
        "shipmentId": string;
        "stockString": string;
        "titleString": string;
        "unavailableString": string;
    }
    interface ManagedOrderListItem {
        "orderId": string;
        "orderlineCount"?: number;
        "refresh": () => Promise<void>;
        "type"?: string;
    }
    interface ManagedOrderlineListItem {
        "createdOnLabel"?: string;
        "gtinLabel"?: string;
        "nameLabel"?: string;
        "orderLine": string;
        "quantityLabel"?: string;
        "refresh": () => Promise<void>;
        "requesterLabel"?: string;
        "senderLabel"?: string;
        "statusLabel"?: string;
    }
    interface ManagedOrderlineStockChip {
        "available"?: number;
        "button"?: string;
        "gtin": string;
        "loaderType"?: string;
        "mode"?: string;
        "quantity"?: number;
        "threshold"?: number;
    }
    interface ManagedProductListItem {
        "gtin": string;
        "refresh": () => Promise<void>;
    }
    interface ManagedReceivedOrder {
        "availableString": string;
        "confirmAllString": string;
        "confirmedString": string;
        "delayString": string;
        "detailsString": string;
        "noStockString": string;
        "orderId": string;
        "proceedString": string;
        "productsString": string;
        "refresh": () => Promise<void>;
        "rejectString": string;
        "remainingString": string;
        "resetAllString": string;
        "selectOrderLine": (gtin: any) => Promise<void>;
        "selectProductString": string;
        "stockString": string;
        "titleString": string;
        "unavailableString": string;
    }
    interface ManagedShipmentListItem {
        "refresh": () => Promise<void>;
        "shipmentId": string;
        "shipmentLineCount"?: number;
        "type"?: string;
    }
    interface ManagedShipmentlineListItem {
        "batchLabel"?: string;
        "createdOnLabel"?: string;
        "gtinLabel"?: string;
        "nameLabel"?: string;
        "quantityLabel"?: string;
        "refresh": () => Promise<void>;
        "requesterLabel"?: string;
        "senderLabel"?: string;
        "shipmentLine": string;
        "statusLabel"?: string;
    }
    interface ManagedStockListItem {
        "gtin": string;
        "refresh": () => Promise<void>;
    }
    interface MenuTabButton {
        "badge"?: number;
        "iconName"?: string;
        "label"?: string;
        "mode"?: string;
        "tab": string;
    }
    interface MoreChip {
        "color"?: string;
        "float"?: string;
        "iconName"?: string;
        "outline"?: boolean;
        "text"?: string;
    }
    interface MultiSpinner {
        "type"?: string;
    }
    interface PdmBarcodeScanner {
        "data": any;
        "loaderType"?: string;
        "switchCamera": () => Promise<void>;
    }
    interface PdmBarcodeScannerController {
        "barcodeTitle"?: string;
        "changeCamera": () => Promise<void>;
        "dismiss": (result?: any) => Promise<void>;
        "holdForScan": (callback: any) => Promise<any>;
        "present": (props?: any) => Promise<void>;
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
          * Option props to be passed to child elements in from a JSON object in value key format only format
         */
        "itemProps"?: any;
        /**
          * the querying attribute name so the items can query their own value
         */
        "itemReference": string;
        /**
          * The tag for the item type that the table should use eg: 'li' would create list items
         */
        "itemType": string;
        "itemsPerPage"?: number;
        "loadingMessage"?: string;
        /**
          * sets the name of the manager to use
         */
        "manager"?: string;
        "noContentMessage"?: string;
        "pageCount"?: number;
        "paginated"?: boolean;
        /**
          * Querying/paginating Params - only available when mode is set by ref
         */
        "query"?: string;
        "refresh": () => Promise<void>;
        "searchBarPlaceholder"?: string;
        "sort"?: string;
        /**
          * Graphical Params
         */
        "tableTitle": string;
    }
    interface PdmSsappLoader {
        "loader"?: string;
        "markAsLoaded": (evt: any) => Promise<void>;
        "timeout"?: number;
        "updateStatus": (evt: any) => Promise<void>;
    }
}
declare global {
    interface HTMLBarcodeGeneratorElement extends Components.BarcodeGenerator, HTMLStencilElement {
    }
    var HTMLBarcodeGeneratorElement: {
        prototype: HTMLBarcodeGeneratorElement;
        new (): HTMLBarcodeGeneratorElement;
    };
    interface HTMLBatchChipElement extends Components.BatchChip, HTMLStencilElement {
    }
    var HTMLBatchChipElement: {
        prototype: HTMLBatchChipElement;
        new (): HTMLBatchChipElement;
    };
    interface HTMLManagedBatchListItemElement extends Components.ManagedBatchListItem, HTMLStencilElement {
    }
    var HTMLManagedBatchListItemElement: {
        prototype: HTMLManagedBatchListItemElement;
        new (): HTMLManagedBatchListItemElement;
    };
    interface HTMLManagedIssuedShipmentElement extends Components.ManagedIssuedShipment, HTMLStencilElement {
    }
    var HTMLManagedIssuedShipmentElement: {
        prototype: HTMLManagedIssuedShipmentElement;
        new (): HTMLManagedIssuedShipmentElement;
    };
    interface HTMLManagedOrderListItemElement extends Components.ManagedOrderListItem, HTMLStencilElement {
    }
    var HTMLManagedOrderListItemElement: {
        prototype: HTMLManagedOrderListItemElement;
        new (): HTMLManagedOrderListItemElement;
    };
    interface HTMLManagedOrderlineListItemElement extends Components.ManagedOrderlineListItem, HTMLStencilElement {
    }
    var HTMLManagedOrderlineListItemElement: {
        prototype: HTMLManagedOrderlineListItemElement;
        new (): HTMLManagedOrderlineListItemElement;
    };
    interface HTMLManagedOrderlineStockChipElement extends Components.ManagedOrderlineStockChip, HTMLStencilElement {
    }
    var HTMLManagedOrderlineStockChipElement: {
        prototype: HTMLManagedOrderlineStockChipElement;
        new (): HTMLManagedOrderlineStockChipElement;
    };
    interface HTMLManagedProductListItemElement extends Components.ManagedProductListItem, HTMLStencilElement {
    }
    var HTMLManagedProductListItemElement: {
        prototype: HTMLManagedProductListItemElement;
        new (): HTMLManagedProductListItemElement;
    };
    interface HTMLManagedReceivedOrderElement extends Components.ManagedReceivedOrder, HTMLStencilElement {
    }
    var HTMLManagedReceivedOrderElement: {
        prototype: HTMLManagedReceivedOrderElement;
        new (): HTMLManagedReceivedOrderElement;
    };
    interface HTMLManagedShipmentListItemElement extends Components.ManagedShipmentListItem, HTMLStencilElement {
    }
    var HTMLManagedShipmentListItemElement: {
        prototype: HTMLManagedShipmentListItemElement;
        new (): HTMLManagedShipmentListItemElement;
    };
    interface HTMLManagedShipmentlineListItemElement extends Components.ManagedShipmentlineListItem, HTMLStencilElement {
    }
    var HTMLManagedShipmentlineListItemElement: {
        prototype: HTMLManagedShipmentlineListItemElement;
        new (): HTMLManagedShipmentlineListItemElement;
    };
    interface HTMLManagedStockListItemElement extends Components.ManagedStockListItem, HTMLStencilElement {
    }
    var HTMLManagedStockListItemElement: {
        prototype: HTMLManagedStockListItemElement;
        new (): HTMLManagedStockListItemElement;
    };
    interface HTMLMenuTabButtonElement extends Components.MenuTabButton, HTMLStencilElement {
    }
    var HTMLMenuTabButtonElement: {
        prototype: HTMLMenuTabButtonElement;
        new (): HTMLMenuTabButtonElement;
    };
    interface HTMLMoreChipElement extends Components.MoreChip, HTMLStencilElement {
    }
    var HTMLMoreChipElement: {
        prototype: HTMLMoreChipElement;
        new (): HTMLMoreChipElement;
    };
    interface HTMLMultiSpinnerElement extends Components.MultiSpinner, HTMLStencilElement {
    }
    var HTMLMultiSpinnerElement: {
        prototype: HTMLMultiSpinnerElement;
        new (): HTMLMultiSpinnerElement;
    };
    interface HTMLPdmBarcodeScannerElement extends Components.PdmBarcodeScanner, HTMLStencilElement {
    }
    var HTMLPdmBarcodeScannerElement: {
        prototype: HTMLPdmBarcodeScannerElement;
        new (): HTMLPdmBarcodeScannerElement;
    };
    interface HTMLPdmBarcodeScannerControllerElement extends Components.PdmBarcodeScannerController, HTMLStencilElement {
    }
    var HTMLPdmBarcodeScannerControllerElement: {
        prototype: HTMLPdmBarcodeScannerControllerElement;
        new (): HTMLPdmBarcodeScannerControllerElement;
    };
    interface HTMLPdmIonTableElement extends Components.PdmIonTable, HTMLStencilElement {
    }
    var HTMLPdmIonTableElement: {
        prototype: HTMLPdmIonTableElement;
        new (): HTMLPdmIonTableElement;
    };
    interface HTMLPdmSsappLoaderElement extends Components.PdmSsappLoader, HTMLStencilElement {
    }
    var HTMLPdmSsappLoaderElement: {
        prototype: HTMLPdmSsappLoaderElement;
        new (): HTMLPdmSsappLoaderElement;
    };
    interface HTMLElementTagNameMap {
        "barcode-generator": HTMLBarcodeGeneratorElement;
        "batch-chip": HTMLBatchChipElement;
        "managed-batch-list-item": HTMLManagedBatchListItemElement;
        "managed-issued-shipment": HTMLManagedIssuedShipmentElement;
        "managed-order-list-item": HTMLManagedOrderListItemElement;
        "managed-orderline-list-item": HTMLManagedOrderlineListItemElement;
        "managed-orderline-stock-chip": HTMLManagedOrderlineStockChipElement;
        "managed-product-list-item": HTMLManagedProductListItemElement;
        "managed-received-order": HTMLManagedReceivedOrderElement;
        "managed-shipment-list-item": HTMLManagedShipmentListItemElement;
        "managed-shipmentline-list-item": HTMLManagedShipmentlineListItemElement;
        "managed-stock-list-item": HTMLManagedStockListItemElement;
        "menu-tab-button": HTMLMenuTabButtonElement;
        "more-chip": HTMLMoreChipElement;
        "multi-spinner": HTMLMultiSpinnerElement;
        "pdm-barcode-scanner": HTMLPdmBarcodeScannerElement;
        "pdm-barcode-scanner-controller": HTMLPdmBarcodeScannerControllerElement;
        "pdm-ion-table": HTMLPdmIonTableElement;
        "pdm-ssapp-loader": HTMLPdmSsappLoaderElement;
    }
}
declare namespace LocalJSX {
    interface BarcodeGenerator {
        /**
          * description: `A barcodeTitle that will be used for the current component instance.`, isMandatory: false, propertyType: `string`
         */
        "barcodeTitle"?: string;
        "data"?: any;
        "includeText"?: boolean;
        "scale"?: any;
        /**
          * description: `The size of the barcode in mm. Default is set to 32 mm.`, isMandatory: false, propertyType: `integer`
         */
        "size"?: any;
        /**
          * description: `The barcode type. Accepted values are 'gs1datamatrix','datamatrix','qrcode', 'code128','code11','isbn'.`, isMandatory: true, propertyType: `string`
         */
        "type"?: string;
    }
    interface BatchChip {
        "expiryThreshold"?: number;
        "gtinBatch"?: string;
        "loaderType"?: string;
        "mode"?: string;
        "quantity"?: number;
    }
    interface ManagedBatchListItem {
        "gtinBatch"?: string;
        /**
          * Through this event errors are passed
         */
        "onSsapp-send-error"?: (event: CustomEvent<any>) => void;
    }
    interface ManagedIssuedShipment {
        "availableString"?: string;
        "confirmedString"?: string;
        "delayString"?: string;
        "detailsString"?: string;
        "noStockString"?: string;
        /**
          * Through this event shipment creation requests are made
         */
        "onCreated"?: (event: CustomEvent<any>) => void;
        /**
          * Through this event shipment rejection requests are made
         */
        "onRejected"?: (event: CustomEvent<any>) => void;
        /**
          * Through this event navigation requests to tabs are made
         */
        "onSsapp-navigate-tab"?: (event: CustomEvent<any>) => void;
        /**
          * Through this event errors are passed
         */
        "onSsapp-send-error"?: (event: CustomEvent<any>) => void;
        "proceedString"?: string;
        "productsString"?: string;
        "rejectString"?: string;
        "remainingString"?: string;
        "selectProductString"?: string;
        "shipmentId"?: string;
        "stockString"?: string;
        "titleString"?: string;
        "unavailableString"?: string;
    }
    interface ManagedOrderListItem {
        /**
          * Through this event navigation requests to tabs are made
         */
        "onSsapp-navigate-tab"?: (event: CustomEvent<any>) => void;
        /**
          * Through this event errors are passed
         */
        "onSsapp-send-error"?: (event: CustomEvent<any>) => void;
        "orderId"?: string;
        "orderlineCount"?: number;
        "type"?: string;
    }
    interface ManagedOrderlineListItem {
        "createdOnLabel"?: string;
        "gtinLabel"?: string;
        "nameLabel"?: string;
        /**
          * Through this event navigation requests to tabs are made
         */
        "onSsapp-navigate-tab"?: (event: CustomEvent<any>) => void;
        /**
          * Through this event errors are passed
         */
        "onSsapp-send-error"?: (event: CustomEvent<any>) => void;
        "orderLine"?: string;
        "quantityLabel"?: string;
        "requesterLabel"?: string;
        "senderLabel"?: string;
        "statusLabel"?: string;
    }
    interface ManagedOrderlineStockChip {
        "available"?: number;
        "button"?: string;
        "gtin"?: string;
        "loaderType"?: string;
        "mode"?: string;
        /**
          * Through this event actions are passed
         */
        "onSendAction"?: (event: CustomEvent<OverlayEventDetail>) => void;
        "quantity"?: number;
        "threshold"?: number;
    }
    interface ManagedProductListItem {
        "gtin"?: string;
        /**
          * Through this event navigation requests to tabs are made
         */
        "onSsapp-navigate-tab"?: (event: CustomEvent<any>) => void;
        /**
          * Through this event errors are passed
         */
        "onSsapp-send-error"?: (event: CustomEvent<any>) => void;
    }
    interface ManagedReceivedOrder {
        "availableString"?: string;
        "confirmAllString"?: string;
        "confirmedString"?: string;
        "delayString"?: string;
        "detailsString"?: string;
        "noStockString"?: string;
        /**
          * Through this event shipment creation requests are made
         */
        "onCreated"?: (event: CustomEvent<any>) => void;
        /**
          * Through this event shipment rejection requests are made
         */
        "onRejected"?: (event: CustomEvent<any>) => void;
        /**
          * Through this event navigation requests to tabs are made
         */
        "onSsapp-navigate-tab"?: (event: CustomEvent<any>) => void;
        /**
          * Through this event errors are passed
         */
        "onSsapp-send-error"?: (event: CustomEvent<any>) => void;
        "orderId"?: string;
        "proceedString"?: string;
        "productsString"?: string;
        "rejectString"?: string;
        "remainingString"?: string;
        "resetAllString"?: string;
        "selectProductString"?: string;
        "stockString"?: string;
        "titleString"?: string;
        "unavailableString"?: string;
    }
    interface ManagedShipmentListItem {
        /**
          * Through this event navigation requests to tabs are made
         */
        "onSsapp-navigate-tab"?: (event: CustomEvent<any>) => void;
        /**
          * Through this event errors are passed
         */
        "onSsapp-send-error"?: (event: CustomEvent<any>) => void;
        "shipmentId"?: string;
        "shipmentLineCount"?: number;
        "type"?: string;
    }
    interface ManagedShipmentlineListItem {
        "batchLabel"?: string;
        "createdOnLabel"?: string;
        "gtinLabel"?: string;
        "nameLabel"?: string;
        /**
          * Through this event navigation requests to tabs are made
         */
        "onSsapp-navigate-tab"?: (event: CustomEvent<any>) => void;
        /**
          * Through this event errors are passed
         */
        "onSsapp-send-error"?: (event: CustomEvent<any>) => void;
        "quantityLabel"?: string;
        "requesterLabel"?: string;
        "senderLabel"?: string;
        "shipmentLine"?: string;
        "statusLabel"?: string;
    }
    interface ManagedStockListItem {
        "gtin"?: string;
        /**
          * Through this event navigation requests to tabs are made
         */
        "onSsapp-navigate-tab"?: (event: CustomEvent<any>) => void;
        /**
          * Through this event errors are passed
         */
        "onSsapp-send-error"?: (event: CustomEvent<any>) => void;
    }
    interface MenuTabButton {
        "badge"?: number;
        "iconName"?: string;
        "label"?: string;
        "mode"?: string;
        /**
          * Through this event navigation requests to tabs are made
         */
        "onSsapp-navigate-tab"?: (event: CustomEvent<any>) => void;
        "tab"?: string;
    }
    interface MoreChip {
        "color"?: string;
        "float"?: string;
        "iconName"?: string;
        /**
          * Through this event errors are passed
         */
        "onSsapp-show-more"?: (event: CustomEvent<any>) => void;
        "outline"?: boolean;
        "text"?: string;
    }
    interface MultiSpinner {
        "type"?: string;
    }
    interface PdmBarcodeScanner {
        "data"?: any;
        "loaderType"?: string;
        /**
          * Through this event data is passed
         */
        "onSsapp-action"?: (event: CustomEvent<any>) => void;
        /**
          * Through this event errors are passed
         */
        "onSsapp-send-error"?: (event: CustomEvent<any>) => void;
    }
    interface PdmBarcodeScannerController {
        "barcodeTitle"?: string;
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
          * Option props to be passed to child elements in from a JSON object in value key format only format
         */
        "itemProps"?: any;
        /**
          * the querying attribute name so the items can query their own value
         */
        "itemReference"?: string;
        /**
          * The tag for the item type that the table should use eg: 'li' would create list items
         */
        "itemType"?: string;
        "itemsPerPage"?: number;
        "loadingMessage"?: string;
        /**
          * sets the name of the manager to use
         */
        "manager"?: string;
        "noContentMessage"?: string;
        /**
          * Through this event errors are passed
         */
        "onSsapp-send-error"?: (event: CustomEvent<any>) => void;
        "pageCount"?: number;
        "paginated"?: boolean;
        /**
          * Querying/paginating Params - only available when mode is set by ref
         */
        "query"?: string;
        "searchBarPlaceholder"?: string;
        "sort"?: string;
        /**
          * Graphical Params
         */
        "tableTitle"?: string;
    }
    interface PdmSsappLoader {
        "loader"?: string;
        "timeout"?: number;
    }
    interface IntrinsicElements {
        "barcode-generator": BarcodeGenerator;
        "batch-chip": BatchChip;
        "managed-batch-list-item": ManagedBatchListItem;
        "managed-issued-shipment": ManagedIssuedShipment;
        "managed-order-list-item": ManagedOrderListItem;
        "managed-orderline-list-item": ManagedOrderlineListItem;
        "managed-orderline-stock-chip": ManagedOrderlineStockChip;
        "managed-product-list-item": ManagedProductListItem;
        "managed-received-order": ManagedReceivedOrder;
        "managed-shipment-list-item": ManagedShipmentListItem;
        "managed-shipmentline-list-item": ManagedShipmentlineListItem;
        "managed-stock-list-item": ManagedStockListItem;
        "menu-tab-button": MenuTabButton;
        "more-chip": MoreChip;
        "multi-spinner": MultiSpinner;
        "pdm-barcode-scanner": PdmBarcodeScanner;
        "pdm-barcode-scanner-controller": PdmBarcodeScannerController;
        "pdm-ion-table": PdmIonTable;
        "pdm-ssapp-loader": PdmSsappLoader;
    }
}
export { LocalJSX as JSX };
declare module "@stencil/core" {
    export namespace JSX {
        interface IntrinsicElements {
            "barcode-generator": LocalJSX.BarcodeGenerator & JSXBase.HTMLAttributes<HTMLBarcodeGeneratorElement>;
            "batch-chip": LocalJSX.BatchChip & JSXBase.HTMLAttributes<HTMLBatchChipElement>;
            "managed-batch-list-item": LocalJSX.ManagedBatchListItem & JSXBase.HTMLAttributes<HTMLManagedBatchListItemElement>;
            "managed-issued-shipment": LocalJSX.ManagedIssuedShipment & JSXBase.HTMLAttributes<HTMLManagedIssuedShipmentElement>;
            "managed-order-list-item": LocalJSX.ManagedOrderListItem & JSXBase.HTMLAttributes<HTMLManagedOrderListItemElement>;
            "managed-orderline-list-item": LocalJSX.ManagedOrderlineListItem & JSXBase.HTMLAttributes<HTMLManagedOrderlineListItemElement>;
            "managed-orderline-stock-chip": LocalJSX.ManagedOrderlineStockChip & JSXBase.HTMLAttributes<HTMLManagedOrderlineStockChipElement>;
            "managed-product-list-item": LocalJSX.ManagedProductListItem & JSXBase.HTMLAttributes<HTMLManagedProductListItemElement>;
            "managed-received-order": LocalJSX.ManagedReceivedOrder & JSXBase.HTMLAttributes<HTMLManagedReceivedOrderElement>;
            "managed-shipment-list-item": LocalJSX.ManagedShipmentListItem & JSXBase.HTMLAttributes<HTMLManagedShipmentListItemElement>;
            "managed-shipmentline-list-item": LocalJSX.ManagedShipmentlineListItem & JSXBase.HTMLAttributes<HTMLManagedShipmentlineListItemElement>;
            "managed-stock-list-item": LocalJSX.ManagedStockListItem & JSXBase.HTMLAttributes<HTMLManagedStockListItemElement>;
            "menu-tab-button": LocalJSX.MenuTabButton & JSXBase.HTMLAttributes<HTMLMenuTabButtonElement>;
            "more-chip": LocalJSX.MoreChip & JSXBase.HTMLAttributes<HTMLMoreChipElement>;
            "multi-spinner": LocalJSX.MultiSpinner & JSXBase.HTMLAttributes<HTMLMultiSpinnerElement>;
            "pdm-barcode-scanner": LocalJSX.PdmBarcodeScanner & JSXBase.HTMLAttributes<HTMLPdmBarcodeScannerElement>;
            "pdm-barcode-scanner-controller": LocalJSX.PdmBarcodeScannerController & JSXBase.HTMLAttributes<HTMLPdmBarcodeScannerControllerElement>;
            "pdm-ion-table": LocalJSX.PdmIonTable & JSXBase.HTMLAttributes<HTMLPdmIonTableElement>;
            "pdm-ssapp-loader": LocalJSX.PdmSsappLoader & JSXBase.HTMLAttributes<HTMLPdmSsappLoaderElement>;
        }
    }
}
