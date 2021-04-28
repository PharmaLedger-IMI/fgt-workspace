import {Component, Host, h, Element, Prop, ComponentInterface, Listen, Method, State} from '@stencil/core';
import {HostElement} from '../../decorators'

@Component({
  tag: 'pdm-ssapp-loader',
  styleUrl: 'pdm-ssapp-loader.css',
  shadow: false,
})
export class PdmSsappLoader implements ComponentInterface {

  @HostElement() host: HTMLElement;

  @Element() element;

  @Prop() timeout?: number = 1000;

  @Prop() loader?: string = 'simple'

  @State() isLoading: boolean = true;

  @State() progress?: number = undefined;

  @State() status?: string = undefined;

  async componentWillLoad() {
    if (!this.host.isConnected)
      return;
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
    setTimeout(() => {
      this.isLoading = false;
    }, this.timeout)
  }

  @Listen('ssapp-update-status', {
    target: "body",
    capture: true
  })
  @Method()
  // @ts-ignore
  async updateStatus(evt){
    if (evt.prevendDefault)
      evt.preventDefault();
    if (evt.stopImmediatePropagation)
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
        <ion-item lines="none">
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

  private getLoader(){
    return (
      <multi-spinner type={this.loader}></multi-spinner>
    )
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
