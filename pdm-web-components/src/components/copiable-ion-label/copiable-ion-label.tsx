import { Component, Host, h } from '@stencil/core';

@Component({
  tag: 'copiable-ion-label',
  styleUrl: 'copiable-ion-label.css',
  shadow: true,
})
export class CopiableIonLabel {

  render() {
    return (
      <Host>
        <slot></slot>
      </Host>
    );
  }

}
