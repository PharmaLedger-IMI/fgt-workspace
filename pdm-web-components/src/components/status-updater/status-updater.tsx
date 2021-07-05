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
  statusUpdateEvent: EventEmitter<string>;

  @Prop({attribute: "current-state", mutable: true, reflect: true}) currentState: string;

  @Prop({attribute: "state-json"}) statesJSON: string;

  @State() states;

  async componentWillLoad() {
    if (!this.host.isConnected)
      return;
    await this.updateStates(this.statesJSON);
  }

  @Watch('statesJSON')
  async updateStates(newStates){
    if (typeof newStates === 'string')
      try{
        this.states = JSON.parse(newStates)
      } catch (e){
        console.log(`Could not parse Status JSON` ,e);
      }
    else if (typeof newStates === 'object')
      this.states = {...newStates}
  }


  private handleStateClick(evt, state){
    evt.preventDefault();
    evt.stopImmediatePropagation();
    this.statusUpdateEvent.emit(state);
  }

  private renderState(state: string, passed: boolean, available: boolean, color?: string){
    const self = this;
    return (
      <ion-row class="ion-align-items-center ion-justify-content-center">
        <ion-button disabled={passed || !available}
                    color={passed ? "medium" : (color || ( available ? "primary" : "secondary"))}
                    size={passed ? "small" : (available ? "large" : "default")}
                    onClick={(evt) => self.handleStateClick(evt, state)}>
          <ion-label>
            {state}
          </ion-label>
        </ion-button>
      </ion-row>
    )
  }

  private renderStates(){
    const self = this;
    let currentIndex;
    return Object.keys(this.states).map((state, i) => {
      if (state === this.currentState)
        currentIndex = i;
      const passed = !currentIndex || currentIndex < i;
      const available = state === this.currentState || self.states[state].available;
      const color = available || !passed ? self.states[state].color : undefined;
      return self.renderState(state, passed, available, color);
    })
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
