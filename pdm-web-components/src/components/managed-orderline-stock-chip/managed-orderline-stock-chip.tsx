import {Component, Host, h, Prop, Element, State, Event, EventEmitter} from '@stencil/core';
import {HostElement} from "../../decorators";
import {WebManagerService, WebResolver} from "../../services/WebManagerService";
import {SUPPORTED_LOADERS} from "../multi-spinner/supported-loader";
import {getSteppedColor, FALLBACK_COLOR} from "../../utils/colorUtils";
import {OverlayEventDetail} from "@ionic/core";

// @ts-ignore
const {Stock, Product}  = require('wizard').Model;

const CHIP_TYPE = {
  SIMPLE: "simple",
  DETAIL: "detail"
}

const AVAILABLE_BUTTONS = {
  CONFIRM: "confirm",
  CANCEL: "cancel"
}

@Component({
  tag: 'managed-orderline-stock-chip',
  styleUrl: 'managed-orderline-stock-chip.css',
  shadow: false,
})
export class ManagedOrderlineStockChip {

  @HostElement() host: HTMLElement;

  @Element() element;

  /**
   * Through this event actions are passed
   */
  @Event()
  sendAction: EventEmitter<OverlayEventDetail>;

  private sendActionEvent(){
    const event = this.sendAction.emit({
      data: {
        action: this.button,
        gtin: this.gtin
      }
    });
    if (!event.defaultPrevented)
      console.log(`Ignored action: ${this.button} for gtin: ${this.gtin}`);
  }

  @Prop({attribute: "gtin", mutable: true}) gtin: string = undefined;

  @Prop({attribute: "quantity", mutable: true}) quantity?: number = undefined;

  @Prop({attribute: "available", mutable: true}) available?: number = undefined;

  @Prop({attribute: "mode"}) mode?: string = CHIP_TYPE.SIMPLE;

  @Prop({attribute: "loader-type"}) loaderType?: string = SUPPORTED_LOADERS.bubblingSmall;

  @Prop({attribute: "threshold", mutable: true}) threshold?: number = 30;

  @Prop({attribute: "button", mutable: true}) button?: string = undefined;

  private stockManager: WebResolver = undefined;
  private productManager: WebResolver = undefined;

  @State() stock: typeof Stock = undefined;

  @State() expiry: Date = undefined;

  async componentWillLoad() {
    if (!this.host.isConnected)
      return;
    if (this.mode !== CHIP_TYPE.DETAIL || !!this.available)
      return;
    this.stockManager = await WebManagerService.getWebManager("StockManager");
    this.productManager = await WebManagerService.getWebManager("ProductManager");
    return await this.loadBatch();
  }

  async loadBatch(){
    if (this.mode !== CHIP_TYPE.DETAIL)
      return;
    const self = this;
    self.stockManager.getOne(this.gtin, true, (err, stock: typeof Stock) => {
      if (err) {
        console.log(`Could nor read batch information for ${self.gtin}. presuming empty. Getting product info...`);
        return self.productManager.getOne(this.gtin, true, (err, product) => {
          if (err){
            console.log(`Could not resolver product. does it exist?`);
            self.stock = new Stock(product);
          } else {
            self.stock = new Stock(product);
          }
        });
      }

      self.stock = new Stock(stock);
    });
  }

  private renderSimple(){
    return (
      <Host>
        <ion-chip outline>
          <ion-label class="ion-padding-horizontal">{this.gtin}</ion-label>
          {this.renderQuantity()}
        </ion-chip>
      </Host>
    )
  }

  private renderQuantity(){
    if (!this.quantity && this.quantity !== 0)
      return;
    return (
      <ion-badge class="ion-margin ion-padding-horizontal">{this.quantity}</ion-badge>
    )
  }

  private getColor(){
    if (!this.stock && !this.available)
      return `var(${FALLBACK_COLOR})`;
    return `var(${getSteppedColor(this.threshold, this.quantity, this.available? this.available : this.stock.getQuantity())})`
  }

  private renderButton(){
    if (!this.button)
      return;
    let props;
    switch (this.button){
      case AVAILABLE_BUTTONS.CONFIRM:
        props = {
          color: "success",
          iconName: "checkmark-circle-outline",
          disabled: this.available && this.available > 0
        };
        break;
      case AVAILABLE_BUTTONS.CANCEL:
        props = {
          color: "danger",
          iconName: "close-circle-outline",
          disabled: false
        };
        break;
      default:
        return;
    }

    return (
      <ion-button fill="clear" size="small" color={props.color} onClick={() => this.sendActionEvent()} disabled={props.disabled}>
        <ion-icon slot="icon-only" name={props.iconName}></ion-icon>
      </ion-button>
    )
  }

  private renderDetail(){
    return (
      <Host>
        <ion-chip outline style={{
          "--color-step": this.getColor()
        }}>
          <ion-label class="ion-padding-start">{this.gtin}</ion-label>
          {this.renderQuantity()}
          {this.renderButton()}
        </ion-chip>
      </Host>
    )
  }

  render() {
    if (!this.host.isConnected)
      return;
    switch(this.mode){
      case CHIP_TYPE.SIMPLE:
        return this.renderSimple();
      case CHIP_TYPE.DETAIL:
        return this.renderDetail();
    }
  }
}
