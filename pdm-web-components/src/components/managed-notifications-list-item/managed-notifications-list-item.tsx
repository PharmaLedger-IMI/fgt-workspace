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

  @Prop() notificationid: string;
  @Prop() isHeader: boolean;

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
    if (!self.notificationManager || self.isHeader)
      return;
    self.notificationManager.getOne(self.notificationid, true, (err, notification) => {
      if (err){
        self.sendError(`Could not get Notification with key ${self.notificationid}`, err);
        return;
      }

      self.notification = new Notification(notification);
    });
  }

  @Watch('notificationid')
  @Method()
  async refresh(){
    await this.loadNotification();
  }

  addContent(){
    const self = this;

    const getActionLabel = function(){

      if(self.isHeader){
        return (
          <ion-label slot="content" color="secondary">
            <ion-row>
              <ion-col col-12 col-sm align-self-end size-lg={6}>
                  <span class="ion-padding-end">
                    {"Message"}
                  </span>
              </ion-col>
            </ion-row>
          </ion-label>
        )
      }

      if (!self.notification.body.batch.batchStatus.log)
        return (<ion-skeleton-text animated></ion-skeleton-text>);

      const statusInfo = self.notification.body.batch.batchStatus.log.pop().split(' ');
      const finalMessage = `${new Date(Number(statusInfo[1])).toString().split(' ').splice(1,4).join(' ')} -
                            ${statusInfo[0].charAt(0).toUpperCase()}${statusInfo[0].slice(1)}
                            ${statusInfo[2]}
                            batch: ${self.notification.body.batch.batchNumber}
                            ${statusInfo.splice(3).join(' ')}`

      return finalMessage;
    }

  return(
    <ion-label slot="content" color="secondary">
      {getActionLabel()}
    </ion-label>)

  }

  addLabel(){
    const self = this;

    const getSenderLabel = function(){
      if(self.isHeader)
        return 'Sender';

      if (!self.notification || !self.notification.senderId)
        return (<ion-skeleton-text animated></ion-skeleton-text>);
      return self.notification.senderId;
    }

    const getSubjectLabel = function(){
      if(self.isHeader)
        return 'Subject';

      if (!self.notification || !self.notification.subject)
        return (<ion-skeleton-text animated></ion-skeleton-text>);
      return self.notification.subject;
    }

    if(this.isHeader)
      return(
        <ion-label slot="label" color="secondary">
          <ion-row>
            <ion-col col-12 col-sm align-self-end size-lg={3}>
              <span class="ion-padding-start">
              {getSenderLabel()}
              </span>
            </ion-col>
            <ion-col col-12 col-sm align-self-end size-lg={3}>
              <span class="ion-padding-start">
                {getSubjectLabel()}
              </span>
            </ion-col>
          </ion-row>
      </ion-label>
      )

    return(
      <ion-label slot="label" color="secondary">
        {getSenderLabel()}
        <span class="ion-padding-start">{getSubjectLabel()}</span>
      </ion-label>)
  }

  addButtons(){
    let self = this;

    if(self.isHeader){
      return (
          <div slot = "buttons">
            <ion-label color="secondary">
              {"Actions"}
            </ion-label>
          </div>
      )
    }

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
      getButton("buttons", "medium", "eye", () => console.log(self.notification.body))
    ]
  }

  render() {
    return (
      <Host>
        <list-item-layout>
          {this.addLabel()}
          {this.addContent()}
          {this.addButtons()}
        </list-item-layout>
      </Host>
    );
  }
}
