import {Component, Host, h, Prop} from '@stencil/core';

import wizard from '../../services/WizardService';
const {BatchStatus, ShipmentStatus} = wizard.Model;


@Component({
  tag: 'status-badge',
  styleUrl: 'status-badge.css',
  shadow: false,
})
export class StatusBadge {

  @Prop({attribute: 'status'}) status: string = undefined;

  private getClassByStatus(){
    switch(this.status){
      case BatchStatus.COMMISSIONED:
      case ShipmentStatus.CREATED:
      case ShipmentStatus.ACKNOWLEDGED:
      case ShipmentStatus.PICKUP:
        return 'success';
      case BatchStatus.QUARENTINED:
      case ShipmentStatus.ON_HOLD:
        return 'warning';
      case BatchStatus.RECALL:
      case ShipmentStatus.REJECTED:
        return 'danger';
      default:
        return 'secondary';
    }
  }

  render() {
    if (!this.status)
      return;
    return (
      <Host>
        <ion-badge class={`ion-padding-horizontal ion-color${this.getClassByStatus()}`}>{this.status}</ion-badge>
      </Host>
    );
  }

}
