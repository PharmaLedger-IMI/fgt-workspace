import {Component, Host, h, Element, Prop, ComponentInterface} from '@stencil/core';
import {HostElement} from '../../decorators'

const SUPPORTED_LOADERS = {
  simple: 'simple',
  medical: 'medical',
  cube: "cube",
  circle: "circle"
}

@Component({
  tag: 'multi-spinner',
  styleUrl: 'multi-spinner.css',
  shadow: false,
})
export class MultiSpinner implements ComponentInterface {

  @HostElement() host: HTMLElement;

  @Element() element;

  @Prop() type?: string = 'simple'

  async componentWillLoad() {
    if (!this.host.isConnected)
      return;
  }

  private getSimpleLoader(){
    return (
      <div class="spinner-simple">
        <div class="dot1"></div>
        <div class="dot2"></div>
      </div>
    )
  }

  private getCubeLoader(){
    return (
      <div class="spinner-cube">
        <div class="cube1"></div>
        <div class="cube2"></div>
      </div>
    )
  }

  private getCircleLoader(){
    return (
      <div class="spinner-circle">
        <div class="double-bounce1"></div>
        <div class="double-bounce2"></div>
      </div>
    )
  }

  private getMedicalLoader(){
    return (
      <span class="try-force-gpu loader"></span>
    )
  }

  private getLoader(){
    switch (this.type){
      case SUPPORTED_LOADERS.simple:
        return this.getSimpleLoader();
      case SUPPORTED_LOADERS.medical:
        return this.getMedicalLoader();
      case SUPPORTED_LOADERS.cube:
        return this.getCubeLoader();
      case SUPPORTED_LOADERS.circle:
        return this.getCircleLoader();
      default:
        throw new Error(`Unsupported loader ${this.type}`)
    }
  }

  render() {
    return (
      <Host>
        {this.getLoader()}
      </Host>
    );
  }
}
