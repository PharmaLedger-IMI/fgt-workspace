import {Component, Host, h, Element, Prop, State, Watch, Method, Event, EventEmitter, Listen} from '@stencil/core';

import {WebManagerService, WebManager} from '../../services/WebManagerService';
import {HostElement} from '../../decorators'
import wizard from '../../services/WizardService';
import {calcBreakPoint} from "../../utils/utilFunctions";

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
  @State() showMessage = false;
  @State() currentBreakpoint = "xl";
  

  private message;


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

    if(!self.isHeader)
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

  @Listen('resize', { target: 'window' })
  async updateBreakPoint(){
    this.currentBreakpoint = calcBreakPoint();
    this.refresh();
  }

  addContent(){
    const self = this;

    const getActionLabel = function(){
      if(self.isHeader)
        return "Message";

      if (!self.notification.body.batch.batchStatus.log)
        return (<ion-skeleton-text animated></ion-skeleton-text>);

      const statusInfo = self.notification.body.batch.batchStatus.log.pop().split(' ');
      const finalMessage = `${new Date(Number(statusInfo[1])).toString().split(' ').splice(1,4).join(' ')} - 
                            ${statusInfo[0].charAt(0).toUpperCase()}${statusInfo[0].slice(1)} 
                            ${statusInfo[2]} 
                            batch: ${self.notification.body.batch.batchNumber} 
                            ${statusInfo.splice(3).join(' ')}`

      const getMessageButton = function(showMessage){
        if(showMessage)
          return (
            <ion-button slot="buttons" color="secondary" fill="clear" onClick={() => {
              self.showMessage = false;
              self.refresh();
            }}>
              <ion-icon size="large" slot="icon-only" name="caret-up-circle-outline"></ion-icon>
            </ion-button>
          )

        return (
          <ion-button slot="buttons" color="secondary" fill="clear" onClick={() => {
            self.showMessage = true;
            self.refresh();
          }}>
            <ion-icon size="large" slot="icon-only" name="caret-down-circle-outline"></ion-icon>
          </ion-button>
        )
      }

      switch(self.currentBreakpoint){
        case 'xs':
        case 'sm':
        case 'md':
          self.message = finalMessage;
          return getMessageButton(self.showMessage);
        case 'lg':
        case 'xl':
        default:
          self.showMessage = false;
          return finalMessage;
      }
  }
  
  return(
    <ion-label slot="content" color="secondary">
      {getActionLabel()}
    </ion-label>)

  }

  addSenderLabel(){
    const self = this;

    const getSenderLabel = function(){
      
      if(self.isHeader)
        return "Sender ID";

      if (!self.notification || !self.notification.senderId)
        return (<ion-skeleton-text animated></ion-skeleton-text>);

      return self.notification.senderId;
    }

    return(
      <ion-label slot="label0" color="secondary">
          {getSenderLabel()}
      </ion-label>
    )
  }

  addSubjectLabel(){
    const self = this;

    const getSubjectLabel = function(){
      
      if(self.isHeader)
        return "Subject";

      if (!self.notification || !self.notification.subject)
        return (<ion-skeleton-text animated></ion-skeleton-text>);

      return self.notification.subject;
    }

    return(
      <ion-label slot="label1" color="secondary">
        {getSubjectLabel()}
      </ion-label>
    )

  }

  generateLabelLayoutConfig(){
    const obj = {
      0 : {
        sizeByScreen: {
          "xs": 3,
          "sm": 3,
          "md": 3,
          "lg": 2,
          "xl":2
        },
        center: false,
      },
      1 : {
        sizeByScreen: {
          "xs": 2,
          "sm": 2,
          "md": 2,
          "lg": 1,
          "xl":1
        },
        center: false,
      },  
    }

    return JSON.stringify(obj);
  }

  showPage(){
    if(this.showMessage)
      return[
        <list-item-layout-default label-col-config={this.generateLabelLayoutConfig()}>
          {this.addSenderLabel()}
          {this.addSubjectLabel()}
          {this.addContent()}
        </list-item-layout-default>,
        <ion-grid>
          <ion-row class="ion-align-items-center">
            <ion-col size={12}>
              <ion-label class={`flex ion-justify-content-end ion-padding-end`} color="secondary">
                {this.message}
              </ion-label>
            </ion-col>
          </ion-row>
        </ion-grid>
      ]

    return(
      <list-item-layout-default label-col-config={this.generateLabelLayoutConfig()}>
        {this.addSenderLabel()}
        {this.addSubjectLabel()}
        {this.addContent()}
      </list-item-layout-default>
    )

  }

  render() {
    return (
      <Host>
        {this.showPage()}
      </Host>
    );
  }
}









