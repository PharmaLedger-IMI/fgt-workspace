import {Component, Host, h, Element, Event, EventEmitter, Prop, Method} from '@stencil/core';
import {HostElement} from "../../decorators";
import wizard from '../../services/WizardService';
const {INPUT_FIELD_PREFIX} = wizard.Constants;

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

  private goBack(evt){
    evt.preventDefault();
    evt.stopImmediatePropagation();
    this.goBackEvent.emit();
  }

  private create(evt){
    evt.preventDefault();
    evt.stopImmediatePropagation();
    this.createEvent.emit(evt.detail);
  }

  private reset(evt){
    evt.preventDefault();
    evt.stopImmediatePropagation();
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
      <ion-button type="reset" color="medium" fill="clear" class="ion-margin-start">
        {this.clearString}
      </ion-button>,
      <ion-button type="submit" color="secondary" class="ion-margin-start">
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
      <form onSubmit={(e) => this.create(e)} onReset={(e) => this.reset(e)}>
        {...getCreateContent()}
      </form>
    )
  }

  @Method()
  async getInput(name: string){
    const inputEl = this.element.querySelector(`form input[name="${INPUT_FIELD_PREFIX}${name}"]`);
    return inputEl.closest('ion-input');
  }

  @Method()
  async clear(){
    const clearButtonEl = this.element.querySelector(`form ion-button[type="clear"]`);
    clearButtonEl.click();
  }

  private getManageContent(){

    const getPostCreateContent = function(){
      return (<slot name="post-create">This is the default post create content</slot>);
    }

    const getManageContent = function(){
      return (<div><slot name="manage">This is a default manage content</slot></div>);
    }

    return [
      <ion-grid>
        <ion-row>
          <ion-col size="12" size-lg="4" size-xl="3">
            {getPostCreateContent()}
          </ion-col>
          <ion-col size="12" size-lg="8" size-xl="9">
            {getManageContent()}
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
