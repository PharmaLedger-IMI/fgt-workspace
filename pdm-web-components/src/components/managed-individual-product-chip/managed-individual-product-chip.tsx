import {Component, Host, h, Prop, Element, State, Watch, Event, EventEmitter} from '@stencil/core';
import {HostElement} from "../../decorators";
import {getSteppedColor} from "../../utils/colorUtils";
import {ListItemLayout} from "../list-item-layout/list-item-layout";
import wizard from '../../services/WizardService';


// @ts-ignore
const {IndividualProduct} = wizard.Model;

@Component({
  tag: 'managed-individual-product-chip',
  styleUrl: 'managed-individual-product-chip.css',
  shadow: false,
})
export class ManagedIndividualProductChip {

  @HostElement() host: HTMLElement;

  @Element() element;

  @Event()
  selectEvent: EventEmitter<string>

  @Prop({attribute: "gtin", mutable: true}) gtin: string = undefined;

  @Prop({attribute: "batch-number", mutable: true}) batchNumber: string = undefined;

  @Prop({attribute: "serials", mutable: true}) serials: string = undefined;

  @Prop({attribute: "expiry", mutable: true}) expiry: string = undefined;

  @Prop({attribute: "expiry-threshold", mutable: true}) expiryThreshold?: number = 30;

  @State() individualProduct: typeof IndividualProduct = undefined;
  @State() serialNumbers: string[] = [];

  async componentWillLoad() {
    if (!this.host.isConnected)
      return;
    await this.loadSerials(this.serials);
  }

  @Watch('serials')
  async loadSerials(newSerials){
    if (!newSerials || newSerials.startsWith('@'))
      return;
    try {
      this.serialNumbers = JSON.parse(newSerials);
    } catch (e) {
      this.serialNumbers = [newSerials];
    }
  }

  private getOrientation(){
    const layoutEl: ListItemLayout = this.element.querySelector('list-item-layout');
    return layoutEl ? layoutEl.orientation : 'end';
  }

  private renderSerials(){
    return (
      <pdm-item-organizer slot="buttons" component-name="tracked-serial-chip"
                          component-props={JSON.stringify(this.serialNumbers.map(serial => {
                            return {"reference": `${this.gtin}-${this.batchNumber}-${serial}-${this.expiry}`};
                          } ))}
                          display-count="-1"
                          id-prop="chip-label"
                          is-ion-item="false"
                          orientation={this.getOrientation()}
                          more-label={this.serialNumbers.length}
                          onSelectEvent={this.triggerSelect.bind(this)}> </pdm-item-organizer>
    )
  }

  private renderBatchInfo(){
    const self = this;

    const props = {};


    props['style'] = {
      "--color-step": `var(${getSteppedColor(this.expiryThreshold, self.expiry, new Date())})`
    }

    return (
      <ion-badge slot="badges" {...props}>{this.batchNumber}</ion-badge>
    )
  }

  private triggerSelect(evt){
    evt.preventDefault();
    evt.stopImmediatePropagation();
    this.selectEvent.emit(`${this.gtin}-${this.batchNumber}`);
  }

  render() {
    return (
      <Host>
        <generic-chip chip-label={this.gtin} outline={true} color="secondary"
                      onSelectEvent={this.triggerSelect.bind(this)} hide-buttons="false">
          {this.renderBatchInfo()}
          {this.renderSerials()}
        </generic-chip>
      </Host>
    )
  }
}
