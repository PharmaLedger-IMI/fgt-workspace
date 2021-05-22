import {Component, Host, h, Element, Prop, ComponentInterface} from '@stencil/core';
import {HostElement} from '../../decorators'
import {SUPPORTED_LOADERS} from './supported-loader'

@Component({
  tag: 'multi-spinner',
  styleUrl: 'multi-spinner.css',
  shadow: false,
})
export class MultiSpinner implements ComponentInterface {

  @HostElement() host: HTMLElement;

  @Element() element;

  @Prop({attribute: 'type', mutable: true}) type?: string = SUPPORTED_LOADERS.simple;

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

  private getBubblingLoader(){
    return (
      <div class="bubblingG">
	      <span id="bubblingG_1"></span>
        <span id="bubblingG_2"></span>
        <span id="bubblingG_3"></span>
      </div>
    )
  }

  private getBubblingSmallLoader(){
    return (
      <div class="ion-padding-horizontal bubblingS">
        <span id="bubblingS_1"></span>
        <span id="bubblingS_2"></span>
        <span id="bubblingS_3"></span>
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

  private getDotsLoader(){
    return (
      <div class="dotdotdot">
        <div class="bounce1"></div>
        <div class="bounce2"></div>
        <div class="bounce3"></div>
      </div>
    )
  }

  private getHalfCircleLoader(){
    return (
      <span class="ouro ouro2">
        <span class="left"><span class="anim"></span></span>
        <span class="right"><span class="anim"></span></span>
      </span>
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
      case SUPPORTED_LOADERS.circles:
        return this.getCircleLoader();
      case SUPPORTED_LOADERS.dots:
        return this.getDotsLoader();
      case SUPPORTED_LOADERS.halfCircle:
        return this.getHalfCircleLoader();
      case SUPPORTED_LOADERS.bubbling:
        return this.getBubblingLoader();
      case SUPPORTED_LOADERS.bubblingSmall:
        return this.getBubblingSmallLoader();
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
