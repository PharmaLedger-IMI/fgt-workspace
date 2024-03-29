import {Component, Host, h, Element, Event, EventEmitter, Prop, Method} from '@stencil/core';
import {HostElement} from "../../decorators";
import wizard from '../../services/WizardService';
const {INPUT_FIELD_PREFIX} = wizard.Constants;

const breakpoints = ['xs','sm','md','lg', 'xl'];

@Component({
  tag: 'create-manage-view-layout',
  styleUrl: 'create-manage-view-layout.css',
  shadow: false,
})
export class CreateManageViewLayout {
  @HostElement() host: HTMLElement;

  @Element() element;

  @Event()
  createEvent: EventEmitter<{}>;

  @Event()
  goBackEvent: EventEmitter;

  @Prop({attribute: "is-create", mutable: true, reflect: true}) isCreate: boolean = true;
  @Prop({attribute: "break-point"}) breakpoint: string = "lg-4-3";

  // strings
  @Prop({attribute: "create-title-string"}) createTitleString: string = "Create String"
  @Prop({attribute: "manage-title-string"}) manageTitleString: string = "Manage String"
  @Prop({attribute: "back-string"}) backString: string = "Back"
  @Prop({attribute: "create-string"}) createString:string = "Create";
  @Prop({attribute: "clear-string"}) clearString: string = "Clear"
  @Prop({attribute: "icon-name"}) iconName?: string = "grid"

  async componentDidRender(){
    this.updateSlotsOnIsCreateChange(this.isCreate);
  }

  private parseBreakPoint(){
    let breakpoint = this.breakpoint;
    if (!breakpoint || !breakpoint.match(`^(?:${breakpoints.join("|")})(?:-(?:[2-9]|1[0-2]?))+$`)){
      console.log(`Invalid breakpoint definition. reverting to default 'lg-4-3'`);
      breakpoint = 'lg-4-3'
    }
    let splitBreakpoint = breakpoint.split('-');
    return{
      break: splitBreakpoint.shift(),
      sizes: splitBreakpoint.map(b => parseInt(b))
    }
  }

  private generateSizeProps(reverse = false){
    const props = {};
    const parsedBreakpoint = Object.assign({}, this.parseBreakPoint());
    let position;
    breakpoints.every((b,i) => {
      if (b !== parsedBreakpoint.break && !position)
        return true;
      if (!position)
        position = i;
      const bp = parsedBreakpoint.sizes.shift();
      if (!bp)
        return false;
      props[`size-${breakpoints[i]}`] = '' + (reverse ? 12 - bp : bp);
    });
    return props;
  }


  private goBack(evt){
    evt.preventDefault();
    evt.stopImmediatePropagation();
    this.goBackEvent.emit();
  }

  private create(evt){
    evt.preventDefault();
    evt.stopImmediatePropagation();
    this.createEvent.emit(this.produceFormResult());
  }

  private reset(evt?){
    if (evt){
      evt.preventDefault();
      evt.stopImmediatePropagation();
    }
    const formInputs = this.getIonInputs();
    const notDisabledInputs = Array.prototype.filter.call(formInputs, (e) => !e.disabled);
    notDisabledInputs.forEach(input => input.value = '');
  }

  private produceFormResult(){
    const applicableFields = Array.prototype.filter.call(this.getIonInputs(), (input) => input.name.startsWith(INPUT_FIELD_PREFIX));
    return this.extractFormResults(applicableFields);
  }

  private extractFormResults(inputs){
    return Array.prototype.reduce.call(inputs, (accum, input) => {
      accum[input.name.substring(INPUT_FIELD_PREFIX.length)] = input.value;
      return accum;
    }, {});
  }

  private getIonInputs(){
    return this.element.querySelector('form').querySelectorAll('ion-input, ion-textarea, ion-range, ion-checkbox, ion-radio, ion-select, managed-stock-product-input');
  }

  private getHeader(){
    return [
      <div class="flex ion-align-items-center">
        <ion-icon name={this.iconName} size="large" color="secondary"></ion-icon>
        <ion-label class="ion-text-uppercase ion-padding-start" color="secondary">
          {this.isCreate ? this.createTitleString : this.manageTitleString}
        </ion-label>
      </div>,
      <ion-row class="ion-align-items-center">
        <ion-button color="secondary" fill="clear" class="ion-margin-start" onClick={this.goBack.bind(this)}>
          <ion-icon slot="start" name="return-up-back" class="ion-margin-end"></ion-icon>
          {this.backString}
        </ion-button>
      </ion-row>
    ]
  }

  private getCreateToolbar(){
    return [
      <ion-button type="reset" color="medium" fill="clear" class="ion-margin-start">
        {this.clearString}
      </ion-button>,
      <ion-button type="submit" color="secondary" class="ion-margin-start">
        {this.createString}
        <ion-icon slot="end" name="add-circle" class="ion-margin-start"></ion-icon>
      </ion-button>
    ]
  }

  private getCreate(){
    const self =  this;
    const getCreateContent = function(){
      return [
        <slot name="create">This is the default create content</slot>,
        <div class="ion-text-end ion-padding-vertical ion-margin-top">
          {...self.getCreateToolbar()}
        </div>
      ]
    }
    return (
      <form onSubmit={(e) => this.create(e)} onReset={(e) => this.reset(e)}>
        <div>
          {...getCreateContent()}
        </div>
      </form>
    )
  }

  private updateSlotsOnIsCreateChange(newVal){
    if (typeof newVal !== 'boolean')
      return;
    const selector = newVal ? 'div[slot="create"]' : 'div[slot="postcreate"], div[slot="manage"]';
    const slots = this.element.querySelectorAll(selector);
    if (slots)
      slots.forEach(s => s.hidden = false);
    if (newVal)
      this.reset()
  }

  @Method()
  async getInput(name: string){
    const inputEl = this.element.querySelector(`form input[name="${INPUT_FIELD_PREFIX}${name}"]`) || this.element.querySelector(`input[name="${INPUT_FIELD_PREFIX}${name}"]`);
    return inputEl.closest('ion-input');
  }

  @Method()
  async clear(){
    const clearButtonEl = Array.prototype.find.call(this.element.querySelectorAll(`form ion-button`), (b) => !!b.shadowRoot.querySelector('button[type="reset"]'));
    clearButtonEl.click();
  }

  private getManageContent(){

    const getPostCreateContent = function(){
      return <slot name="postcreate">This is the default post create content</slot>;
    }

    const getManageContent = function(){
      return <slot name="manage">This is a default manage content</slot>;
    }

    return [
      <ion-grid>
        <ion-row>
          <ion-col size="12" {...this.generateSizeProps()}>
            <div>
              {getPostCreateContent()}
            </div>
          </ion-col>
          <ion-col size="12" {...this.generateSizeProps(true)}>
            <div>
              {getManageContent()}
            </div>
          </ion-col>
        </ion-row>
      </ion-grid>
    ]
  }

  private getContent(){
    if (this.isCreate)
      return this.getCreate();
    return this.getManageContent();
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
        <ion-card class="ion-padding">
          {this.getContent()}
        </ion-card>
      </Host>
    )
  }
}
