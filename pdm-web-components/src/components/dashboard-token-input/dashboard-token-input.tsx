import {Component, h, Event, EventEmitter} from '@stencil/core';

@Component({
  tag: 'dashboard-token-input',
  styleUrl: 'dashboard-token-input.css',
  shadow: false
})
export class DashboardTokenInput {

  private input;

  @Event({
    eventName: "fgt-api-password-submit"
  })
  passwordSubmit: EventEmitter;

  private handleClick(e){
    e.preventDefault();
    e.stopImmediatePropagation();
    const value = this.input.value;
    if (!value)
      return console.log("no value submitted")
    this.passwordSubmit.emit(value);
  }

  render() {
    return [
      <ion-item lines="full">
        <ion-label position="floating">
          Please insert your API access password
        </ion-label>
        <ion-input required={true} type="password" minlength={5} ref={(el) => this.input = el}></ion-input>
      </ion-item>,
      <ion-buttons>
        <ion-button onClick={this.handleClick.bind(this)}>Submit</ion-button>
      </ion-buttons>
    ];
  }

}
