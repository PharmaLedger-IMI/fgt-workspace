import {Component, Host, h, Prop, Element, State, Watch, Event, EventEmitter} from '@stencil/core';
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

  @Event()
  selectEvent: EventEmitter<string>

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
      <ion-badge class="ion-margin-start" style={{
        "--color-step": `var(${getSteppedColor(this.expiryThreshold, this.batch.expiry, new Date())})`
      }}>{getDaysTillExpiryString()}</ion-badge>
    )
  }

  private renderSimple(){
    const self=this;
    return (
      <Host>
        <generic-chip class="ion-margin-start" chip-label={this.getBatchNumber()} outline={true}
                      color="secondary" onSelectEvent={self.triggerSelect.bind(self)}
                      badges={() => [self.renderQuantity()]}>
        </generic-chip>
      </Host>
    )
  }

  private renderQuantity(){
    if (!this.quantity && this.quantity !== 0)
      return;
    return (
      <ion-badge class="ion-margin-start" color="tertiary">{this.quantity}</ion-badge>
    )
  }

  private triggerSelect(evt){
    evt.preventDefault();
    evt.stopImmediatePropagation();
    this.selectEvent.emit(this.gtinBatch)
  }

  private renderDetail(){
    const self = this;
    return (
      <Host>
        <generic-chip class="ion-margin-start" chip-label={this.getBatchNumber()} outline={true} color="secondary"
                      onSelectEvent={self.triggerSelect.bind(self)}
                      badges={() => [self.renderExpiryInfo(), self.renderQuantity()]}>
        </generic-chip>
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
