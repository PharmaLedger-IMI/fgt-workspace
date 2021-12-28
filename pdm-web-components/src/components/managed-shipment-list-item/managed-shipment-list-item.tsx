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

  private addShipmentLines() {
    const self = this;

    if(self.isHeader){
      return (
        <ion-col slot="content" color="secondary" size= "auto">
          <ion-label color="secondary">
            {"Shipment Lines"}
          </ion-label>       
        </ion-col>
      )    
    }

    if (!self.shipment || !self.shipment.shipmentLines)
      return (<ion-skeleton-text slot="content" animated></ion-skeleton-text>);

    return(
      <pdm-item-organizer slot="content"  component-name="managed-orderline-stock-chip"
                          component-props={JSON.stringify(self.shipment.shipmentLines.map(ol => ({
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
    const layoutEl: ListItemLayout = this.element.querySelector('list-item-layout-default');
    return layoutEl ? layoutEl.orientation : 'end';
  }

  private addButtons(){
    let self = this;
    
    const getButton = function(slot, color, icon, handler){
      return (
        <ion-button slot={slot} color={color} fill="clear" onClick={handler}>
          <ion-icon size="large" slot="icon-only" name={icon}></ion-icon>
        </ion-button>
      )
    }

    const getMockButton = function(){
      return (
        <ion-button slot="buttons" color="secondary" fill="clear" disabled="true">
          <ion-icon size="large" slot="icon-only" name="some-name"></ion-icon>
          {/* <ion-icon size="large" slot="icon-only" name="information-circle-sharp"></ion-icon> */}
        </ion-button>
      )
    }

    if(self.isHeader)
      return  [
        getMockButton(),
      ]

    if (!self.shipment)
      return (<ion-skeleton-text animated></ion-skeleton-text>);

    return [
      getButton("buttons", "medium", self.type === SHIPMENT_TYPE.ISSUED ? "cog" : "eye", () => self.navigateToTab('tab-shipment', {
        shipment: self.shipment,
        mode: self.type
      }))
    ]
  }

  addShipmentIDLabel(){
    const self = this;

    const getShipmentIdLabel = function(){
      if(self.isHeader)
        return "Shipment ID";

      if (!self.shipment || !self.shipment.shipmentId)
        return (<ion-skeleton-text animated></ion-skeleton-text>)

      return self.shipment.shipmentId;
    }

    return(
      <ion-label slot="label0" color="secondary">
          {getShipmentIdLabel()}
      </ion-label>
    )
  }

  addDestinationLabel(){
    const self = this;

    const getIdLabel = function(){
      
      if(self.isHeader)
        return (self.type === SHIPMENT_TYPE.ISSUED) ? "Requester ID" : "Sender ID";

      if (!self.shipment)
        return (<ion-skeleton-text animated></ion-skeleton-text>);

      return self.shipment[self.type === SHIPMENT_TYPE.ISSUED ? 'requesterId' : 'senderId'];
    }

    return(
      <ion-label slot="label1" color="secondary">
          {getIdLabel()}
      </ion-label>
    )
  }

  addStatusLabel(){
    const self = this;

    const getStatusBadge = function(){
      if(self.isHeader)
        return "Status";
      
      if (!self.shipment)
        return (<ion-skeleton-text animated></ion-skeleton-text>);

      return (
        <status-badge status={self.shipment.status.status}></status-badge>
      )
    }

    return(
      <ion-label slot="label2" color="secondary">
        {getStatusBadge()}
      </ion-label>
    )
  }

  generateLabelLayoutConfig(){
    const obj = {
      0 : {
        sizeByScreen: {
          "xs": 3,
          "sm": 3,
          "md": 3,
          "lg": 2,
          "xl":2
        },
        center: false,
      },
      1 : {
        sizeByScreen: {
          "xs": 3,
          "sm": 3,
          "md": 3,
          "lg": 2,
          "xl":2
        },
        center: false,
      },
      2 : {
        sizeByScreen: {
          "xs": 3,
          "sm": 3,
          "md": 2,
          "lg": 2,
          "xl":2
        },
        center: true,
      }    
    }

    return JSON.stringify(obj);
  }

  render() {
    return (
      <Host>
        <list-item-layout-default buttons={true}  label-col-config={this.generateLabelLayoutConfig()}>
          {this.addShipmentIDLabel()}
          {this.addDestinationLabel()}
          {this.addStatusLabel()}
          {this.addShipmentLines()}
          {this.addButtons()}
        </list-item-layout-default>
      </Host>
    );
  }
}

