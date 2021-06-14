import { Component, Host, h } from '@stencil/core';

@Component({
  tag: 'slide-in-board',
  styleUrl: 'slide-in-board.css',
  shadow: true,
})
export class SlideInBoard {

  render() {
    return (
      <Host>
        <slot></slot>
      </Host>
    );
  }

}
