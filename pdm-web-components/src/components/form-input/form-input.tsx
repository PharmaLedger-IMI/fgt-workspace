import {Component, Host, h, Element, Event, EventEmitter, Prop, State, Watch} from '@stencil/core';
import {HostElement} from "../../decorators";
import wizard from '../../services/WizardService';

const {Validations} = wizard.Model;
const {INPUT_FIELD_PREFIX} = wizard.Constants

@Component({
  tag: 'form-input',
  styleUrl: 'form-input.css',
  shadow: false,
})
export class FormInput {

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
      console.log(`Product Component: ${message}`, err);
  }

  @Prop({attribute: 'input', mutable: true}) input?: {
    name: string,
    element: string,
    label: string,
    props: {type?: string, subtype?: string, value?: string, required?: boolean, children?: [], },
    validation?: {required?:{error: string}, },
    score: {any}
  } | undefined = undefined;

  @Prop({attribute: 'input-prefix'}) inputPrefix: string = INPUT_FIELD_PREFIX;

  @Prop({attribute: 'lines'}) lines: 'none' | 'inset' | 'full' | undefined = 'inset'
  @Prop({attribute: 'label-position'}) labelPosition: "fixed" | "floating" | "stacked" | undefined = 'floating';
  @Prop({attribute: 'class'}) cssClass: string | string[] = '';

  async componentWillLoad(){
    if (!this.host.isConnected)
      return;
  }

  @Watch("input")
  update(newVal){
    console.log(newVal);
  }

  private isReady(){
    return this.input && this.input.name;
  }

  private getInputName(){
    return `${this.inputPrefix}${this.input.name}`;
  }

  // @ts-ignore
  private getInput(){
    if (!this.isReady())
      return undefined;
    return this.element.querySelector(`${this.input.element}[name="${this.getInputName()}"]`)
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
        <Tag name={self.input.name} {...self.input.props}></Tag>
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
