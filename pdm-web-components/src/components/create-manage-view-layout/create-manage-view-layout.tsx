import {Component, Host, h, Element, Event, EventEmitter, Prop} from '@stencil/core';
import {HostElement} from "../../decorators";

@Component({
  tag: 'create-manage-view-layout',
  styleUrl: 'create-manage-view-layout.css',
  shadow: false,
})
export class CreateManageViewLayout {
  @HostElement() host: HTMLElement;

  @Element() element;

  @Event()
  createEvent: EventEmitter<{}>;

  @Event()
  goBackEvent: EventEmitter;

  @Prop({attribute: "is-create", mutable:true, reflect: true}) isCreate: boolean = true;

  // strings
  @Prop({attribute: "create-title-string"}) createTitleString: string = "Create String"
  @Prop({attribute: "manage-title-string"}) manageTitleString: string = "Manage String"
  @Prop({attribute: "back-string"}) backString: string = "Back"
  @Prop({attribute: "create-string"}) createString:string = "Create";
  @Prop({attribute: "clear-string"}) clearString: string = "Clear"

  @Prop({attribute: "icon-name"}) iconName?: string = "grid"

  private goBack(){
    this.goBackEvent.emit();
  }

  private create(props?){
    this.createEvent.emit(props);
  }


  private getHeader(){
    return [
      <div class="flex ion-align-items-center">
        <ion-icon name="layers" size="large" color="medium"></ion-icon>
        <ion-label class="ion-text-uppercase ion-padding-start" color="secondary">
          {this.isCreate ? this.createTitleString : this.manageTitleString}
        </ion-label>
      </div>,
      <ion-row class="ion-align-items-center">
        <ion-button color="secondary" fill="clear" class="ion-margin-start" onClick={this.goBack.bind(this)}>
          <ion-icon slot="start" name="return-up-back" class="ion-margin-end"></ion-icon>
          {this.backString}
        </ion-button>
      </ion-row>
    ]
  }

  private getCreateToolbar(){
    return [
      <ion-button role="clear" color="medium" fill="clear" class="ion-margin-start" onClick={this.goBack.bind(this)}>
        {this.clearString}
      </ion-button>,
      <ion-button type="submit" color="secondary" class="ion-margin-start" onClick={this.create.bind(this)}>
        {this.createString}
        <ion-icon slot="end" name="add-circle" class="ion-margin-start"></ion-icon>
      </ion-button>
    ]
  }

  private getCreate(){
    const self =  this;
    const getCreateContent = function(){
      return [
        <slot name="create">This is the default create content</slot>,
        <div class="ion-text-end ion-padding-vertical ion-margin-top">
          {...self.getCreateToolbar()}
        </div>
      ]
    }
    return (
      <form>
        {...getCreateContent()}
      </form>
    )
  }

  private getManageContent(){
    return [
      <ion-grid>
        <ion-row>
          <ion-col size="12" size-lg="4" size-xl="3">
            <slot name="create">This is the default create content</slot>
          </ion-col>
          <ion-col size="12" size-lg="8" size-xl="9">
            <slot name="manage">This is a default manage content</slot>
          </ion-col>
        </ion-row>
      </ion-grid>
    ]
  }

  private getContent(){
    if (this.isCreate)
      return this.getCreate();
    return this.getManageContent();
  }

  render() {
    if (!this.host.isConnected)
      return;
    return (
      <Host>
        <div class="ion-margin-bottom ion-padding-horizontal">
          <ion-row class="ion-align-items-center ion-justify-content-between">
            {...this.getHeader()}
          </ion-row>
        </div>
        <ion-card class="ion-padding">
          {this.getContent()}
        </ion-card>
      </Host>
    )
  }
}
