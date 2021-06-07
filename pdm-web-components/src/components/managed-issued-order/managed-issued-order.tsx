import {Component, Element, Event, EventEmitter, h, Host, Listen, Method, Prop, State} from '@stencil/core';

import {WebManager, WebManagerService} from "../../services/WebManagerService";
import {SUPPORTED_LOADERS} from "../multi-spinner/supported-loader";
import {HostElement} from "../../decorators";

// const ItemClasses = {
//   selected: "selected",
//   unnecessary: 'unnecessary',
//   normal: 'normal',
//   finished: 'finished'
// }
// @ts-ignore
const {Order, OrderLine, Product, OrderStatus, ROLE} = require('wizard').Model;

const MANAGED_ISSUED_ORDER_CUSTOM_EL_NAME = "managed-issued-order-popover";

@Component({
  tag: 'managed-issued-order',
  styleUrl: 'managed-issued-order.css',
  shadow: false,
})
export class ManagedIssuedOrder {

  @HostElement() host: HTMLElement;

  @Element() element;

  /**
   * Through this event errors are passed
   */
  @Event({
    eventName: 'ssapp-send-error',
    bubbles: true,
    composed: true,
    cancelable: true,
  })
  sendErrorEvent: EventEmitter;

  /**
   * Through this event navigation requests to tabs are made
   */
  @Event({
    eventName: 'ssapp-action',
    bubbles: true,
    composed: true,
    cancelable: true,
  })
  sendActionEvent: EventEmitter;

  private sendError(message: string, err?: object){
    const event = this.sendErrorEvent.emit(message);
    if (!event.defaultPrevented || err)
      console.log(`Product Component: ${message}`, err);
  }

  private sendAction(message){
    const event = this.sendActionEvent.emit(message);
    if (!event.defaultPrevented)
      console.log(`Issue Order: ${message}`);
  }

  /**
   * Through this event order creation requests are made
   */
  @Event({
    eventName: 'created',
    bubbles: true,
    composed: true,
    cancelable: true,
  })
  sendCreateEvent: EventEmitter;

  @Prop({attribute: 'order-lines', mutable: true}) orderLines;

  @Prop({attribute: 'requester', mutable: true}) requester;

  @Prop({attribute: 'title-string', mutable: true}) titleString: string = 'Create Order';

  @Prop({attribute: 'proceed-string', mutable: true}) proceedString: string = 'Issue Order';

  @Prop({attribute: 'details-string', mutable: true}) detailsString: string = 'Details:';

  @Prop({attribute: 'from-string', mutable: true}) fromString: string = 'Order from:';

  @Prop({attribute: 'from-placeholder-string', mutable: true}) fromPlaceholderString: string = 'Select a supplier...';

  @Prop({attribute: 'from-at-string', mutable: true}) fromAtString: string = 'At:';

  @Prop({attribute: 'to-at-string', mutable: true}) toAtString: string = 'from:';

  @Prop({attribute: 'products-string', mutable: true}) productsString: string = 'Products:';

  @Prop({attribute: 'products-code-string', mutable: true}) productsCodeString: string = 'Product Code:';

  @Prop({attribute: 'quantity-string', mutable: true}) quantityString: string = 'Quantity:';

  @Prop({attribute: 'order-lines-string', mutable: true}) orderLinesString: string = 'OrderLines:';

  @Prop({attribute: 'directory-string', mutable: true}) directoryString: string = 'Directory:';

  private directoryManager: WebManager = undefined;

  private order: typeof Order = undefined;

  @State() senderId?: string = undefined;

  @State() senderAddress?: string = undefined;

  @State() suppliers?: string[] = undefined;

  @State() products?: string[] = undefined;

  @State() currentGtin?: string = undefined;

  @State() currentQuantity: number = 0;

  async componentWillLoad() {
    if (!this.host.isConnected)
      return;

    this.directoryManager = await WebManagerService.getWebManager('DirectoryManager');
  }

  @Method()
  async updateDirectory(){
    this.getDirectoryProductsAsync();
    this.getSuppliersAsync();
  }

  async cancelOrderLine(data){
    if (data.gtin){
      const {gtin} = data;

      if (!this.orderLines)
        return;
      let index;
      this.orderLines.every((ol, i) => {
        if (ol.gtin !== gtin)
          return true;
        index = i;
        return false;
      });
      if (!index)
        return;
      this.orderLines.splice(index,1);
      this.orderLines = [... this.orderLines];
    }
  }

  private getDirectoryProductsAsync(){
    const self = this;
    const options = {
      query: [`role == ${ROLE.PRODUCT}`]
    }
    this.directoryManager.getAll(false, options, (err, gtins) => {
      if (err)
        return self.sendError(`Could not get directory listing for ${ROLE.PRODUCT}`, err);
      self.products = gtins;
    });
  }

  private getSuppliersAsync(callback?){

    const self = this;
    if (!self.directoryManager)
      return [];

    const options = {
      query: [`role like /${ROLE.MAH}|${ROLE.WHS}/g`]
    }

    self.directoryManager.getAll(false, options, (err, records) => {
      if (err){
        self.sendError(`Could not list Suppliers from directory`, err);
        return callback(err);
      }

      self.suppliers = records;
      if (callback)
        callback(undefined, records);
    });
  }

  private definePopOverContent(){
    const self = this;

    if (!!customElements.get(MANAGED_ISSUED_ORDER_CUSTOM_EL_NAME))
      return;

    customElements.define(MANAGED_ISSUED_ORDER_CUSTOM_EL_NAME, class extends HTMLElement{
      connectedCallback(){
        const contentEl = this;
        const getDirectoryContent = function() {
          if (!self.products)
            return `<multi-spinner type="${SUPPORTED_LOADERS.circles}"></multi-spinner>`;
          const getProductElement = function (gtin) {
            return `<simple-managed-product-item gtin=${gtin}></simple-managed-product-item>`
          }
          return self.products.map(gtin => getProductElement(gtin)).join(`\n`);
        }
        this.innerHTML = `
<ion-content>
  <ion-list>
    ${getDirectoryContent()}
  </ion-list>
</ion-content>`;

        this.querySelectorAll('simple-managed-product-item').forEach(item => {
          item.addEventListener('click', () => {
            contentEl.closest('ion-popover').dismiss(undefined, item.getAttribute('gtin'));
          });
        });
      }
    });
  }

  private async getProductPopOver(evt){
    this.definePopOverContent();
    const popover = Object.assign(document.createElement('ion-popover'), {
      component: MANAGED_ISSUED_ORDER_CUSTOM_EL_NAME,
      cssClass: 'menu-tab-button-popover',
      translucent: true,
      event: evt,
      showBackdrop: false,
      animated: true,
      backdropDismiss: true,
    });
    document.body.appendChild(popover);
    await popover.present();

    const {role} = await popover.onWillDismiss();
    if (role && role !== 'backdrop')
      this.currentGtin = role;
  }

  private getOrderLines(){
    const self = this;
    if (!self.orderLines || !self.orderLines.length || typeof self.orderLines === 'string')
      return [];

    const genOrderLine = function(o){
      return (<managed-orderline-stock-chip onSendAction={(evt) => self.cancelOrderLine(evt)} gtin={o.gtin} quantity={o.quantity} available={10 * o.quantity} mode="detail" button="cancel"></managed-orderline-stock-chip>)
    }

    return self.orderLines.map(o => genOrderLine(o));
  }

  private getActionButtons(){
    const self = this;
    const getButton = function(color, text, enabled = true, margin = true, visible = true){
      return (
        <ion-button class={`${!visible ? 'ion-hide' : ''} ${!!margin ? 'ion-margin-horizontal' : ''}`}
                    color={color} size="small"
                    fill="outline"
                    disabled={!enabled}
                    onClick={() => self.sendAction(self.order)}>
          <ion-label>{text}</ion-label>
        </ion-button>
      )
    }
    return (
      <ion-buttons class="ion-float-end ion-justify-content-end">
        {getButton("success", self.proceedString, !!this.orderLines && !!this.orderLines.length && !!this.senderId)}
      </ion-buttons>
    )
  }

  private getHeader(){
    return (
      <ion-card-header class="ion-padding">
        <ion-card-title>
          {this.titleString}
          {this.getActionButtons()}
        </ion-card-title>
      </ion-card-header>
    )
  }

  private getLoading(type: string = SUPPORTED_LOADERS.simple){
    return (<multi-loader type={type}></multi-loader>);
  }

  private getMap(){
    return (
      <ion-thumbnail>
        <ion-icon name="map-outline"></ion-icon>
      </ion-thumbnail>
    )
  }

  private getRequesterLocale(){
    const self = this;
    const getAddress = function(){
      if (!self.requester)
        return (<ion-skeleton-text animated></ion-skeleton-text>)
      return (<ion-input disabled={true} value={self.requester.address}></ion-input>);
    }
    return (
      <ion-item lines="none" class="ion-no-padding">
        <ion-label position="stacked">{self.fromAtString}</ion-label>
        {getAddress()}
      </ion-item>
    )
  }

  private getSenderLocale(){
    const self = this;
    const getAddress = function(){
      return (<ion-input disabled={true} value={self.senderAddress ? self.senderAddress : '-'}></ion-input>);
    }
    return (
      <ion-item class="ion-no-padding">
        <ion-label position="stacked">{self.toAtString}</ion-label>
        {getAddress()}
      </ion-item>
    )
  }

  private getSender(){
    const self = this;

    const options = {
      cssClass: 'product-select'
    };

    const getFrom = function(){
      const result = [];
      if (self.suppliers){
        result.push(
          <ion-select interface="popover" interfaceOptions={options} class="supplier-select" placeholder={self.fromPlaceholderString}>
            {...self.suppliers.map(s => (<ion-select-option value={s}>{s}</ion-select-option>))}
          </ion-select>
        )
      } else {
        result.push(self.getLoading(SUPPORTED_LOADERS.bubblingSmall));
      }

      return result;
    }

    return (
      <ion-item lines="none" class="ion-no-padding" disabled={false}>
        <ion-label position="stacked">{this.fromString}</ion-label>
        {...getFrom()}
      </ion-item>
    )
  }

  private getDetails(){
    return (
        <ion-grid class="ion-no-padding">
          <ion-row>
            <ion-col size="4">
              {this.getSender()}
            </ion-col>
            <ion-col size="2">
              {this.getRequesterLocale()}
            </ion-col>
            <ion-col size="3">
              {this.getSenderLocale()}
            </ion-col>
            <ion-col size="2">
              {this.getMap()}
            </ion-col>
          </ion-row>
        </ion-grid>
    )
  }

  private scan(){
    const self = this;
    const controller = self.element.querySelector('pdm-barcode-scanner-controller');
    if (!controller)
      return console.log(`Could not find scan controller`);
    controller.present((err, scanData) => {
      if (err)
        return self.sendError(`Could not scan`, err);
      console.log(scanData);
      self.currentGtin = scanData ? scanData.gtin || scanData.productCode || scanData.result: undefined;
    });
  }

  @Listen('ionChange')
  onProductInputChange(evt){
    evt.preventDefault();
    evt.stopImmediatePropagation();
    const {target} = evt;
    const {name, value} = target;
    console.log(evt, target, name, value);
    if (name === 'input-quantity')
      this.currentQuantity = value;
  }

  private addOrderLine(gtin, quantity){
    const updated = [];
    if (Array.isArray(this.orderLines))
      updated.push(...this.orderLines);
    const existing = updated.filter(u => u.gtin === gtin);
    if (existing.length){
      existing[0].quantity += quantity;
      this.orderLines = [...updated];
    } else {
      const ol = new OrderLine(gtin, quantity, undefined, this.senderId);
      this.orderLines = [...updated, ol];
    }

    this.currentGtin = undefined;
    this.currentQuantity = 0;
  }

  private getProductInput(){
    return (
      <ion-grid>
        <ion-row class="ion-align-items-end">
          <ion-col size="6">
            <ion-item class="ion-no-padding" >
              <ion-label position="stacked">{this.productsCodeString}</ion-label>
              <ion-input name="input-gtin" type="number" value={this.currentGtin}></ion-input>
              <ion-buttons slot="end">
                <ion-button onClick={() => this.scan()}>
                  <ion-icon color="tertiary" slot="icon-only" name="scan-circle"></ion-icon>
                </ion-button>
                <ion-button onClick={(evt) => this.getProductPopOver(evt)}>
                  <ion-icon color="secondary" slot="icon-only" name="add-circle"></ion-icon>
                </ion-button>
              </ion-buttons>
            </ion-item>
          </ion-col>
          <ion-col size="1">
            <ion-item>
              <ion-label position="stacked">{this.quantityString}</ion-label>
              <ion-input name="input-quantity" type="number" value={this.currentQuantity || 0}></ion-input>
            </ion-item>
          </ion-col>
          <ion-col size="4">
            <ion-item>
              <ion-range name="input-quantity" style={{width: '70%'}} min={0} max={Math.max(this.currentQuantity || 0, 100)} pin={false} value={this.currentQuantity || 0} color="secondary">
                <ion-button class="ion-padding-horizontal" slot="start" size="small" fill="clear" onClick={() => this.currentQuantity --}>
                  <ion-icon color="secondary" slot="icon-only" size="small" name="remove-circle"></ion-icon>
                </ion-button>
                <ion-button class="ion-padding-horizontal" slot="end" size="small" fill="clear" onClick={() => this.currentQuantity ++}>
                  <ion-icon color="secondary" slot="icon-only" size="small" name="add-circle"></ion-icon>
                </ion-button>
              </ion-range>
            </ion-item>
          </ion-col>
          <ion-col size="1">
            <ion-buttons>
              <ion-button color="success" disabled={!this.currentGtin || !this.currentQuantity} onClick={() => this.addOrderLine(this.currentGtin, this.currentQuantity)}>
                <ion-icon slot="icon-only" name="add-circle"></ion-icon>
              </ion-button>
            </ion-buttons>
          </ion-col>
        </ion-row>
      </ion-grid>
    )
  }

  render() {
    return (
      <Host>
        <ion-card class="ion-margin">
          {this.getHeader()}
          <ion-card-content>
            <ion-item-divider>
              <ion-label>{this.detailsString}</ion-label>
            </ion-item-divider>
            {this.getDetails()}
            <ion-item-divider>
              <ion-label>{this.productsString}</ion-label>
            </ion-item-divider>
            {this.getProductInput()}
            <ion-item-divider>
              <ion-label>{this.orderLinesString}</ion-label>
            </ion-item-divider>
            {...this.getOrderLines()}
          </ion-card-content>
        </ion-card>
        <pdm-barcode-scanner-controller barcode-title="@scan"></pdm-barcode-scanner-controller>
      </Host>
    );
  }
}
