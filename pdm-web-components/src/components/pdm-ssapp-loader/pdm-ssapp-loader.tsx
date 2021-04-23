import {Component, Host, h, Element, Prop, ComponentInterface, Listen, Method, State} from '@stencil/core';
import {HostElement} from '../../decorators'

const SUPPORTED_LOADERS = {
  simple: 'simple',
  medical: 'medical'
}

@Component({
  tag: 'pdm-ssapp-loader',
  styleUrl: 'pdm-ssapp-loader.css',
  shadow: false,
})
export class PdmSsappLoader implements ComponentInterface {

  @HostElement() host: HTMLElement;

  @Element() element;

  @Prop() timeout?: number = -1;

  @Prop() loader?: string = 'simple'

  @State() isLoading: boolean = true;

  @State() progress?: number = undefined;

  @State() status?: string = undefined;

  async componentWillLoad() {
    if (!this.host.isConnected)
      return;
    const self = this;
    if (self.timeout !== -1)
      setTimeout(self.markAsLoaded, self.timeout);
  }

  @Listen('ssapp-has-loaded', {
    target: "body",
    capture: true
  })
  @Method()
  async markAsLoaded(evt){
    if (evt){
      evt.preventDefault();
      evt.stopImmediatePropagation();
    }
    this.isLoading = false;
  }

  @Listen('ssapp-update-status', {
    target: "body",
    capture: true
  })
  @Method()
  // @ts-ignore
  async updateStatus(evt){
    evt.preventDefault();
    evt.stopImmediatePropagation();
    this.status = evt.detail.status;
    this.progress = evt.detail.progress;
  }

  private getStatus(){
    if (!(this.status && this.status.length > 0))
      return;
    return (
      <ion-col size="12">
        <ion-item lines="none">
          <ion-label color="primary" class="ion-text-center">{this.status}</ion-label>
        </ion-item>
      </ion-col>
    )
  }

  private getProgress(){
    if (!(this.progress && this.progress > 0))
      return;
    return (
      <ion-col size="12">
        <ion-item>
          <ion-label color="secondary" class="ion-text-center" size="small">{this.progress}%</ion-label>
        </ion-item>
      </ion-col>
    )
  }

  private getLabels(){
    if (!(this.status || this.progress))
      return;
    return (
      <ion-grid class="status-grid">
        <ion-row class="justify-content-around">
          {this.getStatus()}
          {this.getProgress()}
        </ion-row>
      </ion-grid>
    )
  }

  private getSimpleLoader(){
    return (
      <div class="spinner">
        <div class="dot1"></div>
        <div class="dot2"></div>
      </div>
    )
  }

  private getLoader(){
    switch (this.loader){
      case SUPPORTED_LOADERS.simple:
        return this.getSimpleLoader();
    }
  }

  render() {
    if (!this.isLoading)
      return;
    return (
      <Host>
        <div id="custom-overlay">
          <div class="flb">
            <div class="Aligner-item Aligner-item--top"></div>
            {this.getLoader()}
            <div class="Aligner-item Aligner-item--bottom"></div>
            {this.getLabels()}
          </div>
        </div>
      </Host>
    );
  }
}
