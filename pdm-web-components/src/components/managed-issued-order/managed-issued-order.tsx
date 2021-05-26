import {Component, Element, Event, EventEmitter, h, Method, Prop, State} from '@stencil/core';

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

  @Prop({attribute: 'products-string', mutable: true}) productsString: string = 'Products:';

  @Prop({attribute: 'directory-string', mutable: true}) directoryString: string = 'Directory:';

  private directoryManager: WebManager = undefined;

  private order: typeof Order = undefined;

  @State() senderId?: string = undefined;

  @State() suppliers?: string[] = undefined;

  @State() products?: string[] = undefined;

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
      query: [`role like /${ROLE.FAC}|${ROLE.WHS}/g`]
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

  private getDirectoryProducts(){
    const self = this;
    if (!self.products)
      return [this.getLoading(SUPPORTED_LOADERS.circles)];

    const getProductElement = function(gtin){
      return (<simple-managed-product-item gtin={gtin}></simple-managed-product-item>)
    }
    return self.products.map(gtin => getProductElement(gtin));
  }

  private getOrderLines(){
    const self = this;
    if (!self.orderLines || (typeof self.orderLines === 'string'))
      return [];

    const genOrderLine = function(o){
      return (<managed-orderline-stock-chip gtin={o.gtin} quantity={o.quantity} available={10 * o.quantity} mode="detail" button="cancel"></managed-orderline-stock-chip>)
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
        {getButton("success", self.proceedString, this.order && !this.order.validate())}
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
        <ion-icon slot="end" name="map-outline"></ion-icon>
      </ion-thumbnail>
    )
  }

  private getLocalizationInfo(){
    const self = this;
    const getAddress = function(){
      if (!self.requester)
        return (<ion-skeleton-text animated></ion-skeleton-text>)
      return (<ion-label>{self.requester.address}</ion-label>);
    }
    return (
      <ion-item class="ion-no-padding">
        <ion-item class="ion-no-padding">
          {getAddress()}
        </ion-item>
        {this.getMap()}
      </ion-item>
    )
  }

  private getSender(){
    const self = this;
    const getFrom = function(){
      const result = [];
      if (!!self.senderId)
        result.push(<ion-label>{self.senderId}</ion-label>,
          <ion-button slot="end" onClick={() => self.senderId = undefined}>
            <ion-icon slot="icon-only" color="danger" name="close-circle-outline"></ion-icon>
          </ion-button>)
      else if (self.suppliers){
        result.push(
          <ion-select placeholder={self.fromPlaceholderString}>
            {...self.suppliers.map(s => (<ion-select-option value={s}>{s}</ion-select-option>))}
          </ion-select>
        )
      } else {
        result.push(self.getLoading(SUPPORTED_LOADERS.bubblingSmall));
      }

      return result;
    }

    return (
      <ion-item class="ion-no-padding">
        <ion-label position="stacked">{this.fromString}</ion-label>
        {...getFrom()}
      </ion-item>
    )
  }

  private getDetails(){
    return [this.getSender(), this.getLocalizationInfo()];
  }

  render() {
    return (
      <ion-card class="ion-margin">
        {this.getHeader()}
        <ion-card-content>
          <ion-item-divider>
            <ion-label>{this.detailsString}</ion-label>
          </ion-item-divider>
          {...this.getDetails()}
          <ion-grid>
            <ion-row>
              <ion-col size="6">
                <ion-item-group>
                  <ion-item-divider>
                    <ion-label>{this.productsString}</ion-label>
                  </ion-item-divider>
                  {...this.getOrderLines()}
                </ion-item-group>
              </ion-col>
              <ion-col size="6">
                <ion-list>
                  <ion-list-header>
                    <ion-label>{this.directoryString}</ion-label>
                  </ion-list-header>
                  {...this.getDirectoryProducts()}
                </ion-list>
              </ion-col>
            </ion-row>
          </ion-grid>
        </ion-card-content>
      </ion-card>
    );
  }
}
