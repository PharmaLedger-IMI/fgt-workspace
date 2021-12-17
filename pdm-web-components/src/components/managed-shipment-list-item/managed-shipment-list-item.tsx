import {Component, Host, h, Prop, State, Watch, Method, Element, Event, EventEmitter} from '@stencil/core';
import {WebResolver, WebManagerService} from '../../services/WebManagerService';
import wizard from '../../services/WizardService';
import {HostElement} from "../../decorators";
import {ListItemLayout} from "../list-item-layout/list-item-layout";

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

  @Prop() isHeader: boolean;

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

    if(!self.isHeader)
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
      if(self.isHeader)
        return 'Shipment ID';

      if (!self.shipment || !self.shipment.shipmentId)
        return (<ion-skeleton-text animated></ion-skeleton-text>)
      return self.shipment.shipmentId;
    }

    const getIdLabel = function(){
      if(self.isHeader)
        return 'Requester ID';

      if (!self.shipment)
        return (<ion-skeleton-text animated></ion-skeleton-text>);
      const attribute = self.shipment[self.type === SHIPMENT_TYPE.ISSUED ? 'requesterId' : 'senderId'];
      if (!attribute)
        return (<ion-skeleton-text animated></ion-skeleton-text>)
      return attribute;
    }

    const buildLabelElement = (props: any) =>{
      return (
        <ion-col className="ion-padding-start" size="auto">
          <ion-label color="secondary">
            {props}
          </ion-label>
        </ion-col>
      )
    }

    const getStatusBadge = function(){
      if(self.isHeader)
        return 'Status';

      if (!self.shipment)
        return;
      return (
        <ion-col className="ion-padding-start" size="auto">
          <status-badge status={self.shipment.status.status}></status-badge>
        </ion-col>
      )
    }

    if(this.isHeader)
      return(
        <ion-label slot="label" color="secondary">
          <ion-row>
            <ion-col col-12 col-sm align-self-end size-lg={2}>
              <span class="ion-padding-start">
              {getShipmentId()}
              </span>       
            </ion-col>
            <ion-col col-12 col-sm align-self-end size-lg={3}>
              <span class="ion-padding-start">
                {getIdLabel()}
              </span>    
            </ion-col>
            <ion-col col-12 col-sm align-self-end size-lg={1}>
              <span class="ion-padding-start">
                {getStatusBadge()}
              </span>    
            </ion-col>
          </ion-row>
      </ion-label>
      )

    return(
      <ion-row  slot="label" className="ion-align-items-center">
        {buildLabelElement(getShipmentId())}
        {buildLabelElement(getIdLabel())}
        {getStatusBadge()}
      </ion-row>
    )
  }

  private addShipmentLines() {
    const self = this;
    
    if(self.isHeader){
      return (
        <ion-label slot="content" color="secondary">
          <ion-row>
            <ion-col col-12 col-sm align-self-end size-lg={6}>
                <span class="ion-padding-end">
                  {"Shipment Lines"}
                </span>       
            </ion-col>
          </ion-row>
        </ion-label>
      )
    }
    if (!this.shipment || !this.shipment.shipmentLines)
      return (<ion-skeleton-text slot="content" animated></ion-skeleton-text>);
    return(
      <pdm-item-organizer slot="content"  component-name="managed-orderline-stock-chip"
                          component-props={JSON.stringify(this.shipment.shipmentLines.map(ol => ({
                            "gtin": ol.gtin,
                            "quantity": ol.quantity,
                            "mode": "detail"
                          })))}
                          id-prop="gtin"
                          is-ion-item="false"
                          display-count="3"
                          display-count-divider="180"
                          orientation={this.getOrientation()}
                          onSelectEvent={(evt) => {
                            evt.preventDefault();
                            evt.stopImmediatePropagation();
                            console.log(`Selected ${evt.detail}`);
                          }}></pdm-item-organizer>
    );
  }

  private getOrientation(){
    const layoutEl: ListItemLayout = this.element.querySelector('list-item-layout');
    return layoutEl ? layoutEl.orientation : 'end';

  }

  private addButtons(){
    let self = this;

    if(self.isHeader){
      return (
          <div slot = "buttons">
            <ion-label color="secondary">
              {"Actions"}
            </ion-label>
          </div>
      )
    }
    
    if (!self.shipment)
      return (<ion-skeleton-text animated></ion-skeleton-text>);

    const getButton = function(slot, color, icon, handler){
      return (
        <ion-button slot={slot} color={color} fill="clear" onClick={handler}>
          <ion-icon size="large" slot="icon-only" name={icon}></ion-icon>
        </ion-button>
      )
    }

    return [
      getButton("buttons", "medium", self.type === SHIPMENT_TYPE.ISSUED ? "cog" : "eye", () => self.navigateToTab('tab-shipment', {
        shipment: self.shipment,
        mode: self.type
      }))
    ]

  }

  render() {
    return (
      <Host>
        <list-item-layout>
          {this.addLabel()}
          {this.addShipmentLines()}
          {this.addButtons()}
        </list-item-layout>
      </Host>
    );
  }
}
