import {Component, Host, h, Prop, Element, State} from '@stencil/core';
import {HostElement} from "../../decorators";
import {WebManagerService} from "../../services/WebManagerService";
import {SUPPORTED_LOADERS} from "../multi-spinner/supported-loader";

// @ts-ignore
const Batch = require('wizard').Model.Batch;

const CHIP_TYPE = {
  SIMPLE: "simple",
  DETAIL: "detail"
}

const FALLBACK_COLOR = '--ion-color-primary;'

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

  private batchManager = undefined;

  @State() batch: typeof Batch = undefined;

  async componentWillLoad() {
    if (!this.host.isConnected)
      return;
    if (this.mode !== CHIP_TYPE.DETAIL)
      return;
    this.batchManager = await WebManagerService.getWebManager("BatchManager");
    return await this.loadBatch();
  }

  async loadBatch(){
    if (this.mode !== CHIP_TYPE.DETAIL)
      return;
    this.batchManager.getOne(this.gtinBatch, true, (err, batch: typeof Batch) => {
      if (err)
        return console.log(`Could nor read batch information for ${this.gtinBatch}`);
      this.batch = batch;
    });
  }

  private getBatchNumber(){
    return this.gtinBatch.split('-')[1];
  }

  private parseDates(threshold, currentVal, referenceVal){
    const dayDiff = this.calculateDiffInDays(new Date(currentVal), referenceVal)
    if (dayDiff >= threshold)
      return FALLBACK_COLOR;
    return this.calculateStep(dayDiff, threshold);
  }

  private calculateStep(currentVal, referenceVal){
    let colorStep = 100;
    if (currentVal < referenceVal){
      const exactVal = Math.floor(currentVal/referenceVal * 100);
      colorStep = Math.floor(exactVal/5) * 5;
      colorStep = colorStep < 0 ? 0 : colorStep;
    }
    return `--color-step-${colorStep}`;
  }

  private getSteppedColor(threshold, currentVal, referenceVal){
    if (referenceVal instanceof Date)
      return this.parseDates(threshold, currentVal, referenceVal);

    if (typeof currentVal !== typeof referenceVal){
      console.log(`invalid values received: ${currentVal} - ${referenceVal}`);
      return FALLBACK_COLOR;
    }

    const diff = referenceVal - currentVal;
    return this.calculateStep(diff, threshold);
  }

  private calculateDiffInDays(current, reference){
    const timeDiff = current.getTime() - reference.getTime();
    return Math.floor(timeDiff/ (1000 * 3600 * 24));
  }

  private renderExpiryInfo(){
    if (!this.batch)
      return (
        <multi-spinner type={this.loaderType}></multi-spinner>
      )
    const self = this;
    const getDaysTillExpiryString = function(){
      const daysLeft = self.calculateDiffInDays(new Date(self.batch.expiry), new Date());
      if (daysLeft <= 0)
        return '-';
      return `${daysLeft}d`;
    }
    const element = (
      <ion-badge class="ion-margin ion-padding-horizontal">{getDaysTillExpiryString()}</ion-badge>
    )
    this.element.style.setProperty('--color-step', `var(${this.getSteppedColor(this.expiryThreshold, this.batch.expiry, new Date())})`);
    return element;
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
