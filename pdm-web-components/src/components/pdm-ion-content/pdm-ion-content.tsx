import { Component, Host, h } from '@stencil/core';

@Component({
  tag: 'pdm-ion-content',
  styleUrl: 'pdm-ion-content.css',
  shadow: true,
})
export class PdmIonContent {

  render() {
    return (
      <Host>
        <slot></slot>
      </Host>
    );
  }

}
