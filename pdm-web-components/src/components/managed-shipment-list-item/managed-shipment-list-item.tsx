import {Component, Host, h, Prop, State, Watch, Method, Element, Event, EventEmitter} from '@stencil/core';
import {WebResolver, WebManagerService} from '../../services/WebManagerService';
import wizard from '../../services/WizardService';
import {HostElement} from "../../decorators";
import {EVENT_NAVIGATE_TAB, EVENT_SEND_ERROR} from "../../constants/events";

const Shipment = wizard.Model.Shipment;

const SHIPMENT_TYPE = {
  ISSUED: "issued",
  RECEIVED: 'received'
}

@Component({
  tag: 'managed-shipment-list-item',
  styleUrl: 'managed-shipment-list-item.css',
  shadow: false,
})
export class ManagedShipmentListItem{

  @HostElement() host: HTMLElement;

  @Element() element;

  /**
   * Through this event errors are passed
   */
  @Event({
    eventName: EVENT_SEND_ERROR,
    bubbles: true,
    composed: true,
    cancelable: true,
  })
  sendErrorEvent: EventEmitter;

  /**
   * Through this event navigation requests to tabs are made
   */
  @Event({
    eventName: EVENT_NAVIGATE_TAB,
    bubbles: true,
    composed: true,
    cancelable: true,
  })
  sendNavigateTab: EventEmitter;

  protected sendError(message: string, err?: object){
    const event = this.sendErrorEvent.emit(message);
    if (!event.defaultPrevented || err)
      console.log(`Shipment Component: ${message}`, err);
  }

  protected navigateToTab(tab: string,  props?: any){
    const event = this.sendNavigateTab.emit({
      tab: tab,
      props: props
    });
    if (!event.defaultPrevented)
      console.log(`Tab Navigation request seems to have been ignored byt all components...`);
  }

  @Prop({attribute: 'shipment-id', mutable: true}) shipmentId: string;

  @Prop({attribute: 'shipment-line-count', mutable: true}) shipmentLineCount?: number = 4;

  @Prop({attribute: 'type'}) type?: string = SHIPMENT_TYPE.ISSUED;

  @State() shipment: typeof Shipment = undefined;

  private manager: WebResolver = undefined;

  async componentWillLoad() {
    if (!this.host.isConnected)
      return;
    const prefix = this.type.charAt(0).toUpperCase() + this.type.slice(1).toLowerCase();
    this.manager = await WebManagerService.getWebManager(`${prefix}ShipmentManager`);
    return await this.loadShipment();
  }

  async loadShipment(){
    let self = this;
    if (!self.manager)
      return;
    self.manager.getOne(self.shipmentId, true, (err, shipment) => {
      if (err){
        self.sendError(`Could not get Shipment with id ${self.shipmentId}`, err);
        return;
      }
      self.shipment = shipment;
    });
  }

  @Watch('shipmentId')
  @Method()
  async refresh(){
    await this.loadShipment();
  }

  private addLabel(){
    const self = this;

    const getShipmentId = function(){
      if (!self.shipment || !self.shipment.shipmentId)
        return (<h3><ion-skeleton-text animated></ion-skeleton-text> </h3>)
      return (<h3>{self.shipment.shipmentId}</h3>)
    }

    const getIdLabel = function(){
      if (!self.shipment)
        return (<h5><ion-skeleton-text animated></ion-skeleton-text> </h5>);
      const attribute = self.shipment[self.type === SHIPMENT_TYPE.ISSUED ? 'requesterId' : 'senderId'];
      if (!attribute)
        return (<h5><ion-skeleton-text animated></ion-skeleton-text> </h5>)
      return (<h5>{attribute}</h5>)
    }

    return(
      <ion-label class="ion-padding-horizontal ion-align-self-center">
        {getShipmentId()}
        {getIdLabel()}
      </ion-label>)
  }

  private addShipmentLine(shipmentLine){
    return(
      <managed-orderline-stock-chip gtin={shipmentLine.gtin} quantity={shipmentLine.quantity} mode="detail"></managed-orderline-stock-chip>
    )
  }

  private addShipmentLines() {
    let shipmentLines = (<ion-skeleton-text animated></ion-skeleton-text>);
    if (this.shipment && this.shipment.shipmentLines) {
      if (this.shipment.shipmentLines.length > this.shipmentLineCount) {
        shipmentLines = [...this.shipment.shipmentLines].slice(0, this.shipmentLineCount).map(ol => this.addShipmentLine(ol));
        shipmentLines.push((
          <more-chip class="ion-float-end" color="secondary" text="..."></more-chip>
        ));
      } else {
        shipmentLines = this.shipment.shipmentLines.map(ol => this.addShipmentLine(ol));
      }
    }
    return (
      <ion-grid class="ion-padding-horizontal">
        <ion-row>
          <ion-col size="12">
            {shipmentLines}
          </ion-col>
        </ion-row>
      </ion-grid>
    );
  }

  private getRelevantParticipantId(){
    return this.shipment[this.type === SHIPMENT_TYPE.ISSUED ? 'requesterId' : 'senderId'];
  }

  private addButtons(){
    let self = this;

    const getButtons = function(){
      if (!self.shipment)
        return (<ion-skeleton-text animated></ion-skeleton-text>)
      const props = {
        shipmentId: self.shipment.shipmentId,
        participantId: self.getRelevantParticipantId()
      }
      return (
        <ion-button slot="primary" onClick={() => self.navigateToTab('tab-shipment', props)}>
          <ion-icon name="cog-outline"></ion-icon>
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
          {this.addLabel()}
          {this.addShipmentLines()}
          {this.addButtons()}
        </ion-item>
      </Host>
    );
  }
}
