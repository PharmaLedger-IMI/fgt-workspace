import {Component, Host, h, Element, Prop, State, Watch, Method, Event, EventEmitter} from '@stencil/core';

import {WebManagerService, WebManager} from '../../services/WebManagerService';
import {HostElement} from '../../decorators'
import wizard from '../../services/WizardService';

const {Notification} = wizard.Model;

@Component({
  tag: 'managed-notifications-list-item',
  styleUrl: 'managed-notifications-list-item.css',
  shadow: false,
})
export class ManagedNotificationListItem {

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
      console.log(`Notification Component: ${message}`, err);
  }

  @Prop() notificationKey: string;

  private notificationManager: WebManager = undefined;

  @State() notification: typeof Notification = undefined;


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
    self.notificationManager.getOne(self.notificationKey, true, (err, notification) => {
      if (err){
        self.sendError(`Could not get Notification with key ${self.notificationKey}`, err);
        return;
      }

      self.notification = new Notification(notification);
    });
  }

  @Watch('notificationKey')
  @Method()
  async refresh(){
    await this.loadNotification();
  }

  addLabel(){
    const self = this;

    const getKeyLabel = function(){
      if (!self.notificationKey)
        return (<ion-skeleton-text animated></ion-skeleton-text>);
      return self.notificationKey;
    }

    const getSenderLabel = function(){
      if (!self.notification || !self.notification.senderId)
        return (<ion-skeleton-text animated></ion-skeleton-text>);
      return self.notification.senderId;
    }

    const getSubjectLabel = function(){
      if (!self.notification || !self.notification.subject)
        return (<ion-skeleton-text animated></ion-skeleton-text>);
      return self.notification.subject;
    }

    return(
      <ion-label slot="label" color="secondary">
        {getKeyLabel()}
        <span class="ion-padding-start">{getSenderLabel()}</span>
        <span class="ion-padding-start">{getSubjectLabel()}</span>
      </ion-label>)
  }




  addButtons(){
    let self = this;
    if (!self.notification)
      return (<ion-skeleton-text animated></ion-skeleton-text>);

    const getButton = function(slot, color, icon, handler){
      return (
        <ion-button slot={slot} color={color} fill="clear" onClick={handler}>
          <ion-icon size="large" slot="icon-only" name={icon}></ion-icon>
        </ion-button>
      )
    }

    return [
      getButton("buttons", "medium", "eye", () => console.log(self.notification.subject))
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
