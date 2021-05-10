import {Component, Host, h, Prop, Element, State, Watch} from '@stencil/core';
import {HostElement} from "../../decorators";
import {WebManagerService, WebResolver} from "../../services/WebManagerService";
import {SUPPORTED_LOADERS} from "../multi-spinner/supported-loader";
import {calculateDiffInDays, getSteppedColor} from "../../utils/colorUtils";

// @ts-ignore
const Batch = require('wizard').Model.Batch;

const CHIP_TYPE = {
  SIMPLE: "simple",
  DETAIL: "detail"
}

@Component({
  tag: 'batch-chip',
  styleUrl: 'batch-chip.css',
  shadow: false,
})
export class BatchChip {

  @HostElement() host: HTMLElement;

  @Element() element;

  @Prop({attribute: "gtin-batch", mutable: true}) gtinBatch: string = undefined;

  @Prop({attribute: "quantity", mutable: true}) quantity?: number = undefined;

  @Prop({attribute: "mode"}) mode?: string = CHIP_TYPE.SIMPLE;

  @Prop({attribute: "loader-type"}) loaderType?: string = SUPPORTED_LOADERS.circles;

  @Prop({attribute: "expiry-threshold", mutable: true}) expiryThreshold?: number = 30;

  private batchResolver: WebResolver = undefined;

  @State() batch: typeof Batch = undefined;

  async componentWillLoad() {
    if (!this.host.isConnected)
      return;
    if (this.mode !== CHIP_TYPE.DETAIL)
      return;
    this.batchResolver = await WebManagerService.getWebManager("BatchManager");
    return await this.loadBatch();
  }

  @Watch('gtinBatch')
  async loadBatch(){
    if (!this.host.isConnected)
      return;
    if (this.mode !== CHIP_TYPE.DETAIL)
      return;
    this.batchResolver.getOne(this.gtinBatch, true, (err, batch: typeof Batch) => {
      if (err)
        return console.log(`Could nor read batch information for ${this.gtinBatch}`);
      this.batch = batch;
    });
  }

  private getBatchNumber(){
    return this.gtinBatch.split('-')[1];
  }

  private renderExpiryInfo(){
    if (!this.batch)
      return (
        <multi-spinner type={this.loaderType}></multi-spinner>
      )
    const self = this;
    const getDaysTillExpiryString = function(){
      const daysLeft = calculateDiffInDays(new Date(self.batch.expiry), new Date());
      if (daysLeft <= 0)
        return '-';
      return `${daysLeft}d`;
    }
    return (
      <ion-badge class="ion-margin ion-padding-horizontal" style={{
        "--color-step": `var(${getSteppedColor(this.expiryThreshold, this.batch.expiry, new Date())})`
      }}>{getDaysTillExpiryString()}</ion-badge>
    )
  }

  private renderSimple(){
    return (
      <Host>
        <ion-chip outline>
          <ion-label class="ion-padding-horizontal">{this.getBatchNumber()}</ion-label>
          {this.renderQuantity()}
        </ion-chip>
      </Host>
    )
  }

  private renderQuantity(){
    if (!this.quantity && this.quantity !== 0)
      return;
    return (
      <ion-badge class="ion-margin ion-padding-horizontal" color="success">{this.quantity}</ion-badge>
    )
  }

  private renderDetail(){
    return (
      <Host>
        <ion-chip outline color="primary">
          <ion-label class="ion-padding-start">{this.getBatchNumber()}</ion-label>
          {this.renderExpiryInfo()}
          {this.renderQuantity()}
        </ion-chip>
      </Host>
    )
  }

  render() {
    switch(this.mode){
      case CHIP_TYPE.SIMPLE:
        return this.renderSimple();
      case CHIP_TYPE.DETAIL:
        return this.renderDetail();
    }
  }
}
