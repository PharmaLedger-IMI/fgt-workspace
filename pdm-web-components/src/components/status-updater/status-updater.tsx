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

  private renderState(status, state: {action: string, label: string, color?:string, }, passed: boolean, available: boolean, isCurrent: boolean){
    const self = this;
    return (
      <ion-row class="ion-margin-bottom ion-align-items-center ion-justify-content-center">
        <status-updater-button
          label={available ? state.action : state.label}
          status={status}
          disabled={passed || !available || isCurrent}
          color={passed && !available ? "medium" : state.color}
          size={available ? "large" : (passed ? "small" : "default")}
          expand={isCurrent ? "full" : "block"}
          shape={isCurrent ? undefined : "round"}
          onClickUpdaterButton={(evt) => self.handleStateClick(evt)}>
        </status-updater-button>
      </ion-row>
    )
  }

  private renderStates(){
    const result = [];
    if (!(this.currentState in this.states)){
      console.log(`Invalid state ${this.currentState}`, this.states);
      return result;
    }

    const self = this;
    const currentState = this.states[this.currentState];
    const allowedStates = Object.keys(this.states).filter(state => currentState.paths.indexOf(state) !== -1);

    result.push(
      <ion-item-divider className="ion-margin-bottom">
        {self.currentString}
      </ion-item-divider>
    )

    result.push(self.renderState(self.currentState, currentState, false, false, true))

    result.push(
      <ion-item-divider className="ion-margin-bottom">
        {!!allowedStates.length ? self.updateString : self.noUpdateString}
      </ion-item-divider>
    )
    result.push(...allowedStates.map((state) => {
      return self.renderState(state, self.states[state],false, true, false);
    }));
    return result;
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
