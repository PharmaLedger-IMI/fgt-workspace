import {Component, Host, h, Element, Prop, Method, Listen} from '@stencil/core';
import {HostElement} from "../../decorators";
import {getTrackingModal} from "../../utils/popOverUtils";


@Component({
  tag: 'tracking-pop-over',
  styleUrl: 'tracking-pop-over.css',
  shadow: false,
})
export class TrackingPopOver {

  @HostElement() host;

  @Element() element;

  @Prop({attribute: "tracking-title"}) trackingTitle?: string = "Supply Chain";

  private modal;

  async componentWillLoad() {
    if (!this.host.isConnected)
      return;
  }

  @Listen('fgt-track-response')
  async presentListener(evt){
    evt.preventDefault();
    evt.stopImmediatePropagation();
    await this.present(evt.detail);
  }


  @Method()
  async present(props){
    const self = this;
    this.modal = await getTrackingModal(props);
    this.modal.onDidDismiss(() => self.modal = undefined);
  }

  @Method()
  async dismiss(){
    if (this.modal)
      await this.modal.dismiss();
  }

  render() {
    return (
      <Host>
        <div id="tracking-pop-over-controller"></div>
      </Host>
    );
  }
}
