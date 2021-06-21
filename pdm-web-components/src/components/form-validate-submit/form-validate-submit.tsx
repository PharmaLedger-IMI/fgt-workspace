import {Component, Host, h, Element, Event, EventEmitter, Prop, State, Watch} from '@stencil/core';
import {HostElement} from "../../decorators";
import {SUPPORTED_LOADERS} from "../multi-spinner/supported-loader";

const INPUT_SELECTOR = "'ion-input, ion-textarea, ion-range, ion-checkbox, ion-radio, ion-select, ion-datetime'";

@Component({
  tag: 'form-validate-submit',
  styleUrl: 'form-validate-submit.css',
  shadow: false,
})
export class FormValidateSubmit {

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
  sendAction: EventEmitter;

  @Prop({attribute: 'form-json'}) formJSON: string = '{}';
  @Prop({attribute: 'loader-type'}) loaderType: string = SUPPORTED_LOADERS.circles;
  @Prop({attribute: 'lines'}) lines: 'none' | 'inset' | 'full' | undefined = 'inset';
  @Prop({attribute: 'label-position'}) labelPosition: "fixed" | "floating" | "stacked" | undefined = 'floating';
  @Prop({attribute: 'enable-custom-validation'}) customValidation: boolean = false;

  @State() form: {
    prefix?: string,
    fields: [{
      name: string,
      element: string,
      label: string,
      props: {
        type?: string,
        value?: string
        ,
      }
    }, ]
  } = undefined;

  private formEl: HTMLFormElement = undefined;

  async componentWillLoad(){
    if (!this.host.isConnected)
      return;
  }

  async componentDidRender(){
    const self = this;
    this.formEl = this.element.querySelector('form');
    this.element.querySelectorAll('div.form-buttons ion-button').forEach(ionEl => {
      const button = ionEl.shadowRoot.querySelector('button')
      if (button.type === "submit")
        button.onclick = (evt) => self.onSubmit(evt, ionEl.getAttribute('name'));
    });
  }

  @Watch('formJSON')
  async updateForm(newVal){
    if (newVal.startsWith('@'))
      return;
    this.form = JSON.parse(newVal);
    console.log(this.form);
  }

  private onReset(evt){
    evt.preventDefault()
    evt.stopImmediatePropagation();
    this.element.querySelectorAll(INPUT_SELECTOR).forEach(input => input.value = '');
  }

  private onSubmit(evt, name?: string){
    evt.preventDefault();
    evt.stopImmediatePropagation();

    if (!name)
      name = this.element.querySelector('ion-button.primary-button').name;

    if (!this.formEl.checkValidity())
      return this.formEl.reportValidity();

    const output = {};
    this.form.fields.forEach(field => {
      output[field.name] = field.props.value;
    })

    console.log(`Form submitted. Result: `, output);
    this.sendAction.emit({
      action: name,
      form: output
    })
  }

  private getButtons(){
    if (!this.form)
      return;
    return (
      <div class="form-buttons ion-text-end ion-padding-vertical ion-margin-top">
        <slot name="buttons"></slot>
      </div>
    )
  }

  private getForm(){
    if (!this.form)
      return (<slot name="fields"></slot>);
    return this.form.fields.map(field => <form-input input={field} enable-custom-validation={this.customValidation}
                                                     prefix={this.form.prefix}
                                                     lines={this.lines}
                                                     label-position={this.labelPosition}></form-input>);
  }

  render() {
    return (
      <Host>
        <ion-card>
          <ion-card-header  class="ion-margin ion-padding-horizontal">
            <div>
              <slot name="header"></slot>
            </div>
          </ion-card-header>
          <ion-card-content>
            <form id="form-validate-submit" onSubmit={this.onSubmit.bind(this)} onReset={this.onReset.bind(this)}>
              {...this.getForm()}
              {this.getButtons()}
            </form>
          </ion-card-content>
        </ion-card>
      </Host>
    );
  }
}
