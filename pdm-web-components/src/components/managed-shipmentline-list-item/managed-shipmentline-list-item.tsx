import {Component, h, Element, Prop, State, Watch, Method, Event, EventEmitter, Host} from '@stencil/core';

import {WebManagerService, WebResolver} from '../../services/WebManagerService';
import {HostElement} from '../../decorators'
import wizard from '../../services/WizardService';
import {SUPPORTED_LOADERS} from "../multi-spinner/supported-loader";
import {ListItemLayout} from "../list-item-layout/list-item-layout";
import {getBarCodePopOver} from "../../utils/popOverUtils";

const {ShipmentLine, Product, Batch, ShipmentStatus} = wizard.Model;

@Component({
  tag: 'managed-shipmentline-list-item',
  styleUrl: 'managed-shipmentline-list-item.css',
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

  @Prop({attribute: 'shipment-line', mutable: true}) shipmentLine: string;

  @Prop({attribute: 'gtin-label', mutable: true}) gtinLabel?: string = "Gtin:";

  @Prop({attribute: 'bach-label', mutable: true}) batchLabel?: string = "Batch:";

  @Prop({attribute: 'name-label', mutable: true}) nameLabel?: string = "Name:";

  @Prop({attribute: 'requester-label', mutable: true}) requesterLabel?: string = "Requester:";

  @Prop({attribute: 'sender-label', mutable: true}) senderLabel?: string = "Sender:";

  @Prop({attribute: 'created-on-label', mutable: true}) createdOnLabel?: string = "Created on:";

  @Prop({attribute: 'status-label', mutable: true}) statusLabel?: string = "Status:";

  @Prop({attribute: 'quantity-label', mutable: true}) quantityLabel?: string = "Quantity:";

  private shipmentLineManager: WebResolver = undefined;

  private productManager: WebResolver = undefined;

  private batchManager: WebResolver = undefined;

  @State() line: typeof ShipmentLine = undefined;

  @State() product: typeof Product = undefined;

  @State() batch: typeof Batch = undefined;

  async componentWillLoad() {
    if (!this.host.isConnected)
      return;
    this.shipmentLineManager = await WebManagerService.getWebManager("ShipmentLineManager");
    this.productManager = await WebManagerService.getWebManager("ProductManager");
    this.batchManager = await WebManagerService.getWebManager("BatchManager");
    return await this.loadOrderLine();
  }

  private async loadOrderLine(){
    let self = this;
    if (!self.shipmentLineManager)
      return;
    self.shipmentLineManager.getOne(self.shipmentLine, true, (err, line) => {
      if (err){
        self.sendError(`Could not get ShipmentLine with reference ${self.shipmentLine}`, err);
        return;
      }
      self.line = line;

      self.productManager.getOne(self.line.gtin, true, (err, product: typeof Product) => {
        if (err){
          self.sendError(`Could not get Product data from ${self.line.gtin}`, err);
          return;
        }
        self.product = product;

        self.batchManager.getOne(`${self.line.gtin}-${self.line.batch}`, true, (err, batch) => {
          if (err){
            self.sendError(`Could not get batch data from ${self.line.gtin}'s ${self.line.batch}`, err);
            return;
          }
          self.batch = batch;
        });
      });
    });
  }

  @Watch('shipmentLine')
  @Method()
  async refresh(){
    await this.loadOrderLine();
  }

  private getPropsFromKey(){
    if (!this.shipmentLine)
      return undefined;
    const props = this.shipmentLine.split('-');
    return {
      requesterId: props[0],
      senderId: props[1],
      gtin: props[2],
      createdOn: (new Date(parseInt(props[3]) * 1000)).toLocaleDateString("en-US")
    }
  }

  addSenderColumn(props){
    const self = this;

    const getSenderLabel = function(){
      if (!props || !props.senderId)
        return (<h4><ion-skeleton-text animated class="label-sender"></ion-skeleton-text></h4>);
      return (<h4>{props.senderId}</h4>)
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
          case ShipmentStatus.REJECTED:
            return 'danger';
          case ShipmentStatus.On_HOLD:
            return 'warning';
          case ShipmentStatus.CONFIRMED:
            return 'success';
          case ShipmentStatus.CREATED:
            return 'medium';
          case ShipmentStatus.ACKNOWLEDGED:
          case ShipmentStatus.TRANSIT:
          case ShipmentStatus.RECEIVED:
            return 'secondary';
          default:
            return 'primary'
        }
      }

      return (<ion-badge color={getColorByStatus()} class="ion-padding-horizontal ion-text-uppercase">{self.line.status}</ion-badge>)
    }

    const getQuantityBadge = function() {
      if (!self.line || !self.line.quantity)
        return (<multi-loader type={SUPPORTED_LOADERS.bubblingSmall}></multi-loader>)

      return (<ion-badge color="primary" class="ion-padding-horizontal ion-text-uppercase">{self.line.quantity}</ion-badge>)
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

  private triggerSelect(evt){
    evt.preventDefault();
    evt.stopImmediatePropagation();
    console.log(`Selected ${evt.detail}`);
    const {gtin} = this.line;
    const {batchNumber} = this.batch;
    this.navigateToTab('tab-individual-product', {
      gtin: gtin,
      batchNumber: batchNumber,
      serialNumber: evt.detail
    })
  }

  addSerials(){
    if (!this.batch)
      return (<multi-spinner slot="content" type={SUPPORTED_LOADERS.bubblingSmall}></multi-spinner>);
    return(
      <pdm-item-organizer slot="content" component-name="generic-chip"
                          component-props={JSON.stringify(this.batch.serialNumbers.map(serial => ({
                            "chip-label": serial,
                            "class": "ion-margin-start"
                          })))}
                          id-prop="chip-label"
                          is-ion-item="false"
                          display-count="1"
                          orientation={this.getOrientation()}
                          onSelectEvent={this.triggerSelect.bind(this)}></pdm-item-organizer>
    )
  }

  addDetails(){
    const props = this.getPropsFromKey();
    return [
      <ion-label slot="content" color="secondary" class="ion-float-left">
        {props.requesterId}
        <span class="ion-padding-start">{props.senderId}</span>
      </ion-label>,
      this.addSerials()
    ]
  }

  addLabel(){
    const props = this.getPropsFromKey();
    const self = this;

    const getBatchLabel = function(){
      if (!self.batch)
        return (<ion-skeleton-text animated className="label-batch"></ion-skeleton-text>)
      return self.batch;
    }

    const getQuantityLabel = function(){
      if (!self.line)
        return (<ion-skeleton-text animated className="label-quantity"></ion-skeleton-text>)
      return self.line.getQuantity();
    }

    const getStatusLabel = function(){
      if (!self.line)
        return (<ion-skeleton-text animated className="label-status"></ion-skeleton-text>)
      return (<ion-badge>{self.line.status}</ion-badge>);
    }

    return(
      <ion-label slot="label" color="secondary">
        {props.gtin}
        <span class="ion-padding-start">{getBatchLabel()}</span>
        <span class="ion-padding-start">{getQuantityLabel()}</span>
        <span class="ion-padding-start">{getStatusLabel()}</span>
      </ion-label>)
  }

  private getOrientation(){
    const layout: ListItemLayout = this.element.querySelector('list-item-layout');
    return layout ? layout.orientation : 'end';
  }

  addButtons(){
    let self = this;
    if (!self.shipmentLine)
      return (<ion-skeleton-text animated></ion-skeleton-text>);

    const getButton = function(slot, color, icon, handler){
      return (
        <ion-button slot={slot} color={color} fill="clear" onClick={handler}>
          <ion-icon size="large" slot="icon-only" name={icon}></ion-icon>
        </ion-button>
      )
    }

    return [
      getButton("buttons", "medium", "barcode", (evt) => getBarCodePopOver({
        type: "code128",
        size: "32",
        scale: "6",
        data: self.shipmentLine
      }, evt))
    ]
  }

  render() {
    if(!this.host.isConnected)
      return;
    return (
      <Host>
        <list-item-layout>
          {this.addLabel()}
          {...this.addDetails()}
          {this.addButtons()}
        </list-item-layout>
      </Host>
    );
  }
}
