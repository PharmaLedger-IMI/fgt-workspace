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
    interface GenericChip {
        "chipLabel": string;
        "color"?: string;
        "outline"?: boolean;
    }
    interface ManagedBatch {
        "addBatchString": string;
        "backString": string;
        "batchNumberString": string;
        "cancelString": string;
        "expiryString": string;
        "gtinRef"?: string;
        "manageString": string;
        "refresh": (newGtinRef: any, oldGtinRef: any) => Promise<void>;
        "serialsPlaceholderString": string;
        "serialsString": string;
        "titleString": string;
    }
    interface ManagedBatchListItem {
        "gtinBatch": string;
        "refresh": () => Promise<void>;
    }
    interface ManagedIssuedOrder {
        "detailsString": string;
        "directoryString": string;
        "fromAtString": string;
        "fromPlaceholderString": string;
        "fromString": string;
        "orderLines": any;
        "orderLinesString": string;
        "proceedString": string;
        "productsCodeString": string;
        "productsString": string;
        "quantityString": string;
        "requester": any;
        "titleString": string;
        "toAtString": string;
        "updateDirectory": () => Promise<void>;
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
    interface ManagedProduct {
        "addProductString": string;
        "backString": string;
        "batchesAddButton": string;
        "batchesTitle": string;
        "cancelString": string;
        "descriptionPlaceholderString": string;
        "descriptionString": string;
        "gtin"?: string;
        "gtinString": string;
        "manageString": string;
        "manufName"?: string;
        "manufString": string;
        "nameString": string;
        "refresh": (newGtin: any, oldGtin: any) => Promise<void>;
        "titleString": string;
    }
    interface ManagedProductListItem {
        "batchDisplayCount": number;
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
        "orderString": string;
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
        /**
          * the tab name or a list of options like: [  {    label: '...',    tab: 'tab name'  } ]
         */
        "tab": string | any;
    }
    interface MoreChip {
        "color": string;
        "iconName": string;
    }
    interface MultiSpinner {
        "type"?: string;
    }
    interface PdmBarcodeScanner {
        "compatibilityMode"?: string;
        "data": any;
        "loaderType"?: string;
        "switchCamera": () => Promise<void>;
        "timeout"?: number;
    }
    interface PdmBarcodeScannerController {
        "barcodeTitle"?: string;
        "changeCamera": () => Promise<void>;
        "dismiss": (result?: any) => Promise<void>;
        "holdForScan": (callback: any) => Promise<any>;
        "present": (props?: any, callback?: any) => Promise<any>;
        "scannerMode"?: string;
    }
    interface PdmIonTable {
        /**
          * the querying attribute name so the items can query their own value
         */
        "autoLoad": boolean;
        "buttons"?: string[] | {};
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
        "sendRealEvents": boolean;
        "sort"?: string;
        /**
          * Graphical Params
         */
        "tableTitle": string;
    }
    interface PdmItemOrganizer {
        /**
          * The Handler on the click in each item when expanded
         */
        "clickHandler": (any) => void;
        /**
          * the Tag for the component to be rendered
         */
        "componentName": string;
        /**
          * the list of props that will be passed to the HTML Element {@link componentName}
         */
        "componentProps": string;
        /**
          * The number of items to display (minimum is 1), defaults to 3
         */
        "displayCount": number;
        /**
          * The identifying prop to be return upon click (must exist in the supplied {@link componentProps}
         */
        "idProp": string;
        /**
          * If the component does not generate an ion-item (so it can be handled by an ion-list) this must be set to false
         */
        "isItem": boolean;
    }
    interface PdmSsappLoader {
        "loader"?: string;
        "markAsLoaded": () => Promise<void>;
        "timeout"?: number;
        "updateStatus": (evt: any) => Promise<void>;
    }
    interface SimpleManagedProductItem {
        "gtin": string;
        "refresh": () => Promise<void>;
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
    interface HTMLGenericChipElement extends Components.GenericChip, HTMLStencilElement {
    }
    var HTMLGenericChipElement: {
        prototype: HTMLGenericChipElement;
        new (): HTMLGenericChipElement;
    };
    interface HTMLManagedBatchElement extends Components.ManagedBatch, HTMLStencilElement {
    }
    var HTMLManagedBatchElement: {
        prototype: HTMLManagedBatchElement;
        new (): HTMLManagedBatchElement;
    };
    interface HTMLManagedBatchListItemElement extends Components.ManagedBatchListItem, HTMLStencilElement {
    }
    var HTMLManagedBatchListItemElement: {
        prototype: HTMLManagedBatchListItemElement;
        new (): HTMLManagedBatchListItemElement;
    };
    interface HTMLManagedIssuedOrderElement extends Components.ManagedIssuedOrder, HTMLStencilElement {
    }
    var HTMLManagedIssuedOrderElement: {
        prototype: HTMLManagedIssuedOrderElement;
        new (): HTMLManagedIssuedOrderElement;
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
    interface HTMLManagedProductElement extends Components.ManagedProduct, HTMLStencilElement {
    }
    var HTMLManagedProductElement: {
        prototype: HTMLManagedProductElement;
        new (): HTMLManagedProductElement;
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
    interface HTMLPdmItemOrganizerElement extends Components.PdmItemOrganizer, HTMLStencilElement {
    }
    var HTMLPdmItemOrganizerElement: {
        prototype: HTMLPdmItemOrganizerElement;
        new (): HTMLPdmItemOrganizerElement;
    };
    interface HTMLPdmSsappLoaderElement extends Components.PdmSsappLoader, HTMLStencilElement {
    }
    var HTMLPdmSsappLoaderElement: {
        prototype: HTMLPdmSsappLoaderElement;
        new (): HTMLPdmSsappLoaderElement;
    };
    interface HTMLSimpleManagedProductItemElement extends Components.SimpleManagedProductItem, HTMLStencilElement {
    }
    var HTMLSimpleManagedProductItemElement: {
        prototype: HTMLSimpleManagedProductItemElement;
        new (): HTMLSimpleManagedProductItemElement;
    };
    interface HTMLElementTagNameMap {
        "barcode-generator": HTMLBarcodeGeneratorElement;
        "batch-chip": HTMLBatchChipElement;
        "generic-chip": HTMLGenericChipElement;
        "managed-batch": HTMLManagedBatchElement;
        "managed-batch-list-item": HTMLManagedBatchListItemElement;
        "managed-issued-order": HTMLManagedIssuedOrderElement;
        "managed-issued-shipment": HTMLManagedIssuedShipmentElement;
        "managed-order-list-item": HTMLManagedOrderListItemElement;
        "managed-orderline-list-item": HTMLManagedOrderlineListItemElement;
        "managed-orderline-stock-chip": HTMLManagedOrderlineStockChipElement;
        "managed-product": HTMLManagedProductElement;
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
        "pdm-item-organizer": HTMLPdmItemOrganizerElement;
        "pdm-ssapp-loader": HTMLPdmSsappLoaderElement;
        "simple-managed-product-item": HTMLSimpleManagedProductItemElement;
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
    interface GenericChip {
        "chipLabel"?: string;
        "color"?: string;
        "outline"?: boolean;
    }
    interface ManagedBatch {
        "addBatchString"?: string;
        "backString"?: string;
        "batchNumberString"?: string;
        "cancelString"?: string;
        "expiryString"?: string;
        "gtinRef"?: string;
        "manageString"?: string;
        /**
          * Through this event action requests are made
         */
        "onSsapp-action"?: (event: CustomEvent<any>) => void;
        /**
          * Through this event navigation requests to tabs are made
         */
        "onSsapp-navigate-tab"?: (event: CustomEvent<any>) => void;
        /**
          * Through this event errors are passed
         */
        "onSsapp-send-error"?: (event: CustomEvent<any>) => void;
        "serialsPlaceholderString"?: string;
        "serialsString"?: string;
        "titleString"?: string;
    }
    interface ManagedBatchListItem {
        "gtinBatch"?: string;
        /**
          * Through this event navigation requests to tabs are made
         */
        "onSsapp-navigate-tab"?: (event: CustomEvent<any>) => void;
        /**
          * Through this event errors are passed
         */
        "onSsapp-send-error"?: (event: CustomEvent<any>) => void;
    }
    interface ManagedIssuedOrder {
        "detailsString"?: string;
        "directoryString"?: string;
        "fromAtString"?: string;
        "fromPlaceholderString"?: string;
        "fromString"?: string;
        /**
          * Through this event order creation requests are made
         */
        "onCreated"?: (event: CustomEvent<any>) => void;
        /**
          * Through this event navigation requests to tabs are made
         */
        "onSsapp-action"?: (event: CustomEvent<any>) => void;
        /**
          * Through this event errors are passed
         */
        "onSsapp-send-error"?: (event: CustomEvent<any>) => void;
        "orderLines"?: any;
        "orderLinesString"?: string;
        "proceedString"?: string;
        "productsCodeString"?: string;
        "productsString"?: string;
        "quantityString"?: string;
        "requester"?: any;
        "titleString"?: string;
        "toAtString"?: string;
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
        "onAcknowledged"?: (event: CustomEvent<any>) => void;
        /**
          * Through this event shipment creation requests are made
         */
        "onPickup"?: (event: CustomEvent<any>) => void;
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
    interface ManagedProduct {
        "addProductString"?: string;
        "backString"?: string;
        "batchesAddButton"?: string;
        "batchesTitle"?: string;
        "cancelString"?: string;
        "descriptionPlaceholderString"?: string;
        "descriptionString"?: string;
        "gtin"?: string;
        "gtinString"?: string;
        "manageString"?: string;
        "manufName"?: string;
        "manufString"?: string;
        "nameString"?: string;
        /**
          * Through this event action requests are made
         */
        "onSsapp-action"?: (event: CustomEvent<any>) => void;
        /**
          * Through this event navigation requests to tabs are made
         */
        "onSsapp-navigate-tab"?: (event: CustomEvent<any>) => void;
        /**
          * Through this event errors are passed
         */
        "onSsapp-send-error"?: (event: CustomEvent<any>) => void;
        "titleString"?: string;
    }
    interface ManagedProductListItem {
        "batchDisplayCount"?: number;
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
        "orderString"?: string;
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
        /**
          * the tab name or a list of options like: [  {    label: '...',    tab: 'tab name'  } ]
         */
        "tab"?: string | any;
    }
    interface MoreChip {
        "color"?: string;
        "iconName"?: string;
        /**
          * Through this event the clickEvent is passed
         */
        "onSsapp-show-more"?: (event: CustomEvent<any>) => void;
    }
    interface MultiSpinner {
        "type"?: string;
    }
    interface PdmBarcodeScanner {
        "compatibilityMode"?: string;
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
        "timeout"?: number;
    }
    interface PdmBarcodeScannerController {
        "barcodeTitle"?: string;
        "scannerMode"?: string;
    }
    interface PdmIonTable {
        /**
          * the querying attribute name so the items can query their own value
         */
        "autoLoad"?: boolean;
        "buttons"?: string[] | {};
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
        "sendRealEvents"?: boolean;
        "sort"?: string;
        /**
          * Graphical Params
         */
        "tableTitle"?: string;
    }
    interface PdmItemOrganizer {
        /**
          * The Handler on the click in each item when expanded
         */
        "clickHandler"?: (any) => void;
        /**
          * the Tag for the component to be rendered
         */
        "componentName"?: string;
        /**
          * the list of props that will be passed to the HTML Element {@link componentName}
         */
        "componentProps"?: string;
        /**
          * The number of items to display (minimum is 1), defaults to 3
         */
        "displayCount"?: number;
        /**
          * The identifying prop to be return upon click (must exist in the supplied {@link componentProps}
         */
        "idProp"?: string;
        /**
          * If the component does not generate an ion-item (so it can be handled by an ion-list) this must be set to false
         */
        "isItem"?: boolean;
    }
    interface PdmSsappLoader {
        "loader"?: string;
        "timeout"?: number;
    }
    interface SimpleManagedProductItem {
        "gtin"?: string;
        /**
          * Through this event navigation requests to tabs are made
         */
        "onSsapp-action"?: (event: CustomEvent<any>) => void;
        /**
          * Through this event errors are passed
         */
        "onSsapp-send-error"?: (event: CustomEvent<any>) => void;
    }
    interface IntrinsicElements {
        "barcode-generator": BarcodeGenerator;
        "batch-chip": BatchChip;
        "generic-chip": GenericChip;
        "managed-batch": ManagedBatch;
        "managed-batch-list-item": ManagedBatchListItem;
        "managed-issued-order": ManagedIssuedOrder;
        "managed-issued-shipment": ManagedIssuedShipment;
        "managed-order-list-item": ManagedOrderListItem;
        "managed-orderline-list-item": ManagedOrderlineListItem;
        "managed-orderline-stock-chip": ManagedOrderlineStockChip;
        "managed-product": ManagedProduct;
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
        "pdm-item-organizer": PdmItemOrganizer;
        "pdm-ssapp-loader": PdmSsappLoader;
        "simple-managed-product-item": SimpleManagedProductItem;
    }
}
export { LocalJSX as JSX };
declare module "@stencil/core" {
    export namespace JSX {
        interface IntrinsicElements {
            "barcode-generator": LocalJSX.BarcodeGenerator & JSXBase.HTMLAttributes<HTMLBarcodeGeneratorElement>;
            "batch-chip": LocalJSX.BatchChip & JSXBase.HTMLAttributes<HTMLBatchChipElement>;
            "generic-chip": LocalJSX.GenericChip & JSXBase.HTMLAttributes<HTMLGenericChipElement>;
            "managed-batch": LocalJSX.ManagedBatch & JSXBase.HTMLAttributes<HTMLManagedBatchElement>;
            "managed-batch-list-item": LocalJSX.ManagedBatchListItem & JSXBase.HTMLAttributes<HTMLManagedBatchListItemElement>;
            "managed-issued-order": LocalJSX.ManagedIssuedOrder & JSXBase.HTMLAttributes<HTMLManagedIssuedOrderElement>;
            "managed-issued-shipment": LocalJSX.ManagedIssuedShipment & JSXBase.HTMLAttributes<HTMLManagedIssuedShipmentElement>;
            "managed-order-list-item": LocalJSX.ManagedOrderListItem & JSXBase.HTMLAttributes<HTMLManagedOrderListItemElement>;
            "managed-orderline-list-item": LocalJSX.ManagedOrderlineListItem & JSXBase.HTMLAttributes<HTMLManagedOrderlineListItemElement>;
            "managed-orderline-stock-chip": LocalJSX.ManagedOrderlineStockChip & JSXBase.HTMLAttributes<HTMLManagedOrderlineStockChipElement>;
            "managed-product": LocalJSX.ManagedProduct & JSXBase.HTMLAttributes<HTMLManagedProductElement>;
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
            "pdm-item-organizer": LocalJSX.PdmItemOrganizer & JSXBase.HTMLAttributes<HTMLPdmItemOrganizerElement>;
            "pdm-ssapp-loader": LocalJSX.PdmSsappLoader & JSXBase.HTMLAttributes<HTMLPdmSsappLoaderElement>;
            "simple-managed-product-item": LocalJSX.SimpleManagedProductItem & JSXBase.HTMLAttributes<HTMLSimpleManagedProductItemElement>;
        }
    }
}
