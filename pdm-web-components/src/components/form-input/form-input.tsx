import {Component, Host, h, Element, Prop,  Watch, Listen} from '@stencil/core';
import {HostElement} from "../../decorators";
import wizard from '../../services/WizardService';

const {Validators, Registry} = wizard.Model.Validations.Validators;
const {INPUT_FIELD_PREFIX} = wizard.Constants

@Component({
  tag: 'form-input',
  styleUrl: 'form-input.css',
  shadow: false,
})
export class FormInput {

  @HostElement() host: HTMLElement;

  @Element() element;

  @Prop({attribute: 'input', mutable: true}) input = undefined;

  @Prop({attribute: 'input-prefix'}) inputPrefix: string = INPUT_FIELD_PREFIX;

  @Prop({attribute: 'lines'}) lines: 'none' | 'inset' | 'full' | undefined = 'inset'
  @Prop({attribute: 'label-position'}) labelPosition: "fixed" | "floating" | "stacked" | undefined = 'floating';
  @Prop({attribute: 'class'}) cssClass: string | string[] = '';

  private baseEl: HTMLFormInputElement = undefined;
  private validators: {} = undefined;

  async componentWillLoad(){
    if (!this.host.isConnected)
      return;
  }

  async componentDidLoad(){
    this.baseEl = this.element.querySelector(`input[name="${this.getInputName()}"]`);
    this.bindInput(this.baseEl);
  }



  private bindValidators(){
    if (!this.input.validators && !this.input['subtype'])
      return;

    Object.keys(this.input.validators).forEach(key => {
      if (!(key in Validators) && key !== this.input['subtype'])
        return;
      this.validators = this.validators || {};
      this.validators[key] = new Validators[key](...this.validators[key].args, this.validators[key].error);
    })
  }

  private checkMessageTranslations(element){
    const validity = Object.assign()
  }

  private bindInput(element){
    const self = this;
    let validatorFunc = element.checkValidity;

    element.oninvalid = (e) => {
      console.log(`invalid event`, e);
      self.checkMessageTranslations(element);
    }

    const validator = function(){
      const isValid = validatorFunc.call(element);
      const errors = [];
      if (!isValid)
        errors.push(element.)

    }

    element.checkValidity = validator;
  }

  @Watch("input")
  update(newVal){
    console.log(newVal);
  }

  @Listen("onIonChange")
  async onChange(evt){
    console.log(evt);
  }

  @Listen("onIonBlur")
  async onBlur(evt){
    console.log(evt);
  }

  @Listen("onIonInput")
  async onInput(evt){
    console.log(evt);
  }

  private isReady(){
    return this.input && this.input.name;
  }

  private getInputName(){
    return `${this.inputPrefix}${this.input.name}`;
  }

  private renderInput(){
    const self = this;

    const getLabel = function(){
      if (!self.input || !self.input.name)
        return (<ion-skeleton-text style={{
          "width": "60%"
        }} animated></ion-skeleton-text>);
      return self.input.label;
    }

    const getInput = function(){
      if (!self.input || !self.input.name)
        return (<ion-skeleton-text style={{
          "width": "85%"
        }} animated></ion-skeleton-text>);
      const Tag = self.input.element;
      return (
        <Tag name={self.getInputName()} {...self.input.props}></Tag>
      )
    }

    return [
      <ion-label position={this.labelPosition}>
        {getLabel()}
      </ion-label>,
      getInput()
    ]
  }

  render() {
    if (!this.host.isConnected)
      return;
    return (
      <Host>
        <ion-item lines={this.lines}
                  class={typeof this.cssClass === 'string' ? this.cssClass : this.cssClass.join(' ')}>
          {...this.renderInput()}
        </ion-item>
      </Host>
    );
  }

}
