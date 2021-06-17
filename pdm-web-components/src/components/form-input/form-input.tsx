import {Component, Host, h, Element, Prop, Watch, State} from '@stencil/core';
import {HostElement} from "../../decorators";
import {ValidationService} from '../../services/ValidationService'
const {Registry, INPUT_FIELD_PREFIX} = ValidationService;

const ERROR_CSS_CLASS = "form-input-invalid";

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
  @Prop({attribute: 'class-string'}) cssClassString: string | string[] = '';
  @Prop({attribute: 'enable-custom-validation'}) customValidation: boolean = false;

  @State() hasErrors: boolean = false;

  private ionEl = undefined;
  private baseEl: HTMLFormElement = undefined;
  private validators: {} = undefined;

  async componentWillLoad(){
    if (!this.host.isConnected)
      return;
  }

  async componentDidRender(){
    this.baseEl = this.element.querySelector(`input[name="${this.getInputName()}"]`);
    if (this.input)
      this.ionEl = this.element.querySelector(`${this.input.element}`);
    if (this.baseEl)
      this.bindInput(this.baseEl);
  }

  private createErrorMessage(invalids){
    return Object.keys(invalids).reduce((accum,i) => {
      if (!(i in this.input.validation))
        return accum;
      accum.push(this.input.validation[i].error)
      return accum;
    }, []).join('\n');
  }

  private checkMessageTranslations(customValidity){
    const invalids = Object.keys(customValidity).reduce((accum, key) => {
      if (customValidity[key]){
        // @ts-ignore
        accum = accum || {};
        accum[key] = customValidity[key];
      }
      return accum;
    }, undefined)
    if (invalids)
      return this.createErrorMessage(invalids);
    console.log(`Field is valid`);
  }

  /**
   * Instantiates the necessary custom validators (the ones with an 'args' param)
   * @param {HTMLFormInputElement} element
   * @private
   */
  private bindValidators(element){
    if (!this.input.validation && !element['subtype'])
      return console.log(`No custom validators defined for ${element.name}`);
    const neededValidators: Set<string> = new Set();
    if (element['subtype'])
      neededValidators.add(element.subtype);

    Object.keys(this.input.validation).reduce((accum, key) => {
      if (!(key in this.input.validation) && key !== element['subtype'])
        return accum;
      if (!this.input.validation[key].args) // validator is not meant to be executed. just has the custom error message
        return accum;
      accum.add(key);
      return accum;
    }, neededValidators).forEach(key => {
      this.validators = this.validators || {};
      try {
        this.validators[key] = new (Registry.getValidator(key))(this.input.validation[key].error);
        console.log(`New validator ${key} instanced and attached to ${element.name}`);
      } catch (e){
        console.log(`Could not retrieve instance of ${key} Validator on Field ${element.name}. skipping...`);
      }
    })
  }

  private performValidations(element, report = false){
    const self = this;
    this.hasErrors = !element.validity.valid;
    let customValidity = Registry.matchValidityState(element.validity);
    console.log(`Custom validity matching for ${element.name}: ${customValidity}`);

    const performCustomValidations = function(customValidity){
      return Object.keys(self.validators).reduce((accum, key) => {
        const error = self.validators[key].hasErrors(self.ionEl.value, ...self.input.validation[key].args);
        accum[key] = !!error;
        return accum;
      }, customValidity);
    }

    if (this.validators && this.customValidation){
      customValidity = performCustomValidations(customValidity);
      console.log(`Custom validity updated with custom validators for ${element.name}: ${customValidity}`);
    }

    const errors = this.checkMessageTranslations(customValidity);
    if (errors){
      console.log(`Errors found: ${errors}`);
      this.hasErrors = true;
      element.setCustomValidity(errors);
    }

    if (report)
      element.reportValidity();
    return this.hasErrors;
  }

  private bindInput(element){
    const self = this;
    if (this.customValidation)
      self.bindValidators(element);
    element.oninvalid = self.onInvalid.bind(self);
    element.onvalid = (e) => console.log('VALID:', e);
  }

  @Watch("input")
  update(newVal){
    console.log(newVal);
  }

  private onChange(evt){
    this.input.props.value = evt.detail.value;
    //this.performValidations(evt.target.querySelector('input'), false);
  }

  private onInput(evt){
    console.log("input", evt);
    this.hasErrors = false;
    this.baseEl.setCustomValidity('');
  }

  private onInvalid(evt){
    console.log("INPUT INVALID", evt);
    this.performValidations(this.baseEl, false);
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
      if (!self.isReady())
        return (<ion-skeleton-text style={{
          "width": "60%"
        }} animated></ion-skeleton-text>);
      return self.input.label;
    }

    const getInput = function(){
      if (!self.isReady())
        return (<ion-skeleton-text style={{
          "width": "85%"
        }} animated></ion-skeleton-text>);
      const Tag = self.input.element;
      return (
        <Tag name={self.getInputName()} {...self.input.props}
             onIonChange={self.onChange.bind(self)}
             onIonInput={self.onInput.bind(self)}
        ></Tag>
      )
    }

    return [
      <ion-label position={this.labelPosition}>
        {getLabel()}
      </ion-label>,
      getInput()
    ]
  }

  private renderClassString(){
    return (typeof this.cssClassString === 'string' ? this.cssClassString : this.cssClassString.join(' ')) +
      this.hasErrors ? ` ${ERROR_CSS_CLASS}` : '';
  }

  render() {
    if (!this.host.isConnected)
      return;
    return (
      <Host>
        <ion-item lines={this.lines}
                  class={this.renderClassString()}>
          {...this.renderInput()}
        </ion-item>
      </Host>
    );
  }

}
