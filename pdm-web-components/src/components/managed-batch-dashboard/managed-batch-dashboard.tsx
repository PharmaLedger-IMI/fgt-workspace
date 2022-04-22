import {Component, Host, h, Element, Event, EventEmitter, Prop, State, Watch, Method} from '@stencil/core';
import {HostElement} from "../../decorators";
import wizard from '../../services/WizardService';
import {WebManager, WebManagerService} from "../../services/WebManagerService";
import {getBarCodePopOver} from "../../utils/popOverUtils";
import CreateManageView from "../create-manage-view-layout/CreateManageView";

const {generateBatchNumber} = wizard.Model.utils;
const {Batch, BatchStatus} = wizard.Model;

@Component({
  tag: 'managed-batch-dashboard',
  styleUrl: 'managed-batch-dashboard.css',
  shadow: false
})
export class ManagedBatchDashboard implements CreateManageView{

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

  /**
   * Through this event back navigation requests are made
   */
  @Event({
    eventName: 'ssapp-back-navigate',
    bubbles: true,
    composed: true,
    cancelable: true,
  })
  sendNavigateBack: EventEmitter;

  /**
   * Through this event action requests are made
   */
  @Event({
    eventName: 'ssapp-action',
    bubbles: true,
    composed: true,
    cancelable: true,
  })
  sendAction: EventEmitter;

  private sendError(message: string, err?: object){
    const event = this.sendErrorEvent.emit(message);
    if (!event.defaultPrevented || err)
      console.log(`Batch Component: ${message}`, err);
  }

  private navigateToTab(tab: string,  props: any){
    const event = this.sendNavigateTab.emit({
      tab: tab,
      props: props
    });
    if (!event.defaultPrevented)
      console.log(`Tab Navigation request seems to have been ignored byt all components...`);
  }

  @Prop({attribute: "gtin-ref", mutable: true, reflect: true}) gtinRef?: string = undefined;

  @Prop({attribute: 'statuses', mutable: true, reflect: true}) statuses: any;

  // strings
  @Prop({attribute: "create-title-string"}) titleString: string = "Create Batch for"
  @Prop({attribute: "manage-title-string"}) manageString: string = "Manage Batch"
  @Prop({attribute: "back-string"}) backString: string = "Back to Product"
  @Prop({attribute: "batch-number-string"}) batchNumberString: string = "Batch Number:"
  @Prop({attribute: "expiry-string"}) expiryString: string = "Expiry:"
  @Prop({attribute: "expiry-placeholder-string"}) expiryPlaceholderString: string = "Please define an expiry date..."
  @Prop({attribute: "serials-string"}) serialsString: string = "Serial Numbers:"
  @Prop({attribute: "serials-placeholder-string"}) serialsPlaceholderString: string = "Please insert comma separated serial numbers..."

  @Prop({attribute: "add-batch-string"}) addBatchString:string = "Add Batch";
  @Prop({attribute: "clear-string"}) clearString: string = "Clear"

  private batchManager: WebManager = undefined;

  @State() batch: typeof Batch = undefined;

  @State() serialsNumbers: string[] = undefined;

  private layoutComponent = undefined;

  private addSerialNumberInput!: HTMLInputElement;

  async componentWillLoad(){
    if (!this.host.isConnected)
      return;
    this.batchManager = await WebManagerService.getWebManager("BatchManager");
    await this.load();
  }

  private getGtinBatch(){
    if (!this.gtinRef || this.gtinRef.startsWith('@'))
      return;
    const split = this.gtinRef.split('-');
    return {
      gtin: split[0],
      batchNumber: split[1]
    }
  }

  async load(){
    let self = this;
    if (!self.batchManager)
      return;

    if (this.isCreate()){
      this.batch = undefined;
      this.serialsNumbers = undefined;
      return;
    }

    self.batchManager.getOne(self.gtinRef, true, (err, batch) => {
      if (err){
        self.sendError(`Could not get Batch ${self.getGtinBatch().batchNumber} for gtin ${self.getGtinBatch().gtin}`, err);
        return;
      }
      this.batch = batch;
      this.serialsNumbers = [...this.batch.serialNumbers]
    });
  }

  async update(evt){
    evt.preventDefault();
    evt.stopImmediatePropagation();
    const { status, extraInfo } = evt.detail;
    this.sendAction.emit({
      action: evt.detail,
      props:{
        batch: new Batch(this.batch),
        newStatus: status,
        extraInfo
      }
    });
  }

  async componentDidRender(){
    this.layoutComponent = this.layoutComponent || this.element.querySelector(`create-manage-view-layout`);
  }

  @Watch('gtinRef')
  @Method()
  async refresh(){
    await this.load();
  }

  @Method()
  async reset(){

  }

  navigateBack(evt){
    evt.preventDefault();
    evt.stopImmediatePropagation();
    const event = this.sendNavigateBack.emit();
    if (!event.defaultPrevented)
      console.log(`Tab Navigation request seems to have been ignored by all components...`);
  }

  create(evt){
    evt.preventDefault();
    evt.stopImmediatePropagation();
    const batch = new Batch(evt.detail);
    batch.serialNumbers = batch.serialNumbers.split(',');
    this.sendAction.emit({
      action: BatchStatus.COMMISSIONED,
      props: batch
    });
  }

  private async setRandomBatchNumber(){
    const el = await this.layoutComponent.getInput("batchNumber");
    el.setFocus();
    el.value = generateBatchNumber();
  }

  isCreate(){
    return !this.getGtinBatch() || !this.getGtinBatch().batchNumber;
  }

  private triggerSelect(evt){
    evt.preventDefault();
    evt.stopImmediatePropagation();
    console.log(`Selected ${evt.detail}`);
    const {gtin, batchNumber} = this.getGtinBatch();
    this.navigateToTab('tab-individual-product', { gtin: gtin, batchNumber: batchNumber,  serialNumber: evt.detail})
  }

  private getSerials(){
    if (!this.serialsNumbers)
      return;
    return (
      <pdm-item-organizer component-name="generic-chip"
                          component-props={JSON.stringify(this.serialsNumbers.map(s => ({
                            "chip-label": s
                          })))}
                          id-prop="chip-label"
                          is-ion-item={false}
                          display-count={25}
                          single-line="false"
                          onSelectEvent={this.triggerSelect.bind(this)}
      ></pdm-item-organizer>
    )
  }

  private addSerialNumbers() {
    let inputValue = this.addSerialNumberInput.value;
    this.serialsNumbers = [...this.serialsNumbers, ...inputValue.split(',')];
    this.addSerialNumberInput.value = '';
  }

  private getInputs(){
    const self = this;
    const isCreate = self.isCreate();

    const getRandomBatchNumberButton = function(){
      if (!isCreate)
        return;
      return (
        <ion-button size="large" fill="clear" slot="end" onClick={() => self.setRandomBatchNumber.call(self)}>
          <ion-icon slot="icon-only" name="shuffle"></ion-icon>
        </ion-button>
      )
    }

    const getBarCodeButton = function(){
      if (isCreate)
        return;
      return (
        <ion-button size="large" color="medium" fill="clear" slot="end" onClick={(evt) => getBarCodePopOver({
          type: "code128",
          size: "32",
          scale: "6",
          data: self.getGtinBatch().batchNumber
        }, evt)}>
          <ion-icon slot="icon-only" name="barcode"></ion-icon>
        </ion-button>
      )
    }

    const formatDate = function(d){
      return d.getFullYear() + '-' + ("0"+(d.getMonth()+1)).slice(-2) + '-' + ("0" + d.getDate()).slice(-2);
    }

    const getAddSerialsButton = function(){
      if (self.isCreate())
        return;
      return (
        <ion-button size="large" fill="clear" slot="end" onClick={() => self.addSerialNumbers()}>
          <ion-icon slot="icon-only" name="add-circle"></ion-icon>
        </ion-button>
      )
    }

    return [
      <ion-item class="ion-margin-top">
        <ion-label position="floating">{self.batchNumberString}</ion-label>
        <ion-input name="input-batchNumber" required={true} maxlength={30} disabled={!isCreate} value={isCreate ? '' : (self.batch ? self.batch.batchNumber : '')}></ion-input>
        {isCreate ? getRandomBatchNumberButton() : getBarCodeButton()}
      </ion-item>,
      <ion-item>
        <ion-label position="floating">{self.expiryString}</ion-label>
        <ion-input type="date" name="input-expiry" min={formatDate(new Date())} required={true}
                   disabled={!isCreate} placeholder={self.expiryPlaceholderString}
                   value={isCreate ? '' : (self.batch ? formatDate(new Date(self.batch.expiry)) : '')}></ion-input>
      </ion-item>,
      <ion-item>
        <ion-label position="floating">{self.serialsString}</ion-label>
        <ion-input name="input-serialNumbers" required={false} pattern="^[\d,]+$"
                   placeholder={self.serialsPlaceholderString}
                   ref={(el) => this.addSerialNumberInput = el as HTMLInputElement}
        ></ion-input>
        {getAddSerialsButton()}
      </ion-item>
    ]
  }

  getCreate(){
    if (!this.isCreate())
      return
    return this.getInputs();
  }

  getManage() {
    if (this.isCreate())
      return
    const self = this;
    const getStatus = function(){
      if (self.batch && self.batch.batchStatus)
        return (<status-updater current-state={JSON.stringify(self.batch.batchStatus)}
                                state-json={JSON.stringify(self.statuses)}
                                onStatusUpdateEvent={self.update.bind(self)}></status-updater>);
      return (<multi-spinner></multi-spinner>);
    }

    return (
      <ion-row>
        <ion-col size="12" size-lg="5">
          {this.getSerials()}
        </ion-col>
        <ion-col size="12" size-lg="7">
          {getStatus()}
        </ion-col>
      </ion-row>
    );
  }

  getPostCreate() {
    if (this.isCreate())
      return
    return this.getInputs();
  }

  getView() {
  }

  render() {
    if (!this.host.isConnected)
      return;
    return (
      <Host>
        <create-manage-view-layout create-title-string={this.titleString}
                                   manage-title-string={this.manageString}
                                   back-string={this.backString}
                                   create-string={this.addBatchString}
                                   clear-string={this.clearString}
                                   icon-name="layers"
                                   break-point="xl-4"
                                   is-create={this.isCreate()}
                                   onGoBackEvent={(evt) => this.navigateBack(evt)}
                                   onCreateEvent={(evt) => this.create(evt)}>
          <div slot="create">
            {...(this.getCreate() || [])}
          </div>
          <div slot="postcreate">
            {...(this.getPostCreate() || [])}
          </div>
          <div slot="manage">
            {this.getManage()}
          </div>
          <div slot="view"></div>
        </create-manage-view-layout>
      </Host>
    );
  }
}
