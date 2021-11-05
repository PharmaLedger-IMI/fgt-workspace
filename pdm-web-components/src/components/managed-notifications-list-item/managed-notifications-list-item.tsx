import {Component, Host, h, Element, Prop, State, Watch, Method, Event, EventEmitter} from '@stencil/core';

import {WebManagerService, WebManager} from '../../services/WebManagerService';
import {HostElement} from '../../decorators'
import wizard from '../../services/WizardService';
import {SUPPORTED_LOADERS} from "../multi-spinner/supported-loader";
import {getBarCodePopOver} from "../../utils/popOverUtils";
import {ListItemLayout} from "../list-item-layout/list-item-layout";

const {Stock, Batch, IndividualProduct} = wizard.Model;

@Component({
  tag: 'managed-notifications-list-item',
  styleUrl: 'managed-notifications-list-item.css',
  shadow: false,
})
export class ManageNotificationListItem {

  @HostElement() host: HTMLElement;

  @Element() element;

  /**
   * Through this event errors are passed
   */
  @Event({
    eventName: 'ssapp-send-error',
    bubbles: true,
    composed: true,
    cancelable: true,
  })
  sendErrorEvent: EventEmitter;

  /**
   * Through this event navigation requests to tabs are made
   */
  @Event({
    eventName: 'ssapp-navigate-tab',
    bubbles: true,
    composed: true,
    cancelable: true,
  })
  sendNavigateTab: EventEmitter;

  @Event({
    eventName: 'fgt-track-request',
    bubbles: true,
    composed: true,
    cancelable: true,
  })
  trackRequestAction: EventEmitter;

  private sendError(message: string, err?: object){
    const event = this.sendErrorEvent.emit(message);
    if (!event.defaultPrevented || err)
      console.log(`Product Component: ${message}`, err);
  }

  private navigateToTab(tab: string,  props: any){
    const event = this.sendNavigateTab.emit({
      tab: tab,
      props: props
    });
    if (!event.defaultPrevented)
      console.log(`Tab Navigation request seems to have been ignored by all components...`);
  }

  @Prop() notificationID: string; 

  private notificationManager: WebManager = undefined;

  @State() senderID: string = undefined; 
  @State() subject: string = undefined; //--------------------------------------------------------
  @State() body: string = undefined; //--------------------------------------------------------

  async componentWillLoad() {
    if (!this.host.isConnected)
      return;
    this.notificationManager = await WebManagerService.getWebManager("NotificationManager");
    return await this.loadNotification();
  }

  async loadNotification(){
    let self = this;
    if (!self.notificationManager)
      return;
    self.notificationManager.getOne(self.notificationID, false, (err, record) => {
      if (err){
        self.sendError(`Could not get Product with key ${self.notificationID}`, err);
        return;
      }
      self.notificationID = record.notificationID; 
      self.senderID = record.senderId; 
      self.subject = record.subject; 
      self.body = record.body;
    });
  }

  @Watch('notificationID')
  @Method()
  async refresh(){
    await this.loadNotification();
  }

  addLabel(){
    const self = this;

    const getNotificationIDLabel = function(){
      if (!self.notificationID)
        return (<ion-skeleton-text animated></ion-skeleton-text>);
      return self.notificationID;
    }

    const getSenderIDLabel = function(){
      if (!self.senderID)
        return (<ion-skeleton-text animated></ion-skeleton-text>);
      return self.senderID;
    }

    const getSubjectLabel = function(){
      if (!self.subject)
        return (<ion-skeleton-text animated></ion-skeleton-text>);
      return self.subject;
    }

    return(
      <ion-label slot="label" color="secondary">
        {getNotificationIDLabel()}
        <span class="ion-padding-start">
          {/* <ion-badge>
            {getQuantityLabel()}
          </ion-badge> */}
        </span>
        <span class="ion-padding-start">{getSenderIDLabel()}</span>
        <span class="ion-padding-start">{getSubjectLabel()}</span>
      </ion-label>)
  }


  addButtons(){
    let self = this;
    if (!self.notificationID)
      return (<ion-skeleton-text animated></ion-skeleton-text>);

    const getButton = function(slot, color, icon, handler){
      return (
        <ion-button slot={slot} color={color} fill="clear" onClick={handler}>
          <ion-icon size="large" slot="icon-only" name={icon}></ion-icon>
        </ion-button>
      )
    }

    return [
      getButton("buttons", "medium", "eye", () => console.log('Message Viewed'))
    ]
  }

  render() {
    return (
      <Host>
        <list-item-layout>
          {this.addLabel()}
          {this.addButtons()}
        </list-item-layout>
      </Host>
    );
  }
}
