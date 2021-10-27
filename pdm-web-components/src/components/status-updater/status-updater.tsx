import {Component, Host, h, Element, Event, EventEmitter, Prop, State, Watch} from '@stencil/core';
import {HostElement} from "../../decorators";

@Component({
  tag: 'status-updater',
  styleUrl: 'status-updater.css',
  shadow: false,
})
export class StatusUpdater {

  @HostElement() host: HTMLElement;

  @Element() element;

  /**
   * Through this event action requests are made
   */
  @Event()
  statusUpdateEvent: EventEmitter;

  @Prop({attribute: "current-state", mutable: true}) currentState: string;

  @Prop({attribute: "state-json"}) statesJSON: any;


  @Prop({attribute: "update-string"}) updateString?:string = "Available Operation:";
  @Prop({attribute: "no-update-string"}) noUpdateString?:string = "No operations available";
  @Prop({attribute: "current-string"}) currentString?:string = "Current Status:";

  @State() states;

  async componentWillLoad() {
    if (!this.host.isConnected)
      return;
    await this.updateStates(this.statesJSON);
  }

  @Watch('statesJSON')
  async updateStates(newStates){
    if (typeof newStates === 'string' && !newStates.startsWith('@'))
      try{
        this.states = JSON.parse(newStates);
      } catch (e){
        console.log(`Could not parse Status JSON` ,e);
      }
    else if (typeof newStates === 'object')
      this.states = {...newStates};
  }


  private handleStateClick(evt){
    evt.preventDefault();
    evt.stopImmediatePropagation();
    const { status } = evt.detail;
    if (this.states[this.currentState].paths.indexOf(status) === -1)
      return console.log("Status change not allowed");
    this.statusUpdateEvent.emit(evt.detail);
  }

  private renderStates(){
    const result = [];
    if (!(this.currentState in this.states)){
      console.log(`Invalid state ${this.currentState}`, this.states);
      return result;
    }

    const self = this;
    const currentState = this.states[this.currentState];
    const individualProperties = {} //temporarily, currently comes from the "translation"
    const allowedStates = Object.keys(this.states).reduce((acc, status )=> {
      if (currentState.paths.indexOf(status) !== -1) {
        acc.push({status, ...self.states[status]})
        individualProperties[status] = {
          popupOptions: {
            message: `Please confirm Shipment status update from <strong>${this.currentState.toUpperCase()}</strong> to <strong>${status.toUpperCase()}</strong>`
          }
        }
      }
      return acc;
    }, []);

    return ([
      <ion-item-divider className="ion-margin-bottom">{self.currentString}</ion-item-divider>,

      <ion-row className="ion-margin-bottom ion-align-items-center ion-justify-content-center">
        <ion-button expand="full" disabled="true" color={currentState.color} >
          {currentState.label}
        </ion-button>
      </ion-row>,

      <ion-item-divider className="ion-margin-bottom">{!!allowedStates.length ? self.updateString : self.noUpdateString}</ion-item-divider>,

      <status-updater-button
        shape="round" expand="block" size="large"
        available-options={JSON.stringify(allowedStates)}
        individual-properties={JSON.stringify(individualProperties)}
        onClickUpdaterButton={(evt) => self.handleStateClick(evt)}
      > </status-updater-button>
    ])
  }

  render() {
    if (!this.host.isConnected || !this.states)
      return;
    return (
      <Host>
        <ion-grid>
          {...this.renderStates()}
        </ion-grid>
      </Host>
    );
  }
}
