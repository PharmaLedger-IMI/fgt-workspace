/**
 * @memberOf Utils
 */
export default class HistoryNavigator {
  private static registeredTabs: RegisteredTab = {};
  private static previousTab: Tab = {tab: ''};

  readonly homeTab: Tab;
  readonly cacheLimit: number;
  private currentTab: Tab;
  private history: Tab[] = [];

  private get _currentTab(): TabLabeled {
    return {
      ...this.currentTab,
      label: HistoryNavigator.getTabLabel(this.currentTab.tab)
    }
  }

  private set _currentTab(tabProps: TabLabeled) {
    const {tab, props} = tabProps;
    this.currentTab = {tab, props};
  }

  private get _previousTab(): TabLabeled {
    const previousTab = this.history[this.history.length - 1] || this.homeTab;
    const previousTabLabel = {
      ...previousTab,
      label: HistoryNavigator.getTabLabel(previousTab.tab)
    }
    HistoryNavigator.previousTab = previousTabLabel;
    return previousTabLabel;
  }

  constructor(homeTab: Tab, cacheLimit: number = 10) {
    this.homeTab = homeTab;
    this._currentTab = homeTab;
    this.cacheLimit = cacheLimit;
  }

  addToHistory(props: Tab): TabState {
    if (props.tab !== this.currentTab.tab) {
      if (this.history.length >= this.cacheLimit) {
        this.history.shift()
      }
      this.history.push(this.currentTab);
    }
    this._currentTab = props;
    return {
      currentTab: this._currentTab,
      previousTab: this._previousTab
    }
  }

  getBackToPreviousTab(): TabLabeled {
    this._currentTab = this.history.pop();
    return this._currentTab;
  }


  static registerTab(tab: RegisteredTab) {
    this.registeredTabs = Object.assign(this.registeredTabs, tab);
    console.log('## HistoryNavigator.registerTab tab=', tab);
  }

  static getTabLabel(label: string): string {
    return HistoryNavigator.registeredTabs[label] || '';
  }

  static getPreviousTab(): TabLabeled {
    return HistoryNavigator.previousTab;
  }
}

export interface Tab {
  tab: string;
  props?: any;
}

export interface TabLabeled extends Tab {
  label?: string;
}

export interface TabState {
  previousTab: TabLabeled;
  currentTab: TabLabeled
}

export interface RegisteredTab {
  // key  -> HTML tab identification (e.g.: tab-received-orders))
  // value -> Tab name (e.g.: Received Orders)
  [key: string]: string;
}
