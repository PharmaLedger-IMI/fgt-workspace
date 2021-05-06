import {Component, Host, h, Prop, Element, State} from '@stencil/core';
import {HostElement} from "../../decorators";
import {WebManagerService, WebResolver} from "../../services/WebManagerService";
import {SUPPORTED_LOADERS} from "../multi-spinner/supported-loader";
import {getSteppedColor, FALLBACK_COLOR} from "../../utils/colorUtils";

// @ts-ignore
const Stock = require('wizard').Model.Stock;

const CHIP_TYPE = {
  SIMPLE: "simple",
  DETAIL: "detail"
}

@Component({
  tag: 'managed-orderline-stock-chip',
  styleUrl: 'managed-orderline-stock-chip.css',
  shadow: false,
})
export class ManagedOrderlineStockChip {

  @HostElement() host: HTMLElement;

  @Element() element;

  @Prop({attribute: "gtin", mutable: true}) gtin: string = undefined;

  @Prop({attribute: "quantity", mutable: true}) quantity?: number = undefined;

  @Prop({attribute: "mode"}) mode?: string = CHIP_TYPE.SIMPLE;

  @Prop({attribute: "loader-type"}) loaderType?: string = SUPPORTED_LOADERS.bubblingSmall;

  @Prop({attribute: "threshold", mutable: true}) threshold?: number = 30;

  private stockManager: WebResolver = undefined;

  @State() stock: typeof Stock = undefined;

  @State() expiry: Date = undefined;

  async componentWillLoad() {
    if (!this.host.isConnected)
      return;
    if (this.mode !== CHIP_TYPE.DETAIL)
      return;
    this.stockManager = await WebManagerService.getWebManager("StockManager");
    return await this.loadBatch();
  }

  async loadBatch(){
    if (this.mode !== CHIP_TYPE.DETAIL)
      return;
    const self = this;
    self.stockManager.getOne(this.gtin, true, (err, stock: typeof Stock) => {
      if (err)
        return console.log(`Could nor read batch information for ${self.gtin}`);
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
    if (!this.stock)
      return `var(${FALLBACK_COLOR})`;
    return `var(${getSteppedColor(this.threshold, this.quantity, this.stock.getQuantity())})`
  }

  private renderDetail(){
    return (
      <Host>
        <ion-chip outline style={{
          "--color-step": this.getColor()
        }}>
          <ion-label class="ion-padding-start">{this.gtin}</ion-label>
          {this.renderQuantity()}
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
