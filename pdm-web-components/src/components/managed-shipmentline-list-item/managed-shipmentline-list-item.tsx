import {Component, h, Element, Prop, State, Watch, Method, Event, EventEmitter, Host, Listen} from '@stencil/core';

import {WebManagerService, WebResolver} from '../../services/WebManagerService';
import {HostElement} from '../../decorators'
import wizard from '../../services/WizardService';
import {SUPPORTED_LOADERS} from "../multi-spinner/supported-loader";
import {ListItemLayout} from "../list-item-layout/list-item-layout";
import {getBarCodePopOver} from "../../utils/popOverUtils";
import {calcBreakPoint} from "../../utils/utilFunctions";

const {ShipmentLine, Product, Batch} = wizard.Model;

@Component({
  tag: 'managed-shipmentline-list-item',
  styleUrl: 'managed-shipmentline-list-item.css',
  shadow: false,
})
export class ManagedShipmentlineListItem {

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
  
  @Prop() isHeader: boolean;

  private shipmentLineManager: WebResolver = undefined;

  private productManager: WebResolver = undefined;

  private batchManager: WebResolver = undefined;

  @State() line: typeof ShipmentLine = undefined;

  @State() product: typeof Product = undefined;

  @State() batch: typeof Batch = undefined;

  @State() showMessage: boolean = false;

  @State() currentBreakpoint: string = calcBreakPoint();

  private config;

  async componentWillLoad() {
    if (!this.host.isConnected)
      return;
    this.shipmentLineManager = await WebManagerService.getWebManager("ShipmentLineManager");
    this.productManager = await WebManagerService.getWebManager("ProductManager");
    this.batchManager = await WebManagerService.getWebManager("BatchManager");
    return await this.loadShipmentLine();
  }

  private async loadShipmentLine(){
    let self = this;

    if (!self.shipmentLineManager || !self.shipmentLine)
      return;

    if(!self.isHeader)
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
    await this.loadShipmentLine();
  }

  @Listen('resize', { target: 'window' })
  async updateComponent(){
    this.currentBreakpoint = calcBreakPoint();
    this.refresh();
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

  private getOrientation(){
    const layout: ListItemLayout = this.element.querySelector('list-item-layout');
    return layout ? layout.orientation : 'end';
  }

  addRequesterLabel(){
    const self = this;
    const props =this.getPropsFromKey();

    const getRequesterLabel = function (){
      if(self.isHeader)
        return "Requester"

      if(!self.line)
        return(<ion-skeleton-text animated></ion-skeleton-text>)

      return props.requesterId
    }

    return(
      <ion-label slot="label0" color="secondary">
          {getRequesterLabel()}
      </ion-label>
    )
  }

  addSenderLabel(){
    const self = this;
    const props =this.getPropsFromKey();

    const getSenderLabel = function (){
      if(self.isHeader)
        return "Sender"

      if(!self.line)
        return(<ion-skeleton-text animated></ion-skeleton-text>)

      return props.senderId
    }

    return(
      <ion-label slot="label1" color="secondary">
          {getSenderLabel()}
      </ion-label>
    )
  }

  addStatusLabel(){
    const self = this;

    const getStatusLabel = function(){
      if(self.isHeader)
          return "Status";

      if (!self.line)
        return (<ion-skeleton-text animated></ion-skeleton-text>);

      return (
        <ion-col size="auto">
          <status-badge status={self.line.status.status}></status-badge>
        </ion-col>
      )
    }

    return(
      <ion-label slot="label2" color="secondary">
        {getStatusLabel()}
      </ion-label>
    )

  }

  addInfoLabel(){
    const self = this;

    const getExtraInfo = function() {
      if(self.isHeader)
        return "Info"

      if(self.showMessage)
        return (
          <ion-button slot="buttons" color="secondary" fill="clear" onClick={() => {
            self.showMessage = false;
            self.refresh()
          }}>
            <ion-icon size="large" slot="icon-only" name="caret-up-circle-outline"></ion-icon>
          </ion-button>
        )
      
      return(
        <ion-button slot="buttons" color="secondary" fill="clear" onClick={() => {
          self.showMessage = true;
          self.refresh();
        }}>
          <ion-icon size="large" slot="icon-only" name="caret-down-circle-outline"></ion-icon>
        </ion-button>
      )

    }

    return(
      <ion-label slot="label3" color="secondary">
        {getExtraInfo()}
      </ion-label>
    )
  }

  addSerials(){
    const self = this;

    if(self.isHeader){
      return (
            <ion-col slot="content" color="secondary" size= "auto">
              <ion-label color="secondary">
                {"S.Nº"}
              </ion-label>       
            </ion-col>
      )
    }

    if (!self.batch)
      return (<multi-spinner slot="content" type={SUPPORTED_LOADERS.bubblingSmall}></multi-spinner>);

    return(
      <pdm-item-organizer slot="content" component-name="generic-chip"
                          component-props={JSON.stringify(self.batch.serialNumbers.map(serial => ({
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

  addButtons(){
    let self = this;

    const getMockButton = function(){
      return (
        <ion-button slot="buttons" color="secondary" fill="clear" disabled="true">
          <ion-icon size="large" slot="icon-only" name="some-name"></ion-icon>
          {/* <ion-icon size="large" slot="icon-only" name="information-circle-sharp"></ion-icon> */}
        </ion-button>
      )
    }

    if(self.isHeader)
      return[
        getMockButton(),
      ]

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

  addGtinInfo(header){
    const self = this;
    const props = this.getPropsFromKey();

    const getGtinInfo = function() {
      if(header)
        return "Gtin";

      if (!self.line)
        return (<ion-skeleton-text animated></ion-skeleton-text>);

      return props.gtin;
    }

    return(
      <ion-label color="secondary">
          {getGtinInfo()}
      </ion-label>
    )
  }

  addBatchNumberInfo(header){
    const self = this;

    const getBatchNumberInfo = function(){
      if(header)
        return "Batch Nº";

      if (!self.batch)
        return (<ion-skeleton-text animated className="label-batch"></ion-skeleton-text>)

      return self.batch.batchNumber;
    }

    return(
      <ion-label color="secondary">
          {getBatchNumberInfo()}
      </ion-label>
    )
  }

  addQuantityInfo(header) {
    const self = this;

    const getQuantityLabel = function(){
      if(header)
        return "QTY"

      if (!self.line)
        return (<ion-skeleton-text animated className="label-quantity"></ion-skeleton-text>)

      return self.line.getQuantity();
    }

    return(
      <ion-label color="secondary">
        {getQuantityLabel()}
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
      },
      3 : {
        sizeByScreen: {
          "xs": 2,
          "sm": 2,
          "md": 1,
          "lg": 1,
          "xl":1
        },
        center: true,
      },      
    }

    return JSON.stringify(obj);
  }

  generateInfoLayoutConfig(){
    const obj = {
      "gtin" : {
          "xs": 4,
          "sm": 4,
          "md": 3,
          "lg": 2,
          "xl":2
      },
      "batch" : {
          "xs": 2,
          "sm": 2,
          "md": 2,
          "lg": 1,
          "xl":1
      },
      "qty" : {
          "xs": 1,
          "sm": 1,
          "md": 1,
          "lg": 1,
          "xl":1
      },
      "empty" : {
          "xs": 5,
          "sm": 5,
          "md": 6,
          "lg": 8,
          "xl":8
      },      
    }

    return obj;
  }

  showPage(){
    const self = this;
  
    self.config = self.generateInfoLayoutConfig();

    if(self.showMessage)
      return [
        <list-item-layout-default buttons={true}  label-col-config={self.generateLabelLayoutConfig()}>
          {self.addRequesterLabel()}
          {self.addSenderLabel()}
          {self.addStatusLabel()}
          {self.addInfoLabel()}
          {self.addSerials()}
          {self.addButtons()}
        </list-item-layout-default>,
        <ion-grid id="expandable">
          <ion-row class="ion-align-items-center">
            <ion-col size={self.config["gtin"][self.currentBreakpoint]+""}>
              <ion-label class={`flex ion-justify-content-start ion-padding-start`} color="secondary">
                {self.addGtinInfo(true)}
              </ion-label>
            </ion-col>
            <ion-col size={self.config["batch"][self.currentBreakpoint]+""}>
              <ion-label class={`flex ion-justify-content-start`} color="secondary">
                {self.addBatchNumberInfo(true)}
              </ion-label>
            </ion-col>
            <ion-col size={self.config["qty"][self.currentBreakpoint]+""}>
              <ion-label class={`flex ion-justify-content-start`} color="secondary">
                {self.addQuantityInfo(true)}
              </ion-label>
            </ion-col>
            <ion-col size={self.config["empty"][self.currentBreakpoint]+""}>
              <ion-label class={`flex ion-justify-content-start`} color="secondary">
              </ion-label>
            </ion-col>
          </ion-row>
          <ion-row class="ion-align-items-center ion-padding-top">
            <ion-col size={self.config["gtin"][self.currentBreakpoint]+""}>
              <ion-label class={`flex ion-justify-content-start ion-padding-start`} color="secondary">
                {self.addGtinInfo(false)}
              </ion-label>
            </ion-col>
            <ion-col size={self.config["batch"][self.currentBreakpoint]+""}>
              <ion-label class={`flex ion-justify-content-start`} color="secondary">
                {self.addBatchNumberInfo(false)}
              </ion-label>
            </ion-col>
            <ion-col size={self.config["qty"][self.currentBreakpoint]+""}>
              <ion-label class={`flex ion-justify-content-start`} color="secondary">
                {self.addQuantityInfo(false)}
              </ion-label>
            </ion-col>
            <ion-col size={self.config["empty"][self.currentBreakpoint]+""}>
              <ion-label class={`flex ion-justify-content-start`} color="secondary">
              </ion-label>
            </ion-col>
          </ion-row>
        </ion-grid>
      ]


    return (
      <list-item-layout-default buttons={true}  label-col-config={self.generateLabelLayoutConfig()}>
        {self.addRequesterLabel()}
        {self.addSenderLabel()}
        {self.addStatusLabel()}
        {self.addInfoLabel()}
        {self.addSerials()}
        {self.addButtons()}
      </list-item-layout-default>
    )

  }

  render() {
    if(!this.host.isConnected)
      return;

    return (
      <Host>
        {this.showPage()}
      </Host>
    );
  }
}


