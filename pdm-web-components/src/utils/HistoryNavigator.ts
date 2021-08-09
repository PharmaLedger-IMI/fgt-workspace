export default class HistoryNavigator {
  public homeTab: Tab = {tab: ''};
  public cacheLimit = 10;
  private history: Tab[] = [];
  private previousTabKeeper: Tab = {tab: ''};
  private _currentTab: Tab = {tab: ''};

  private static registeredTabs: RegisteredTab = {};

  private get currentTab(): Tab {
    return {
      ...this._currentTab,
      label: HistoryNavigator.getTabLabel(this._currentTab.tab)
    }
  }

  private set currentTab(tab: Tab) {
    this._currentTab = tab;
  }

  private get previousTab(): Tab {
    return this.history[this.history.length - 1] || this.homeTab;
  }

  constructor(homeTab: Tab, cacheLimit: number = 10) {
    const homeTabLabel = {...homeTab, label: HistoryNavigator.getTabLabel(homeTab.tab) || 'Home'};
    this.currentTab = homeTabLabel;
    this.homeTab = homeTabLabel;
    this.cacheLimit = cacheLimit;
  }

  addToHistory(props: Tab): TabState {
    if (props.tab !== this.currentTab.tab && props.tab !== this.previousTabKeeper.tab) {
      if (this.history.length >= this.cacheLimit) {
        this.history.shift()
      }
      this.history.push(this.currentTab);
    }
    this.currentTab = props;
    console.log('## HistoryNavigator.addToHistory $currentTab=', this.currentTab, ' $history=', this.history, ' $previous', this.previousTab);

    return {
      currentTab: this.currentTab,
      previousTab: this.previousTab
    }
  }

  getPreviousTab(): Tab {
    const previousTab = this.history.pop() || this.homeTab;
    this.previousTabKeeper = previousTab;
    // console.log('## HistoryNavigator.getPreviousTab previousTab=', previousTab);
    return previousTab;
  }

  static registerTab(tab: RegisteredTab) {
    this.registeredTabs = {...this.registeredTabs, ...tab}
    console.log('## HistoryNavigator.registerTab tab=', tab);
  }

  static getTabLabel(label: string): string {
    return HistoryNavigator.registeredTabs[label] || '';
  }
}

export interface Tab {
  tab: string;
  props?: any;
  label?: string;
}

export interface TabState {
  previousTab: Tab;
  currentTab: Tab
}

export interface RegisteredTab {
  // key  -> HTML tab identification (e.g.: tab-received-orders))
  // value -> Tab name (e.g.: Received Orders)
  [key: string]: string;
}
