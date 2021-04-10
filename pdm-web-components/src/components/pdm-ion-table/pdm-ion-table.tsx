import {Component, ComponentInterface, Host, h, Element, Prop, State, Watch, Method} from '@stencil/core';
import HostElement from './../../decorators/HostElement';
import { WebManagerService, ControllerManager, QueryOptions } from '../../services/WebManagerService';

@Component({
  tag: 'pdm-ion-table',
  styleUrl: 'pdm-ion-table.css',
  shadow: false,
})
export class PdmIonTable implements ComponentInterface {
  @HostElement() host: HTMLElement;

  @Element() element;

  @Prop() title = 'PDM Ionic Table';

  /**
   * can be 'bymodel' or 'byref'
   */
  @Prop() mode: string = "bymodel"

  @Prop() canQuery?: boolean = false;

  @Prop() iconName?: string = undefined;

  @Prop() manager: string;

  @Prop() itemType: string;

  @Prop() noContentMessage: string = "No Content";

  @Prop() loadingMessage: string = "Loading...";

  @Prop() itemReferenceName?: string = "reference";

  @Prop() itemsPerPage?: number = 10;

  @Prop() currentPage?: number = undefined;

  @Prop() sort?: string = undefined;

  private webManager: ControllerManager = undefined;

  @State() contents: string[] = undefined;

  async componentWillLoad() {
    if (!this.host.isConnected)
      return;
    this.webManager = await WebManagerService.getWebManager(this.manager);
    await this.loadContents();
  }

  _getQueryOptions(){
    const queryOptions: QueryOptions = {
      query: () => true,
      sort: this.sort,
      limit: this.itemsPerPage
    }
    return queryOptions;
  }

  async loadContents(){
    if (!this.webManager)
      return;

    this.webManager.getAll( false, this._getQueryOptions(), (err, contents) => {
      if (err){
        console.log(`Could not list items`, err);
        return;
      }
      this.contents = contents;
    });
  }

  @Watch('sort')
  @Watch('itemsPerPage')
  @Watch('currentPage')
  @Method()
  async refresh(){
    this.contents = undefined;
    await this.loadContents();
  }

  getTableHead(){
    let self = this;
    const getIcon = function(){
      if (!self.iconName)
        return;
      return (<ion-icon slot="start" className="ion-padding" name={self.iconName}></ion-icon>)
    }

    const getSearchBar = function(){
      if (self.canQuery)
        return (<ion-searchbar animated debounce="1000" placeholder="search..." search-icon="search-outline"
                             show-clear-button="always"></ion-searchbar>);
    }

    return (
      <ion-list-header lines="inset">
        <ion-toolbar>
          {getIcon()}
          <ion-title>{this.title}</ion-title>
          {getSearchBar()}
          <ion-buttons slot="end">
            <ion-button className="ion-padding-horizontal" color="primary" fill="outline">Add Stuff</ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-list-header>
    );
  }

  getEmptyContent(){
    return (
      <ion-tem>{this.noContentMessage}</ion-tem>
    )
  }

  getLoadingContent(){
    return (
      <ion-tem>
        <ion-icon name="refresh-outline"></ion-icon>
        {this.loadingMessage}
      </ion-tem>
    )
  }

  getItem(reference){
    const Tag = this.itemType;
    if (this.mode === 'byref'){
      const elem = (<Tag></Tag>)
      elem[this.itemReferenceName] = reference;
      return elem;
    } else if (this.mode === 'bymodel'){
      return (<Tag data-view-model={'@' + reference}></Tag>)
    } else {
      console.log(`Could not render component. Invalid mode. must be 'bymodel' or 'byref'`);
    }
  }

  getContent(){
    if (!this.contents)
      return this.getLoadingContent();
    if (!this.contents.length)
      return this.getEmptyContent();
    let self = this;
    const content = [];
    this.contents.forEach(reference => {
      content.push(self.getItem(reference));
    });
    return content;
  }

  render() {
    return (
      <Host>
        <ion-list className="ion-margin ion-no-padding">
          {this.getTableHead()}
          {this.getContent()}
        </ion-list>
      </Host>
    );
  }
}
