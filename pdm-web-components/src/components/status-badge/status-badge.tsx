import { Component, Host, h } from '@stencil/core';

@Component({
  tag: 'status-badge',
  styleUrl: 'status-badge.css',
  shadow: true,
})
export class StatusBadge {

  render() {
    return (
      <Host>
        <slot></slot>
      </Host>
    );
  }

}
