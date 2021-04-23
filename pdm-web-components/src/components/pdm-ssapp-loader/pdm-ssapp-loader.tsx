import {Component, Host, h, Element, Prop, ComponentInterface, Listen, Method, State} from '@stencil/core';
import {HostElement} from '../../decorators'
import {EVENT_SSAPP_HAS_LOADED} from "../../constants/events";

@Component({
  tag: 'pdm-ssapp-loader',
  styleUrl: 'pdm-ssapp-loader.css',
  shadow: false,
})
export class PdmSsappLoader implements ComponentInterface {

  @HostElement() host: HTMLElement;

  @Element() element;

  @Prop() timeout?: number = -1;

  private isLoading: boolean = true;

  @State() progress?: number = undefined;

  @State() status?: string = undefined;

  componentDidRender() {
    const self = this;
    if (self.timeout !== -1)
      setTimeout(self.markAsLoaded, self.timeout);
  }

  @Listen(EVENT_SSAPP_HAS_LOADED, {
    target: "body",
    capture: true
  })
  @Method()
  private async markAsLoaded(evt){
    if (evt){
      evt.preventDefault();
      evt.stopImmediatePropagation();
    }
    this.isLoading = false;
  }

  render() {
    if (!this.isLoading)
      return;
    return (
      <Host>
        <div id="custom-overlay">
          <div class="flb">
            <div class="Aligner-item Aligner-item--top"></div>
            <div class="spinner">
              <div class="dot1"></div>
              <div class="dot2"></div>
            </div>
            <div class="Aligner-item Aligner-item--bottom"></div>
          </div>
        </div>
      </Host>
    );
  }
}
