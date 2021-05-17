import {Component, h, Element, Prop, State, Watch, Method, Event, EventEmitter} from '@stencil/core';

import {WebManagerService, WebResolver} from '../../services/WebManagerService';
import {HostElement} from '../../decorators'
import wizard from '../../services/WizardService';
import {SUPPORTED_LOADERS} from "../multi-spinner/supported-loader";

const {OrderLine, Product, OrderStatus} = wizard.Model;

@Component({
  tag: 'managed-orderline-list-item',
  styleUrl: 'managed-orderline-list-item.css',
  shadow: false,
})
export class ManagedOrderlineListItem {

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
    eventName: 'ssapp-navigate-tab',
    bubbles: true,
    composed: true,
    cancelable: true,
  })
  sendNavigateTab: EventEmitter;

  private sendError(message: string, err?: object){
    const event = this.sendErrorEvent.emit(message);
    if (!event.defaultPrevented || err)
      console.log(`Product Component: ${message}`, err);
  }

  private navigateToTab(tab: string,  props: any){
    const event = this.sendNavigateTab.emit({
      tab: tab,
      props: props
    });
    if (!event.defaultPrevented)
      console.log(`Tab Navigation request seems to have been ignored byt all components...`);
  }

  @Prop({attribute: 'order-line', mutable: true}) orderLine: string;

  @Prop({attribute: 'gtin-label', mutable: true}) gtinLabel?: string = "Gtin:";

  @Prop({attribute: 'name-label', mutable: true}) nameLabel?: string = "Name:";

  @Prop({attribute: 'requester-label', mutable: true}) requesterLabel?: string = "Requester:";

  @Prop({attribute: 'sender-label', mutable: true}) senderLabel?: string = "Sender:";

  @Prop({attribute: 'created-on-label', mutable: true}) createdOnLabel?: string = "Created on:";

  @Prop({attribute: 'status-label', mutable: true}) statusLabel?: string = "Status:";

  @Prop({attribute: 'quantity-label', mutable: true}) quantityLabel?: string = "Quantity:";

  private orderLineManager: WebResolver = undefined;

  private productManager: WebResolver = undefined;

  @State() line: typeof OrderLine = undefined;

  @State() product: typeof Product = undefined;

  async componentWillLoad() {
    if (!this.host.isConnected)
      return;
    this.orderLineManager = await WebManagerService.getWebManager("OrderLineManager");
    this.productManager = await WebManagerService.getWebManager("ProductManager");
    return await this.loadOrderLine();
  }

  private async loadOrderLine(){
    let self = this;
    if (!self.orderLineManager)
      return;
    self.orderLineManager.getOne(self.orderLine, true, (err, line) => {
      if (err){
        self.sendError(`Could not get OrderLine with reference ${self.orderLine}`, err);
        return;
      }
      self.line = line;

      self.productManager.getOne(self.line.gtin, true, (err, product: typeof Product) => {
        if (err){
          self.sendError(`Could not get Product data from ${self.line.gtin}`, err);
          return;
        }
        self.product = product;
      });
    });
  }

  @Watch('orderLine')
  @Method()
  async refresh(){
    await this.loadOrderLine();
  }

  private addBarCode(){
    const self = this;

    const getBarCode = function(){
      if (!self.line || !self.line.gtin)
        return (<ion-skeleton-text animated></ion-skeleton-text>);
      return (<barcode-generator class="ion-align-self-center" type="code128" size="32" scale="6" data={self.line.gtin}></barcode-generator>);
    }

    return(
      <ion-thumbnail class="ion-align-self-center bar-code" slot="start">
        {getBarCode()}
      </ion-thumbnail>
    )
  }

  private getPropsFromKey(){
    if (!this.orderLine)
      return undefined;
    const props = this.orderLine.split('-');
    return {
      requesterId: props[0],
      gtin: props[1],
      date: (new Date(parseInt(props[2]) * 1000)).toLocaleDateString("en-US")
    }
  }

  private addProductColumn(props){
    const self = this;
    const getNameLabel = function(){
      if (!self.product || !self.product.name)
        return (<h4><ion-skeleton-text animated class="label-name"></ion-skeleton-text></h4>)
      return (<h4>{self.product.name}</h4>)
    }
    const getGtinLabel = function(){
      if (!props || !props.gtin)
        return (<h3><ion-skeleton-text animated class="label-gtin"></ion-skeleton-text></h3>);
      return (<h3>{props.gtin}</h3>)
    }

    return [
      <ion-label class="ion-padding-horizontal ion-align-self-center" position="stacked"><p>{self.gtinLabel}</p></ion-label>,
      <ion-label class="ion-padding ion-align-self-center">
        {getGtinLabel()}
      </ion-label>,
      <ion-label class="ion-padding-horizontal ion-align-self-center" position="stacked"><p>{self.requesterLabel}</p></ion-label>,
      <ion-label class="ion-padding ion-align-self-center">
        {getNameLabel()}
      </ion-label>
    ];
  }

  private addRequesterColumn(props){
    const self = this;

    const getRequesterLabel = function(){
      if (!props || !props.requesterId)
        return (<h4><ion-skeleton-text animated class="label-requester"></ion-skeleton-text></h4>)
      return (<h4>{props.requesterId}</h4>)
    }

    const getDateLabel = function(){
      if (!props || !props.date)
        return (<h4><ion-skeleton-text animated class="label-date"></ion-skeleton-text></h4>)
      return (<h4>{props.date}</h4>)
    }

    return [
      <ion-label class="ion-padding-horizontal ion-align-self-center" position="stacked"><p>{self.requesterLabel}</p></ion-label>,
      <ion-label class="ion-padding ion-align-self-center">
        {getRequesterLabel()}
      </ion-label>,
      <ion-label class="ion-padding-horizontal ion-align-self-center" position="stacked"><p>{self.createdOnLabel}</p></ion-label>,
      <ion-label class="ion-padding ion-align-self-center">
        {getDateLabel()}
      </ion-label>
    ];
  }

  addSenderColumn(props){
    const self = this;

    const getSenderLabel = function(){
      if (!self.line || !self.line.senderId)
        return (<h4><ion-skeleton-text animated class="label-sender"></ion-skeleton-text></h4>);
      return (<h4>{self.line.senderId}</h4>)
    }

    const getDateLabel = function(){
      if (!props || !props.date)
        return (<h4><ion-skeleton-text animated class="label-date"></ion-skeleton-text></h4>)
      return (<h4>{props.date}</h4>)
    }

    return [
      <ion-label class="ion-padding-horizontal ion-align-self-center" position="stacked"><p>{self.senderLabel}</p></ion-label>,
      <ion-label class="ion-padding ion-align-self-center">
        {getSenderLabel()}
      </ion-label>,
      <ion-label class="ion-padding-horizontal ion-align-self-center" position="stacked"><p>{self.createdOnLabel}</p></ion-label>,
      <ion-label class="ion-padding ion-align-self-center">
        {getDateLabel()}
      </ion-label>,
    ];
  }

  addDetailsColumn(){
    const self = this;

    const getStatusBadge = function(){
      if (!self.line || !self.line.status)
        return (<multi-loader class="ion-float-start" type={SUPPORTED_LOADERS.bubblingSmall}></multi-loader>)

      const getColorByStatus = function(){
        switch (self.line.status){
          case OrderStatus.REJECTED:
            return 'danger';
          case OrderStatus.On_HOLD:
            return 'warning';
          case OrderStatus.CONFIRMED:
            return 'success';
          case OrderStatus.CREATED:
            return 'medium';
          case OrderStatus.ACKNOWLEDGED:
          case OrderStatus.TRANSIT:
          case OrderStatus.RECEIVED:
            return 'secondary';
          default:
            return 'primary'
        }
      }

      return (<ion-badge color={getColorByStatus()} class="ion-text-uppercase">{self.line.status}</ion-badge>)
    }

    const getQuantityBadge = function() {
      if (!self.line || !self.line.quantity)
        return (<multi-loader type={SUPPORTED_LOADERS.bubblingSmall}></multi-loader>)

      return (<ion-badge color="primary" class="ion-text-uppercase">{self.line.quantity}</ion-badge>)
    }

    return [
      <ion-label class="ion-padding-horizontal ion-align-self-center" position="stacked"><p>{self.statusLabel}</p></ion-label>,
      <ion-label class="ion-padding ion-align-self-center">
        {getStatusBadge()}
      </ion-label>,
      <ion-label class="ion-padding-horizontal ion-align-self-center" position="stacked"><p>{self.quantityLabel}</p></ion-label>,
      <ion-label class="ion-padding ion-align-self-center">
        {getQuantityBadge()}
      </ion-label>
    ];
  }

  private addButtons(){
    let self = this;
    const getButtons = function(){
      if (!self.line)
        return (<ion-skeleton-text animated></ion-skeleton-text>)
      return (
        <ion-button slot="primary" onClick={() => self.navigateToTab('tab-batches', {orderLine: self.orderLine})}>
          <ion-icon name="file-tray-stacked-outline"></ion-icon>
        </ion-button>
      )
    }

    return(
      <ion-buttons class="ion-align-self-center ion-padding" slot="end">
        {getButtons()}
      </ion-buttons>
    )
  }

  render() {
    const props = this.getPropsFromKey();
    return (
        <ion-item class="ion-align-self-center main-item">
          {this.addBarCode()}
          <ion-grid>
            <ion-row>
              <ion-col size="4">
                {...this.addProductColumn(props)}
              </ion-col>
              <ion-col size="3">
                {...this.addRequesterColumn(props)}
              </ion-col>
              <ion-col size="3">
                {...this.addSenderColumn(props)}
              </ion-col>
              <ion-col size="2">
                {...this.addDetailsColumn()}
              </ion-col>
            </ion-row>
          </ion-grid>
          {this.addButtons()}
        </ion-item>
    );
  }
}
