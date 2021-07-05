import { B as BUILD, c as consoleDevInfo, p as plt, w as win, H, d as doc, N as NAMESPACE, a as promiseResolve, b as bootstrapLazy } from './index-d0e12a29.js';
import { g as globalScripts } from './app-globals-0f993ce5.js';

/*
 Stencil Client Patch Browser v2.6.0 | MIT Licensed | https://stenciljs.com
 */
const getDynamicImportFunction = (namespace) => `__sc_import_${namespace.replace(/\s|-/g, '_')}`;
const patchBrowser = () => {
    // NOTE!! This fn cannot use async/await!
    if (BUILD.isDev && !BUILD.isTesting) {
        consoleDevInfo('Running in development mode.');
    }
    if (BUILD.cssVarShim) {
        // shim css vars
        plt.$cssShim$ = win.__cssshim;
    }
    if (BUILD.cloneNodeFix) {
        // opted-in to polyfill cloneNode() for slot polyfilled components
        patchCloneNodeFix(H.prototype);
    }
    if (BUILD.profile && !performance.mark) {
        // not all browsers support performance.mark/measure (Safari 10)
        performance.mark = performance.measure = () => {
            /*noop*/
        };
        performance.getEntriesByName = () => [];
    }
    // @ts-ignore
    const scriptElm = BUILD.scriptDataOpts || BUILD.safari10 || BUILD.dynamicImportShim
        ? Array.from(doc.querySelectorAll('script')).find(s => new RegExp(`\/${NAMESPACE}(\\.esm)?\\.js($|\\?|#)`).test(s.src) || s.getAttribute('data-stencil-namespace') === NAMESPACE)
        : null;
    const importMeta = import.meta.url;
    const opts = BUILD.scriptDataOpts ? scriptElm['data-opts'] || {} : {};
    if (BUILD.safari10 && 'onbeforeload' in scriptElm && !history.scrollRestoration /* IS_ESM_BUILD */) {
        // Safari < v11 support: This IF is true if it's Safari below v11.
        // This fn cannot use async/await since Safari didn't support it until v11,
        // however, Safari 10 did support modules. Safari 10 also didn't support "nomodule",
        // so both the ESM file and nomodule file would get downloaded. Only Safari
        // has 'onbeforeload' in the script, and "history.scrollRestoration" was added
        // to Safari in v11. Return a noop then() so the async/await ESM code doesn't continue.
        // IS_ESM_BUILD is replaced at build time so this check doesn't happen in systemjs builds.
        return {
            then() {
                /* promise noop */
            },
        };
    }
    if (!BUILD.safari10 && importMeta !== '') {
        opts.resourcesUrl = new URL('.', importMeta).href;
    }
    else if (BUILD.dynamicImportShim || BUILD.safari10) {
        opts.resourcesUrl = new URL('.', new URL(scriptElm.getAttribute('data-resources-url') || scriptElm.src, win.location.href)).href;
        if (BUILD.dynamicImportShim) {
            patchDynamicImport(opts.resourcesUrl, scriptElm);
        }
        if (BUILD.dynamicImportShim && !win.customElements) {
            // module support, but no custom elements support (Old Edge)
            // @ts-ignore
            return import(/* webpackChunkName: "polyfills-dom" */ './dom-1b195079.js').then(() => opts);
        }
    }
    return promiseResolve(opts);
};
const patchDynamicImport = (base, orgScriptElm) => {
    const importFunctionName = getDynamicImportFunction(NAMESPACE);
    try {
        // test if this browser supports dynamic imports
        // There is a caching issue in V8, that breaks using import() in Function
        // By generating a random string, we can workaround it
        // Check https://bugs.chromium.org/p/chromium/issues/detail?id=990810 for more info
        win[importFunctionName] = new Function('w', `return import(w);//${Math.random()}`);
    }
    catch (e) {
        // this shim is specifically for browsers that do support "esm" imports
        // however, they do NOT support "dynamic" imports
        // basically this code is for old Edge, v18 and below
        const moduleMap = new Map();
        win[importFunctionName] = (src) => {
            const url = new URL(src, base).href;
            let mod = moduleMap.get(url);
            if (!mod) {
                const script = doc.createElement('script');
                script.type = 'module';
                script.crossOrigin = orgScriptElm.crossOrigin;
                script.src = URL.createObjectURL(new Blob([`import * as m from '${url}'; window.${importFunctionName}.m = m;`], { type: 'application/javascript' }));
                mod = new Promise(resolve => {
                    script.onload = () => {
                        resolve(win[importFunctionName].m);
                        script.remove();
                    };
                });
                moduleMap.set(url, mod);
                doc.head.appendChild(script);
            }
            return mod;
        };
    }
};
const patchCloneNodeFix = (HTMLElementPrototype) => {
    const nativeCloneNodeFn = HTMLElementPrototype.cloneNode;
    HTMLElementPrototype.cloneNode = function (deep) {
        if (this.nodeName === 'TEMPLATE') {
            return nativeCloneNodeFn.call(this, deep);
        }
        const clonedNode = nativeCloneNodeFn.call(this, false);
        const srcChildNodes = this.childNodes;
        if (deep) {
            for (let i = 0; i < srcChildNodes.length; i++) {
                // Node.ATTRIBUTE_NODE === 2, and checking because IE11
                if (srcChildNodes[i].nodeType !== 2) {
                    clonedNode.appendChild(srcChildNodes[i].cloneNode(true));
                }
            }
        }
        return clonedNode;
    };
};

patchBrowser().then(options => {
  globalScripts();
  return bootstrapLazy(JSON.parse("[[\"managed-order\",[[0,\"managed-order\",{\"orderRef\":[1025,\"order-ref\"],\"orderLines\":[1025,\"order-lines-json\"],\"identity\":[8],\"orderType\":[1,\"order-type\"],\"titleString\":[1,\"create-title-string\"],\"manageString\":[1,\"manage-title-string\"],\"backString\":[1,\"back-string\"],\"scanString\":[1,\"scanner-title-string\"],\"createString\":[1,\"create-string\"],\"clearString\":[1,\"clear-string\"],\"detailsString\":[1025,\"details-string\"],\"fromString\":[1025,\"from-string\"],\"fromPlaceholderString\":[1025,\"from-placeholder-string\"],\"fromAtString\":[1025,\"from-at-string\"],\"toAtString\":[1025,\"to-at-string\"],\"productsString\":[1025,\"products-string\"],\"productsCodeString\":[1025,\"products-code-string\"],\"quantityString\":[1025,\"quantity-string\"],\"orderLinesString\":[1025,\"order-lines-string\"],\"directoryString\":[1025,\"directory-string\"],\"statusString\":[1025,\"status-string\"],\"stockString\":[1,\"stock-string\"],\"noStockString\":[1,\"no-stock-string\"],\"resetAllString\":[1,\"reset-all-string\"],\"confirmedString\":[1,\"confirmed-string\"],\"confirmAllString\":[1,\"confirm-all-string\"],\"availableString\":[1,\"available-string\"],\"unavailableString\":[1,\"unavailable-string\"],\"selectString\":[1,\"select-string\"],\"remainingString\":[1,\"remaining-string\"],\"orderMissingString\":[1,\"order-missing-string\"],\"rejectString\":[1,\"reject-string\"],\"proceedString\":[1,\"proceed-string\"],\"delayString\":[1,\"delay-string\"],\"suppliers\":[32],\"products\":[32],\"requesters\":[32],\"lines\":[32],\"participantId\":[32],\"senderAddress\":[32],\"currentGtin\":[32],\"currentQuantity\":[32],\"order\":[32],\"stockForProduct\":[32],\"selectedProduct\":[32],\"updateDirectory\":[64],\"refresh\":[64],\"reset\":[64]},[[0,\"ionChange\",\"onInputChange\"]]]]],[\"managed-shipment\",[[0,\"managed-shipment\",{\"shipmentRef\":[1025,\"shipment-ref\"],\"orderJSON\":[1025,\"order-json\"],\"identity\":[8],\"shipmentType\":[1,\"shipment-type\"],\"titleString\":[1,\"create-title-string\"],\"manageString\":[1,\"manage-title-string\"],\"backString\":[1,\"back-string\"],\"scanString\":[1,\"scanner-title-string\"],\"createString\":[1,\"create-string\"],\"clearString\":[1,\"clear-string\"],\"orderIdString\":[1025,\"order-id-string\"],\"fromString\":[1025,\"from-string\"],\"to_String\":[1025,\"to-string\"],\"toPlaceholderString\":[1025,\"to-placeholder-string\"],\"fromAtString\":[1025,\"from-at-string\"],\"toAtString\":[1025,\"to-at-string\"],\"productsString\":[1025,\"products-string\"],\"productsCodeString\":[1025,\"products-code-string\"],\"quantityString\":[1025,\"quantity-string\"],\"statusString\":[1025,\"status-string\"],\"stockString\":[1,\"stock-string\"],\"noStockString\":[1,\"no-stock-string\"],\"resetAllString\":[1,\"reset-all-string\"],\"confirmedString\":[1,\"confirmed-string\"],\"confirmAllString\":[1,\"confirm-all-string\"],\"availableString\":[1,\"available-string\"],\"unavailableString\":[1,\"unavailable-string\"],\"selectString\":[1,\"select-string\"],\"remainingString\":[1,\"remaining-string\"],\"orderMissingString\":[1,\"order-missing-string\"],\"products\":[32],\"requesters\":[32],\"suppliers\":[32],\"participantId\":[32],\"shipment\":[32],\"lines\":[32],\"order\":[32],\"currentGtin\":[32],\"currentQuantity\":[32],\"updateDirectory\":[64],\"refresh\":[64],\"reset\":[64]},[[0,\"ionChange\",\"onInputChange\"]]]]],[\"managed-batch-list-item\",[[0,\"managed-batch-list-item\",{\"gtinBatch\":[1,\"gtin-batch\"],\"batch\":[32],\"serialNumbers\":[32],\"refresh\":[64]}]]],[\"managed-product-list-item\",[[0,\"managed-product-list-item\",{\"gtin\":[1025],\"batchDisplayCount\":[1026,\"batch-display-count\"],\"product\":[32],\"batches\":[32],\"refresh\":[64]}]]],[\"managed-batch\",[[0,\"managed-batch\",{\"gtinRef\":[1537,\"gtin-ref\"],\"titleString\":[1,\"create-title-string\"],\"manageString\":[1,\"manage-title-string\"],\"backString\":[1,\"back-string\"],\"batchNumberString\":[1,\"batch-number-string\"],\"expiryString\":[1,\"expiry-string\"],\"expiryPlaceholderString\":[1,\"expiry-placeholder-string\"],\"serialsString\":[1,\"serials-string\"],\"serialsPlaceholderString\":[1,\"serials-placeholder-string\"],\"addBatchString\":[1,\"add-batch-string\"],\"clearString\":[1,\"clear-string\"],\"batch\":[32],\"serialsNumbers\":[32],\"refresh\":[64],\"reset\":[64]}]]],[\"managed-order-list-item\",[[0,\"managed-order-list-item\",{\"orderId\":[1,\"order-id\"],\"type\":[1],\"order\":[32],\"refresh\":[64]}]]],[\"managed-product\",[[0,\"managed-product\",{\"gtin\":[1537],\"manufName\":[1025,\"manuf-name\"],\"titleString\":[1,\"create-title-string\"],\"manageString\":[1,\"manage-title-string\"],\"backString\":[1,\"back-string\"],\"nameString\":[1,\"product-name-string\"],\"gtinString\":[1,\"gtin-string\"],\"manufString\":[1,\"manuf-string\"],\"descriptionString\":[1,\"description-string\"],\"descriptionPlaceholderString\":[1,\"description-placeholder-string\"],\"addProductString\":[1,\"add-product-string\"],\"clearString\":[1,\"clear-string\"],\"batchesTitle\":[1025,\"batches-title-string\"],\"batchesAddButton\":[1025,\"batches-add-button-string\"],\"product\":[32],\"refresh\":[64],\"reset\":[64]}]]],[\"managed-shipment-list-item\",[[0,\"managed-shipment-list-item\",{\"shipmentId\":[1025,\"shipment-id\"],\"shipmentLineCount\":[1026,\"shipment-line-count\"],\"type\":[1],\"shipment\":[32],\"refresh\":[64]}]]],[\"managed-stock-list-item\",[[0,\"managed-stock-list-item\",{\"gtin\":[1],\"stock\":[32],\"batches\":[32],\"quantity\":[32],\"refresh\":[64]}]]],[\"simple-managed-product-item\",[[0,\"simple-managed-product-item\",{\"gtin\":[1025],\"product\":[32],\"refresh\":[64]}]]],[\"form-validate-submit\",[[4,\"form-validate-submit\",{\"formJSON\":[1,\"form-json\"],\"loaderType\":[1,\"loader-type\"],\"lines\":[1],\"labelPosition\":[1,\"label-position\"],\"customValidation\":[4,\"enable-custom-validation\"],\"form\":[32]}]]],[\"barcode-generator\",[[0,\"barcode-generator\",{\"data\":[1032],\"type\":[1],\"barcodeTitle\":[1,\"barcode-title\"],\"size\":[8],\"scale\":[8],\"includeText\":[4,\"include-text\"],\"isLoaded\":[32]}]]],[\"managed-orderline-list-item\",[[0,\"managed-orderline-list-item\",{\"orderLine\":[1025,\"order-line\"],\"gtinLabel\":[1025,\"gtin-label\"],\"nameLabel\":[1025,\"name-label\"],\"requesterLabel\":[1025,\"requester-label\"],\"senderLabel\":[1025,\"sender-label\"],\"createdOnLabel\":[1025,\"created-on-label\"],\"statusLabel\":[1025,\"status-label\"],\"quantityLabel\":[1025,\"quantity-label\"],\"line\":[32],\"product\":[32],\"refresh\":[64]}]]],[\"managed-shipmentline-list-item\",[[0,\"managed-shipmentline-list-item\",{\"shipmentLine\":[1025,\"shipment-line\"],\"gtinLabel\":[1025,\"gtin-label\"],\"batchLabel\":[1025,\"bach-label\"],\"nameLabel\":[1025,\"name-label\"],\"requesterLabel\":[1025,\"requester-label\"],\"senderLabel\":[1025,\"sender-label\"],\"createdOnLabel\":[1025,\"created-on-label\"],\"statusLabel\":[1025,\"status-label\"],\"quantityLabel\":[1025,\"quantity-label\"],\"line\":[32],\"product\":[32],\"batch\":[32],\"refresh\":[64]}]]],[\"pdm-ssapp-loader\",[[0,\"pdm-ssapp-loader\",{\"timeout\":[2],\"loader\":[1],\"isLoading\":[32],\"progress\":[32],\"status\":[32],\"markAsLoaded\":[64],\"updateStatus\":[64]},[[16,\"ssapp-has-loaded\",\"markAsLoaded\"],[18,\"ssapp-update-status\",\"updateStatus\"]]]]],[\"menu-tab-button\",[[0,\"menu-tab-button\",{\"iconName\":[1025,\"icon-name\"],\"label\":[1025],\"badge\":[1026],\"tab\":[8],\"mode\":[1],\"selected\":[32]},[[2,\"ssapp-select\",\"select\"]]]]],[\"pdm-barcode-scanner\",[[0,\"pdm-barcode-scanner\",{\"data\":[1032],\"loaderType\":[1,\"loader-type\"],\"compatibilityMode\":[1,\"compatibility-mode\"],\"timeout\":[2],\"activeDeviceId\":[32],\"status\":[32],\"isCameraAvailable\":[32],\"hasPermissions\":[32],\"switchCamera\":[64]}]]],[\"slide-in-board\",[[1,\"slide-in-board\"]]],[\"status-badge\",[[1,\"status-badge\"]]],[\"pdm-ion-table\",[[4,\"pdm-ion-table\",{\"tableTitle\":[1,\"table-title\"],\"iconName\":[1,\"icon-name\"],\"noContentMessage\":[1025,\"no-content-message\"],\"loadingMessage\":[1025,\"loading-message\"],\"searchBarPlaceholder\":[1025,\"query-placeholder\"],\"canQuery\":[4,\"can-query\"],\"manager\":[1],\"itemType\":[1,\"item-type\"],\"itemProps\":[1032,\"item-props\"],\"itemReference\":[1,\"item-reference\"],\"autoLoad\":[4,\"auto-load\"],\"query\":[1025],\"paginated\":[1028],\"pageCount\":[1026,\"page-count\"],\"itemsPerPage\":[1026,\"items-per-page\"],\"currentPage\":[1026,\"current-page\"],\"sort\":[1025],\"model\":[32],\"refresh\":[64]}]]],[\"form-input\",[[0,\"form-input\",{\"input\":[1032],\"inputPrefix\":[1,\"input-prefix\"],\"lines\":[1],\"labelPosition\":[1,\"label-position\"],\"cssClassString\":[1,\"class-string\"],\"customValidation\":[4,\"enable-custom-validation\"],\"hasErrors\":[32]}]]],[\"status-updater\",[[0,\"status-updater\",{\"currentState\":[1537,\"current-state\"],\"statesJSON\":[1,\"state-json\"],\"states\":[32]}]]],[\"managed-orderline-stock-chip\",[[0,\"managed-orderline-stock-chip\",{\"gtin\":[1025],\"quantity\":[1026],\"available\":[1026],\"mode\":[1],\"loaderType\":[1,\"loader-type\"],\"threshold\":[1026],\"button\":[1025],\"stock\":[32],\"expiry\":[32]}]]],[\"more-chip\",[[0,\"more-chip\",{\"iconName\":[1,\"icon-name\"],\"color\":[1],\"float\":[4,\"float-more-button\"]}]]],[\"line-stock-manager\",[[0,\"line-stock-manager\",{\"lines\":[1040],\"showStock\":[1540,\"show-stock\"],\"enableActions\":[1540,\"enable-actions\"],\"linesString\":[1,\"lines-string\"],\"stockString\":[1,\"stock-string\"],\"noStockString\":[1,\"no-stock-string\"],\"selectString\":[1,\"select-string\"],\"remainingString\":[1,\"remaining-string\"],\"orderMissingString\":[1,\"order-missing-string\"],\"availableString\":[1,\"available-string\"],\"unavailableString\":[1,\"unavailable-string\"],\"confirmedString\":[1,\"confirmed-string\"],\"confirmAllString\":[1,\"confirm-all-string\"],\"resetAllString\":[1,\"reset-all-string\"],\"stockForProduct\":[32],\"selectedProduct\":[32],\"result\":[32],\"shipmentLines\":[32],\"reset\":[64],\"getResult\":[64],\"refresh\":[64],\"cancelLine\":[64]},[[0,\"ionItemReorder\",\"updateOrder\"],[0,\"ssapp-action\",\"receiveAction\"]]]]],[\"pdm-barcode-scanner-controller\",[[0,\"pdm-barcode-scanner-controller\",{\"barcodeTitle\":[1,\"barcode-title\"],\"scannerMode\":[1,\"scanner-mode\"],\"changeCamera\":[64],\"present\":[64],\"holdForScan\":[64],\"dismiss\":[64]},[[0,\"ssapp-action\",\"processResult\"]]]]],[\"batch-chip\",[[0,\"batch-chip\",{\"gtinBatch\":[1025,\"gtin-batch\"],\"quantity\":[1026],\"mode\":[1],\"loaderType\":[1,\"loader-type\"],\"expiryThreshold\":[1026,\"expiry-threshold\"],\"batch\":[32]}]]],[\"create-manage-view-layout\",[[4,\"create-manage-view-layout\",{\"isCreate\":[1540,\"is-create\"],\"breakpoint\":[1,\"break-point\"],\"createTitleString\":[1,\"create-title-string\"],\"manageTitleString\":[1,\"manage-title-string\"],\"backString\":[1,\"back-string\"],\"createString\":[1,\"create-string\"],\"clearString\":[1,\"clear-string\"],\"iconName\":[1,\"icon-name\"],\"getInput\":[64],\"clear\":[64]}]]],[\"generic-chip\",[[4,\"generic-chip\",{\"chipLabel\":[1025,\"chip-label\"],\"outline\":[4],\"color\":[1]}]]],[\"list-item-layout\",[[4,\"list-item-layout\",{\"cssClass\":[1,\"class\"],\"orientation\":[1537],\"lines\":[1],\"color\":[1],\"currentBreakpoint\":[32]},[[9,\"resize\",\"updateOrientation\"]]]]],[\"pdm-item-organizer\",[[0,\"pdm-item-organizer\",{\"displayCount\":[1026,\"display-count\"],\"componentName\":[1025,\"component-name\"],\"componentProps\":[1025,\"component-props\"],\"idProp\":[1,\"id-prop\"],\"orientation\":[1025],\"singleLine\":[1028,\"single-line\"],\"isItem\":[4,\"is-ion-item\"],\"parsedProps\":[32]},[[0,\"ssapp-show-more\",\"showMore\"]]]]],[\"multi-spinner\",[[0,\"multi-spinner\",{\"type\":[1025]}]]]]"), options);
});
