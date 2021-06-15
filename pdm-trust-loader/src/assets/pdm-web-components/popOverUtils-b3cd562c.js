import { w as wizard } from './WizardService-ed66842b.js';

const { ROLE } = wizard.Model;
const BAR_CODE_POPOVER_ELEMENT = 'bar-code-pop-over';
/**
 * @module Utils
 * @memberOf pdm-web-components
 */
function defineBarcodePopoverContent() {
  if (!!customElements.get(BAR_CODE_POPOVER_ELEMENT))
    return;
  customElements.define(BAR_CODE_POPOVER_ELEMENT, class extends HTMLElement {
    connectedCallback() {
      const popOverElement = document.querySelector('ion-popover');
      if (!popOverElement || !popOverElement.componentProps)
        return console.log(`No Properties passed to the Bar Code Pop over`);
      const { type, size, scale, data } = popOverElement.componentProps;
      this.innerHTML = `
<ion-content>
  <barcode-generator type="${type}" size="${size || 32}" scale="${scale || 3}" data="${data}"></barcode-generator>
</ion-content>`;
    }
  });
}
/**
 * Shows a popover with the barcode/2dMatrix etc with the provided props
 * @param {event} [evt] the click event so the popover show in the correct place. if ommited will show in the center
 * @param {{type: string, size: string: scale: string: data: any}} props the properties to pass to the {@link BarcodeGenerator}
 * @return {Promise<HTMLIonPopoverElement>}
 */
async function getBarCodePopOver(props, evt) {
  defineBarcodePopoverContent();
  props = Object.assign({
    type: "code128",
    size: "32",
    scale: "6",
    data: ""
  }, props);
  const popover = Object.assign(document.createElement('ion-popover'), {
    component: BAR_CODE_POPOVER_ELEMENT,
    cssClass: 'bar-code-popover',
    translucent: true,
    event: evt,
    showBackdrop: false,
    animated: true,
    backdropDismiss: true,
    componentProps: props
  });
  document.body.appendChild(popover);
  await popover.present();
  return popover;
}
const PRODUCT_POPOVER_ELEMENT = "product-pop-over";
function defineProductPopOverContent() {
  if (!!customElements.get(PRODUCT_POPOVER_ELEMENT))
    return;
  customElements.define(PRODUCT_POPOVER_ELEMENT, class extends HTMLElement {
    connectedCallback() {
      const contentEl = this;
      const popOverElement = contentEl.closest('ion-popover');
      if (!popOverElement || !popOverElement.componentProps)
        return console.log(`No Properties passed to the Bar Code Pop over`);
      const products = popOverElement.componentProps;
      const getDirectoryContent = function () {
        const getProductElement = function (gtin) {
          return `<simple-managed-product-item gtin=${gtin}></simple-managed-product-item>`;
        };
        return products.map(gtin => getProductElement(gtin)).join(`\n`);
      };
      this.innerHTML = `
<ion-content>
  <ion-list>
    ${getDirectoryContent()}
  </ion-list>
</ion-content>`;
      this.querySelectorAll('simple-managed-product-item').forEach(item => {
        item.addEventListener('click', () => {
          popOverElement.dismiss(undefined, item.getAttribute('gtin'));
        });
      });
    }
  });
}
/**
 * Shows a popover with the barcode/2dMatrix etc with the provided props
 * @param {event} [evt] the click event so the popover show in the correct place. if ommited will show in the center
 * @param {string[]} products the properties to pass to the {@link BarcodeGenerator}
 * @return {Promise<HTMLIonPopoverElement>}
 */
async function getProductPopOver(evt, products) {
  defineProductPopOverContent();
  const popover = Object.assign(document.createElement('ion-popover'), {
    component: PRODUCT_POPOVER_ELEMENT,
    cssClass: 'product-popover',
    translucent: true,
    event: evt,
    showBackdrop: false,
    animated: true,
    componentProps: products,
    backdropDismiss: true,
  });
  document.body.appendChild(popover);
  await popover.present();
  return popover;
}
/**
 * Retrieves all the products from the provided directory manager
 * @param {DirectoryManager} directoryManager
 * @param {function(err, string[])} callback
 */
function getDirectoryProducts(directoryManager, callback) {
  const options = {
    query: [`role == ${ROLE.PRODUCT}`]
  };
  directoryManager.getAll(false, options, (err, gtins) => err
    ? callback(err)
    : callback(undefined, gtins));
}
/**
 * Retrieves all the suppliers from the provided directory manager
 * @param {DirectoryManager} directoryManager
 * @param {function(err, string[])} callback
 */
function getDirectorySuppliers(directoryManager, callback) {
  const options = {
    query: [`role like /${ROLE.MAH}|${ROLE.WHS}/g`]
  };
  directoryManager.getAll(false, options, (err, suppliers) => err
    ? callback(err)
    : callback(undefined, suppliers));
}
/**
 * Retrieves all the requesters from the provided directory manager
 * @param {DirectoryManager} directoryManager
 * @param {function(err, string[])} callback
 */
function getDirectoryRequesters(directoryManager, callback) {
  const options = {
    query: [`role like /${ROLE.PHA}|${ROLE.WHS}/g`]
  };
  directoryManager.getAll(false, options, (err, requesters) => err
    ? callback(err)
    : callback(undefined, requesters));
}

export { getDirectoryProducts as a, getDirectorySuppliers as b, getProductPopOver as c, getDirectoryRequesters as d, getBarCodePopOver as g };
