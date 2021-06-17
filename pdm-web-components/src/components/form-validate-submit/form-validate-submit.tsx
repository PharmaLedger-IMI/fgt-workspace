import {Component, Host, h, Element, Event, EventEmitter, Prop, State, Watch} from '@stencil/core';
import {HostElement} from "../../decorators";
import {SUPPORTED_LOADERS} from "../multi-spinner/supported-loader";

const INPUT_SELECTOR = "ion-input ion-select ion-text-area ion-range ion-datetime";

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
  sendCreateAction: EventEmitter;

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

  private onSubmit(evt){
    evt.preventDefault();
    evt.stopImmediatePropagation();
    console.log(evt);
  }

  private getLoading(){
    return (
      <div class="flex ion-padding-horizontal ion-align-items-center ion-justify-content-center">
        <multi-spinner type={this.loaderType}></multi-spinner>
      </div>
    )
  }

  private getButtons(){
    if (!this.form)
      return;
    return (
      <div class="ion-text-end ion-padding-vertical ion-margin-top">
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
