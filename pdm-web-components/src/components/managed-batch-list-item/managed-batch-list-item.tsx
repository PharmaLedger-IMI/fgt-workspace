import {Component, Host, h, Element, Prop, State, Watch, Method, Event, EventEmitter} from '@stencil/core';

import {WebManager, WebManagerService} from '../../services/WebManagerService';
import {HostElement} from '../../decorators'
import wizard from '../../services/WizardService';
import {SUPPORTED_LOADERS} from "../multi-spinner/supported-loader";
import {getBarCodePopOver} from "../../utils/popOverUtils";
import {ListItemLayout} from "../list-item-layout/list-item-layout";

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
      this.batch = new Batch(batch);
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

  private triggerSelect(evt){
    evt.preventDefault();
    evt.stopImmediatePropagation();
    console.log(`Selected ${evt.detail}`);
    const {gtin, batchNumber} = this.getGtinAndBatchNumber();
    this.navigateToTab('tab-individual-product', {
      gtin: gtin,
      batchNumber: batchNumber,
      serialNumber: evt.detail
    })
  }

  addLabel(){
    const self = this;

    const getBatchNumberLabel = function(){
      const batchNumber = self.getGtinAndBatchNumber().batchNumber;
      if (!self.gtinBatch)
        return (<ion-skeleton-text animated></ion-skeleton-text>)
      return batchNumber
    }

    const getExpiryLabel = function(){
      if (!self.batch || !self.batch.expiry)
        return (<ion-skeleton-text animated></ion-skeleton-text>)
      return self.batch.expiry
    }

    return(
      <ion-label slot="label" color="secondary">
        {getBatchNumberLabel()}
        <span class="ion-padding-start">{getExpiryLabel()}</span>
      </ion-label>)
  }

  addSerialsNumbers(){
    if (!this.serialNumbers || !this.batch)
      return (<multi-spinner slot="content" type={SUPPORTED_LOADERS.bubblingSmall}></multi-spinner>);
    return(
      <pdm-item-organizer slot="content" component-name="generic-chip"
                          component-props={JSON.stringify(this.batch.serialNumbers.map(serial => ({
                            "chip-label": serial,
                            "class": "ion-margin-start"
                          })))}
                          id-prop="chip-label"
                          is-ion-item="false"
                          orientation={this.getOrientation()}
                          onSelectEvent={this.triggerSelect.bind(this)}></pdm-item-organizer>
    )
  }

  private getOrientation(){
    const layoutEl: ListItemLayout = this.element.querySelector('list-item-layout');
    return layoutEl ? layoutEl.orientation : 'end';

  }

  addButtons(){
    let self = this;

    const getButton = function(slot, color, icon, handler){
      if (!self.batch)
        return (<ion-skeleton-text animated></ion-skeleton-text>);
      return (
        <ion-button slot={slot} color={color} fill="clear" onClick={handler}>
          <ion-icon size="large" slot="icon-only" name={icon}></ion-icon>
        </ion-button>
      )
    }

    return [
      getButton("buttons", "medium", "barcode", (evt) => getBarCodePopOver({
        type: "gs1datamatrix",
        size: "32",
        scale: "6",
        data: self.batch.generate2DMatrixCode(self.getGtinAndBatchNumber().gtin)
      }, evt)),
      getButton("buttons", "medium", "eye", () => self.navigateToTab('tab-batch', {
        gtin: self.getGtinAndBatchNumber().gtin,
        batchNumber: self.getGtinAndBatchNumber().batchNumber
      }))
    ]
  }

  render() {
    return (
      <Host>
        <list-item-layout>
          {this.addLabel()}
          {this.addSerialsNumbers()}
          {this.addButtons()}
        </list-item-layout>
      </Host>
    );
  }
}
