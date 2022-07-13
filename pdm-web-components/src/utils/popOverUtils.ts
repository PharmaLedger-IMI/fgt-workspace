/**
 * @namespace PopOver
 * @memberOf Utils
 */

import wizard from '../services/WizardService';
const {getDirectorySuppliers, getDirectoryRequesters, getDirectoryProducts, getGtinsInStock} = wizard.Model.utils;

/**
 *
 * @memberOf PopOver
 */
const BAR_CODE_POPOVER_ELEMENT = 'bar-code-pop-over';

/**
 * @function defineBarcodePopOverContent
 * @constructor
 * @memberOf PopOver
 * @private
 */
function defineBarcodePopoverContent(){
  if (!!customElements.get(BAR_CODE_POPOVER_ELEMENT))
    return;

  customElements.define(BAR_CODE_POPOVER_ELEMENT, class extends HTMLElement{
    connectedCallback(){
      const popOverElement: any = document.querySelector('ion-popover');
      if (!popOverElement || !popOverElement.componentProps)
        return console.log(`No Properties passed to the Bar Code Pop over`);
      const {type, size, scale, data} = popOverElement.componentProps;
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
 * @memberOf PopOver
 */
export async function getBarCodePopOver(props, evt){
  defineBarcodePopoverContent();
  props = Object.assign({
    type: "code128",
    size: "32",
    scale: "6",
    data: ""
  }, props)
  const popover: any = Object.assign(document.createElement('ion-popover'), {
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

/**
 *
 * @memberOf PopOver
 */
const SINGLE_INPUT_POPOVER_ELEMENT = "single-input-popover";

/**
 * @constructor
 * @memberOf PopOver
 * @private
 */
function defineSingleInputPopOverContent(){
  if (!!customElements.get(SINGLE_INPUT_POPOVER_ELEMENT))
    return;

  customElements.define(SINGLE_INPUT_POPOVER_ELEMENT, class extends HTMLElement {
    connectedCallback() {
      const contentEl = this;
      const popOverElement: any = contentEl.closest('ion-popover');
      if (!popOverElement || !popOverElement.componentProps)
        return console.log(`No Properties passed to Single Input pop over`);
      const {message, placeholder} = popOverElement.componentProps;

      const getMessage= function(){
        if (message)
          return `<ion-label>${message}</ion-label>`;
        return '';
      }

      this.innerHTML = `
<ion-content>
    <ion-item lines="none">
        ${getMessage()}
        <ion-input type="text" placeholder="${placeholder}"></ion-input>
        <ion-button slot="end" color="primary" fill="clear" class="ion-padding-horizontal">
            <ion-icon slot="icon-only" name="add-circle"></ion-icon>
        </ion-button>
    </ion-item>
</ion-content>`;

      const input: HTMLFormElement = this.querySelector('ion-input');
      this.querySelector('ion-button').addEventListener('click', () => {
        popOverElement.dismiss(undefined, input.value);
      });
    }
  });
}
/**
 * Shows a popover with the barcode/2dMatrix etc with the provided props
 * @param {event} [evt] the click event so the popover show in the correct place. if ommited will show in the center
 * @param {string} message
 * @param {string} placeholder
 * @return {Promise<HTMLIonPopoverElement>}
 * @memberOf PopOver
 */
export async function getSingleInputPopOver(evt, message: string, placeholder?: string): Promise<any>{

  if (!placeholder){
    placeholder = message;
    message = ''
  }

  defineSingleInputPopOverContent();
  const popover: any = Object.assign(document.createElement('ion-popover'), {
    component: SINGLE_INPUT_POPOVER_ELEMENT,
    cssClass: 'single-input-popover',
    translucent: true,
    event: evt,
    showBackdrop: false,
    animated: true,
    componentProps: {
      message: message,
      placeholder: placeholder
    },
    backdropDismiss: true,
  });
  document.body.appendChild(popover);
  await popover.present();
  return popover;
}

/**
 *
 * @memberOf PopOver
 */
const PRODUCT_POPOVER_ELEMENT = "product-pop-over";

/**
 * @constructor
 * @memberOf PopOver
 * @private
 */
function defineProductPopOverContent(){
  if (!!customElements.get(PRODUCT_POPOVER_ELEMENT))
    return;

  customElements.define(PRODUCT_POPOVER_ELEMENT, class extends HTMLElement{
    connectedCallback(){
      const contentEl = this;
      const popOverElement: any = contentEl.closest('ion-popover');
      if (!popOverElement || !popOverElement.componentProps)
        return console.log(`No Properties passed to the Bar Code Pop over`);
      const products = popOverElement.componentProps;

      const getDirectoryContent = function() {
        const getProductElement = function (gtin) {
          return `<simple-managed-product-item gtin=${gtin}></simple-managed-product-item>`
        }
        return products.map(gtin => getProductElement(gtin)).join(`\n`);
      }
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
 * @memberOf PopOver
 */
export async function getProductPopOver(evt, products: string[]): Promise<any>{
  defineProductPopOverContent();
  const popover: any = Object.assign(document.createElement('ion-popover'), {
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

const TRACKING_VIEW_MODAL = 'tracking-view-modal';

function defineTrackingViewModal(){

  if (!!customElements.get(TRACKING_VIEW_MODAL))
    return;

  customElements.define(TRACKING_VIEW_MODAL, class extends HTMLElement{
    connectedCallback() {
      const contentEl = this;
      const modalElement: any = contentEl.closest('ion-modal');
      modalElement.style.setProperty('--max-height', '90%');
      modalElement.style.setProperty('--max-width', '90%');
      const title = modalElement.componentProps && modalElement.componentProps.title ? modalElement.componentProps.title : "Tracking";
      this.innerHTML = `
<ion-header>
  <ion-toolbar>
    <ion-icon slot="start" class="ion-padding-horizontal" name="share-social"></ion-icon>
    <ion-title>${title}</ion-title>
    <ion-buttons slot="end">
      <ion-button id="dismiss-modal">
        <ion-icon slot="icon-only" name="close-outline"></ion-icon>
      </ion-button>
    </ion-buttons>
  </ion-toolbar>
</ion-header>
<ion-content class="ion-padding">
  <tree-view></tree-view>
</ion-content>`;

      const dismissButton = this.querySelector('#dismiss-modal');
      dismissButton.addEventListener('click', () => {
        modalElement.dismiss();
      });

      const treeView = this.querySelector('tree-view');
      treeView.objectTree = modalElement.componentProps.tree;
    }
  });
}

export function nodeToTree(startNode: any, endNode: any, nodeList: {}){

  const fromNode = function(node){
    return {
      id: node.id,
      title: node.title,
      subtitle: endNode.subtitle || "This is a subtitle",
      description: endNode.description || "This is a description"
    }
  }

  const mapReduce = (nodes: Array<Node>, tree = []): any => {
    nodes.map((node) => {
      const {id, children} = node;

      const mapReduceNodesTree: Array<NodeTree> = [];
      const mapReduceResult = children.map((idx): NodeTree => {
        const childNodeFromList = nodeList[idx]
        return {
          id: childNodeFromList.id,
          title: childNodeFromList.title,
          parentId: id
        }
      }).reduce((accum: Array<Node>, curr: NodeTree) => {
        if (curr.id !== startNode.id) {
          const nodeFromList = nodeList[curr.id]
          mapReduceNodesTree.push(curr)
          accum.push(nodeFromList)
        }
        return accum
      }, [])

      if (mapReduceResult.length > 0) {
        tree.push(mapReduceNodesTree)
        mapReduce(mapReduceResult, tree)
      }
    })
    return tree;
  }

  const parentNode = [nodeList[endNode.id]]
  return {
    header: fromNode(endNode),
    footer: fromNode(startNode),
    body: mapReduce(parentNode)
  }
}

export async function getTrackingModal(props: {title: string, startNode: any, endNode: any, nodeList: {}}){
  defineTrackingViewModal();
  const trackModal: any = document.createElement('ion-modal');
  trackModal.id = `tracking-modal`;
  trackModal.component = TRACKING_VIEW_MODAL;
  trackModal.cssClass = 'traceability-viewer';
  trackModal.animated = true;
  trackModal.showBackdrop = true;
  trackModal.backdropDismiss = true;
  trackModal.swipeToClose = true;
  trackModal.componentProps = {
    title: props.title,
    tree: nodeToTree(props.startNode, props.endNode, props.nodeList)
  };
  document.body.appendChild(trackModal);
  await trackModal.present();
  return trackModal;
}

interface NodeTree {
  id: number;
  title: string;
  parentId: number;
}

interface Node {
  id: number;
  title: string;
  children: Array<number>;
  parents: Array<number>;
}
/*
interface ParentNode {
  id: number;
  title: string;
  children: Array<Node>
}
 */

export {getDirectoryProducts, getDirectorySuppliers, getDirectoryRequesters, getGtinsInStock};
