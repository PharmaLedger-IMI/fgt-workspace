import {Component, Host, h, Element, Event, EventEmitter, Prop, State, Watch, Method} from '@stencil/core';
import {HostElement} from "../../decorators";
import wizard from '../../services/WizardService';
import {WebManager, WebManagerService} from "../../services/WebManagerService";
import {getBarCodePopOver} from "../../utils/popOverUtils";

const {generateBatchNumber} = wizard.Model.utils;
const Batch = wizard.Model.Batch;
// const {hasIonErrors} = wizard.Model.Validations;

@Component({
  tag: 'managed-batch',
  styleUrl: 'managed-batch.css',
  shadow: false
})
export class ManagedBatch {

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
   * Through this event action requests are made
   */
  @Event({
    eventName: 'ssapp-action',
    bubbles: true,
    composed: true,
    cancelable: true,
  })
  sendCreateAction: EventEmitter;

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

  // strings
  @Prop({attribute: "create-title-string"}) titleString: string = "Create Batch for"
  @Prop({attribute: "manage-title-string"}) manageString: string = "Manage Batch"
  @Prop({attribute: "back-string"}) backString: string = "Back to Product"
  @Prop({attribute: "batch-number-string"}) batchNumberString: string = "Batch Number:"
  @Prop({attribute: "expiry-string"}) expiryString: string = "Expiry:"
  @Prop({attribute: "serials-string"}) serialsString: string = "Serial Numbers:"
  @Prop({attribute: "serials-placeholder-string"}) serialsPlaceholderString: string = "Please insert comma separated serial numbers..."

  @Prop({attribute: "add-batch-string"}) addBatchString:string = "Add Batch";
  @Prop({attribute: "cancel-string"}) cancelString: string = "cancel"

  private batchManager: WebManager = undefined;

  @State() errors: any = {}

  @State() batch: typeof Batch = undefined;

  @State() serialsNumbers: string[] = undefined;

  async componentWillLoad(){
    if (!this.host.isConnected)
      return;
    this.batchManager = await WebManagerService.getWebManager("BatchManager");
    await this.loadBatch();
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

  async loadBatch(){
    let self = this;
    if (!self.batchManager)
      return;

    if (this.isCreate()){
      this.batch = undefined;
      this.serialsNumbers = undefined;
      return this.clearInputFields();
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

  @Watch('gtinRef')
  @Method()
  // @ts-ignore
  async refresh(newGtinRef, oldGtinRef){
    await this.loadBatch();
  }

  private navigateBack(){
    this.navigateToTab('tab-product', {gtin: this.getGtinBatch().gtin});
  }

  private getAllInputs(){
    return this.element.querySelectorAll(`input[name^="input-"]`);
  }

  private clearInputFields(){
    this.getAllInputs().forEach(input => {
      const ionEl = input.closest('ion-input') || input.closest('ion-datetime');
      if (ionEl)
        ionEl.value = '';
    });
  }

  private createBatch(){
    const trimInputToProp = function(el){
      return el.name.substring('input-'.length);
    }
    const batch = new Batch();
    const inputFields = this.getAllInputs();
    for (let prop in batch)
      if (batch.hasOwnProperty(prop)){
        const input = Array.prototype.filter.call(inputFields, el => prop === trimInputToProp(el));
        if (!input.length)
          continue;
        batch[prop] = input[0].value;
      }
    batch.serialNumbers = this.serialsNumbers;
    this.sendCreateAction.emit(batch);
  }

  private getHeader(){
    return [
      <div class="flex ion-align-items-center">
        <ion-icon name="layers" size="large" color="medium"></ion-icon>
        <ion-label class="ion-text-uppercase ion-padding-start" color="secondary">
          {(this.isCreate() ? this.titleString : this.manageString) + (this.getGtinBatch() ? ` for ${this.getGtinBatch().gtin}` : '')}
        </ion-label>
      </div>,
      <ion-row class="ion-align-items-center">
        <ion-button color="secondary" fill="clear" class="ion-margin-start" onClick={() => this.navigateBack()}>
          <ion-icon slot="start" name="return-up-back" class="ion-margin-end"></ion-icon>
          {this.backString}
        </ion-button>
      </ion-row>
    ]
  }

  private getCreateButtons(){
    return [
      <ion-button color="medium" fill="clear" class="ion-margin-start" onClick={() => this.navigateBack()}>
        {this.cancelString}
      </ion-button>,
      <ion-button color="secondary" class="ion-margin-start" onClick={() => this.createBatch()}>
        {this.addBatchString}
        <ion-icon slot="end" name="add-circle" class="ion-margin-start"></ion-icon>
      </ion-button>
    ]
  }

  private getToolbar(){
    if (this.isCreate())
      return (
        <div class="ion-text-end ion-padding-vertical ion-margin-top">
          {this.getCreateButtons()}
        </div>
      )
  }

  private setRandomBatchNumber(){
    const el = this.element.querySelector(`input[name="input-batchNumber"]`).closest('ion-input');
    el.setFocus();
    el.value = generateBatchNumber();
  }

  private isCreate(){
    return !this.getGtinBatch() || !this.getGtinBatch().batchNumber;
  }

  private parseSerialNumbers(){
    const serialsEl = this.element.querySelector('input[name="input-serials"]').closest('ion-input');
    const value = serialsEl.value;
    if (!value.match(/[\d,]+/g))
      return console.log(`invalid/empty serials`)
    const serials = serialsEl.value.split(',');
    if (!this.serialsNumbers)
      this.serialsNumbers = [];
    this.serialsNumbers = [...serials, ...this.serialsNumbers];
    serialsEl.value = '';
  }

  private getBatchDetails(){
    const self = this;
    const isCreate = this.isCreate();

    const getFields = function(){

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

      const getSerialsInput = function(){
        return (
          <ion-item class="ion-margin-bottom">
            <ion-label position="floating">{self.serialsString}</ion-label>
            <ion-input name="input-serials" required={true}
                          placeholder={self.serialsPlaceholderString}
                          ></ion-input>
            <ion-button size="large" fill="clear" slot="end" onClick={() => self.parseSerialNumbers()}>
              <ion-icon slot="icon-only" name="add-circle"></ion-icon>
            </ion-button>
          </ion-item>
        )
      }

      const formatDate = function(d){
        return d.getFullYear() + '-' + ("0"+(d.getMonth()+1)).slice(-2) + '-' + ("0" + d.getDate()).slice(-2);
      }

      return [
        <ion-item class="ion-margin-vertical">
          <ion-label position="floating">{self.batchNumberString}</ion-label>
          <ion-input name="input-batchNumber" required={true} maxlength={30} disabled={!isCreate} value={isCreate ? '' : (self.batch ? self.batch.batchNumber : '')}></ion-input>
          {isCreate ? getRandomBatchNumberButton() : getBarCodeButton()}
        </ion-item>,
        <ion-item>
          <ion-label position="floating">{self.expiryString}</ion-label>
          <ion-datetime name="input-expiry" display-format="MM/DD/YYYY" min={formatDate(new Date())} disabled={!isCreate}></ion-datetime>
        </ion-item>,
        getSerialsInput()
      ]
    }

    const getSerials = function(){
      if (!self.serialsNumbers)
        return;
      return self.serialsNumbers.map(s => <generic-chip chip-label={s}></generic-chip>)
    }

    const props = {}, props2 = {};

    if (!isCreate){
      props['size-lg'] = "6";
      props2['size-lg'] = "6";
      props['size-xl'] = "5";
      props2['size-xl'] = "7";
    }

    return [
      <ion-grid>
        <ion-row>
          <ion-col size="12" {...props}>
            {...getFields()}
          </ion-col>
          <ion-col size="12" {...props2}>
            {getSerials()}
          </ion-col>
        </ion-row>
      </ion-grid>
    ]
  }

  private getContent(){
    return (
      <ion-card class="ion-padding">
        {...this.getBatchDetails()}
        {this.getToolbar()}
      </ion-card>
    )
  }

  render() {
    if (!this.host.isConnected)
      return;
    return (
      <Host>
        <div class="ion-margin-bottom ion-padding-horizontal">
          <ion-row class="ion-align-items-center ion-justify-content-between">
            {...this.getHeader()}
          </ion-row>
        </div>
        {this.getContent()}
      </Host>
    );
  }
}
