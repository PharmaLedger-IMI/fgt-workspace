import {Component, Host, h, Element, Prop, State, Watch, Method, Event, EventEmitter} from '@stencil/core';

import {WebManagerService, WebResolver} from '../../services/WebManagerService';
import {HostElement} from '../../decorators'
import wizard from '../../services/WizardService';
import {SUPPORTED_LOADERS} from "../multi-spinner/supported-loader";

const OrderLine = wizard.Model.OrderLine;

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

  private orderLineManager: WebResolver = undefined;

  @State() line: typeof OrderLine = undefined;

  async componentWillLoad() {
    if (!this.host.isConnected)
      return;
    this.orderLineManager = await WebManagerService.getWebManager("OrderLineManager");
    return await this.loadOrderLine();
  }

  async loadOrderLine(){
    let self = this;
    if (!self.orderLineManager)
      return;
    self.orderLineManager.getOne(self.orderLine, true, (err, line) => {
      if (err){
        self.sendError(`Could not get OrderLine with reference ${self.orderLine}`, err);
        return;
      }
      this.line = line;
    });
  }

  @Watch('orderLine')
  @Method()
  async refresh(){
    await this.loadOrderLine();
  }

  addBarCode(){
    const self = this;

    const getBarCode = function(){
      if (!self.line || !self.line.gtin)
        return (<ion-skeleton-text animated></ion-skeleton-text>);
      return (<barcode-generator class="ion-align-self-center" type="code128" size="32" scale="6" data={self.line.gtin}></barcode-generator>);
    }

    return(
      <ion-thumbnail class="ion-align-self-center" slot="start">
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

  addLabel(){
    const self = this;

    const getGtinLabel = function(){
      if (!props || !props.gtin)
        return (<h3><ion-skeleton-text animated></ion-skeleton-text> </h3>);
      return (<h3>{props.gtin}</h3>)
    }

    const getRequesterLabel = function(){
      if (!props || !props.requesterId)
        return (<h5><ion-skeleton-text animated></ion-skeleton-text> </h5>)
      return (<h5>{props.requesterId}</h5>)
    }

    const getDateLabel = function(){
      if (!props || !props.date)
        return (<p><ion-skeleton-text animated></ion-skeleton-text> </p>)
      return (<p>{props.date}</p>)
    }
    const props = self.getPropsFromKey();

    return(
      <ion-label class="ion-padding-horizontal ion-align-self-center">
        {getGtinLabel()}
        {getRequesterLabel()}
        {getDateLabel()}
      </ion-label>)
  }

  addDetails(){
    if (!this.line)
      return (<multi-loader type={SUPPORTED_LOADERS.bubblingSmall}></multi-loader>)
    return(
      <ion-grid class="ion-padding-horizontal">
        <ion-row>
          <ion-col size="3">
            <ion-chip outline class="ion-padding-horizontal" color="primary">{this.line.quantity}</ion-chip>
          </ion-col>
          <ion-col size="3">
            <ion-chip outline class="ion-padding-horizontal" color="primary">{this.line.status}</ion-chip>
          </ion-col>
        </ion-row>
      </ion-grid>
    )
  }

  addButtons(){
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
    return (
      <Host>
        <ion-item class="ion-align-self-center main-item">
          {this.addBarCode()}
          {this.addLabel()}
          {this.addDetails()}
          {this.addButtons()}
        </ion-item>
      </Host>
    );
  }
}
