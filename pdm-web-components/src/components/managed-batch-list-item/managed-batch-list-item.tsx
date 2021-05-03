import {Component, Host, h, Element, Prop, State, Watch, Method, Event, EventEmitter} from '@stencil/core';

import {WebManager, WebManagerService} from '../../services/WebManagerService';
import {HostElement} from '../../decorators'
import wizard from '../../services/WizardService';
import {EVENT_SEND_ERROR} from "../../constants/events";

const Batch = wizard.Model.Batch;

@Component({
  tag: 'managed-batch-list-item',
  styleUrl: 'managed-batch-list-item.css',
  shadow: false,
})
export class ManagedBatchListItem {

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

  private sendError(message: string, err?: object){
    const event = this.sendErrorEvent.emit(message);
    if (!event.defaultPrevented || err){
      console.log(`Batch Component: ${message}`, err);
    }
  }

  @Prop({attribute: 'gtin-batch'}) gtinBatch: string;

  private batchManager: WebManager = undefined;

  @State() batch: typeof Batch = undefined;

  @State() serialNumbers: number[] = undefined;

  async componentWillLoad() {
    if (!this.host.isConnected)
      return;
    this.batchManager = await WebManagerService.getWebManager("BatchManager");
    return await this.loadBatch();
  }

  async loadBatch(){
    let self = this;
    if (!self.batchManager)
      return;
    self.batchManager.getOne(this.gtinBatch, true, (err, batch) => {
      if (err){
        self.sendError(`Could not get Batch with code ${self.gtinBatch}`, err);
        return;
      }
      this.batch = batch;
      this.serialNumbers = batch.serialNumbers;
    });
  }

  @Watch('gtinBatch')
  @Method()
  async refresh(){
    await this.loadBatch();
  }

  private getGtinAndBatchNumber(){
    const props = this.gtinBatch.split('-');
    return {
      gtin: props[0],
      batchNumber: props[1]
    }
  }

  addBarCode(){
    const self = this;

    const getBarCode = function(){
      if (!self.batch || !self.batch.batchNumber)
        return (<ion-skeleton-text animated></ion-skeleton-text>);
      return (<barcode-generator class="ion-align-self-center" type="gs1datamatrix" size="16" scale="3" data={self.batch.batchNumber}></barcode-generator>);
    }

    return(
      <ion-thumbnail className="ion-align-self-center" slot="start">
        {getBarCode()}
      </ion-thumbnail>
    )
  }

  addLabel(){
    const self = this;

    const getBatchNumberLabel = function(){
      const batchNumber = self.getGtinAndBatchNumber().batchNumber;
      if (!self.gtinBatch)
        return (<h3><ion-skeleton-text animated></ion-skeleton-text> </h3>)
      return (<h3>{batchNumber}</h3>)
    }

    const getExpiryLabel = function(){
      if (!self.batch || !self.batch.expiry)
        return (<h5><ion-skeleton-text animated></ion-skeleton-text> </h5>)
      return (<h5>{self.batch.expiry}</h5>)
    }

    return(
      <ion-label className="ion-padding-horizontal ion-align-self-center">
        {getBatchNumberLabel()}
        {getExpiryLabel()}
      </ion-label>)
  }

  addSerialNumber(serial){
    return(
      <ion-chip outline color="primary">
        <ion-label className="ion-padding-horizontal">{serial}</ion-label>
      </ion-chip>
    )
  }

  addSerialsNumbers(){
    const serials = !! this.serialNumbers ? this.batch.serialNumbers.slice(0, 8).map(s => this.addSerialNumber(s)) : (<ion-skeleton-text animated></ion-skeleton-text>);
    return(
      <ion-grid className="ion-padding-horizontal">
        <ion-row>
          <ion-col size="12">
            {serials}
          </ion-col>
        </ion-row>
      </ion-grid>
    )
  }

  addButtons(){
    let self = this;
    const getButtons = function(){
      if (!self.batch)
        return (<ion-skeleton-text animated></ion-skeleton-text>)
      return (
        <ion-button slot="primary">
          <ion-icon name="file-tray-stacked-outline"></ion-icon>
        </ion-button>
      )
    }

    return(
      <ion-buttons className="ion-align-self-center ion-padding" slot="end">
        {getButtons()}
      </ion-buttons>
    )
  }

  render() {
    return (
      <Host>
        <ion-item className="main-item ion-align-self-center">
          {this.addBarCode()}
          {this.addLabel()}
          {this.addSerialsNumbers()}
          {this.addButtons()}
        </ion-item>
      </Host>
    );
  }
}
