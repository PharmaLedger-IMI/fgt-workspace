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
  @Prop({attribute: "past-string"}) pastString?:string = "Past Status:";

  @State() states;
  @State() _currentState;

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

  @Watch('currentState')
  async watchCurrentState(newStatus){
    if (typeof newStatus === 'string' && !newStatus.startsWith('@'))
      try{
        this._currentState = JSON.parse(newStatus);
      } catch (e){
        console.log(`Could not parse Status JSON` ,e);
        this._currentState = {log: []};
      }
    else if (typeof newStatus === 'object')
      this._currentState = {log: [], ...newStatus};
  }


  private handleStateClick(evt){
    evt.preventDefault();
    evt.stopImmediatePropagation();
    const { status } = evt.detail;
    if (this.states[this._currentState.status].paths.indexOf(status) === -1)
      return console.log("Status change not allowed");
    this.statusUpdateEvent.emit(evt.detail);
  }

  async showInfoPopup(popupOptions: any) {
    const alert: any = document.createElement('ion-alert');
    alert.header = popupOptions.header;
    alert.cssClass = popupOptions.cssClass || 'status-updater-alert';
    alert.message = popupOptions.message;
    alert.buttons = ['OK'];
    document.body.appendChild(alert);
    await alert.present();
  }

  private buildButtonWithAlert(current: boolean, label: string, color: string, disabled: boolean, popupOptions: any) {
    const self = this;
    return (
      <ion-row className="ion-align-items-center ion-justify-content-center">
        <ion-button
          class="history-status-btn" expand="full" color={color} size={current ? 'default' : 'small'}
          disabled={disabled} onClick={() => self.showInfoPopup(popupOptions)}
        >
          {label}
        </ion-button>
      </ion-row>
    )
  }

  private renderStates(){
    const self = this;
    if (!(this._currentState.status in this.states)){
      console.log(`Invalid state ${this._currentState.status}`, this.states);
      return [];
    }

    const statusHistoryButtons = [];
    self._currentState.log.reduce((accum, log, index) => {
      let extraInfo = undefined;
      const id = log.substring(0, log.indexOf(' ')).trim();
      const status = log.substring(log.lastIndexOf(' ') + 1).trim();
      const state = self.states[status];
      const extraInfoIndex = accum.hasOwnProperty(status) ? (accum[status] + 1) : 0;

      /**
       * 1. extraInfo property may not exist in the object
       * 2. extraInfo[status] may not exist in the object (e.g. created status)
       */
      if (self._currentState.hasOwnProperty('extraInfo')) {
        if (self._currentState.extraInfo.hasOwnProperty(status)) {
          extraInfo = self._currentState.extraInfo[status][extraInfoIndex]
        }
      }
      const current = (self._currentState.log.length - 1) === index;
      statusHistoryButtons.push(self.buildButtonWithAlert(current, state.label, current ? state.color : 'medium', !extraInfo,
        {
          header: `Status update to ${status.toUpperCase()} by ${id}`,
          message: extraInfo
        })
      )
      accum[status] = extraInfoIndex;
      return accum;
    }, {})

    const currentStatusFromState = this.states[this._currentState.status];
    const individualProperties = {} //temporarily, currently comes from the "translation"
    const allowedStates = Object.keys(this.states).reduce((acc, status )=> {
      if (currentStatusFromState.paths.indexOf(status) !== -1) {
        acc.push({status, ...self.states[status]})
        individualProperties[status] = {
          popupOptions: {
            message: `Please confirm Shipment status update from <strong>${this._currentState.status.toUpperCase()}</strong> to <strong>${status.toUpperCase()}</strong>`
          }
        }
      }
      return acc;
    }, []);

    const pastStatus = statusHistoryButtons.slice(0, statusHistoryButtons.length - 1)

    return ([
      pastStatus.length > 0 ? <ion-item-divider>{self.pastString}</ion-item-divider> : '',

      ...pastStatus,

      <ion-item-divider>{self.currentString}</ion-item-divider>,

      statusHistoryButtons[statusHistoryButtons.length - 1],

      <ion-item-divider className="ion-margin-bottom">{!!allowedStates.length ? self.updateString : self.noUpdateString}</ion-item-divider>,

      <status-updater-button
        shape="round" expand="block" size="large"
        available-options={JSON.stringify(allowedStates)}
        individual-properties={JSON.stringify(individualProperties)}
        onClickUpdaterButton={(evt) => self.handleStateClick(evt)}
      > </status-updater-button>
    ])
  }

  async componentWillLoad() {
    if (!this.host.isConnected)
      return;
    await this.updateStates(this.statesJSON);
    await this.watchCurrentState(this.currentState)
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
