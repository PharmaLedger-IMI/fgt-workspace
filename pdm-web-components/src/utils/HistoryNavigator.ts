export default class HistoryNavigator {
  public homepage: TabProps = {tab: ''};
  private currentTab: TabProps = {tab: ''};
  private previousTab: TabProps = {tab: ''};
  private history: TabProps[] = [];
  public cacheLimit = 10;
  private static tabs: TabLabel = {};

  constructor(homepage: TabProps, cacheLimit: number = 10) {
    this.currentTab = homepage;
    this.homepage = homepage;
    this.cacheLimit = cacheLimit;
  }

  addToHistory(props: TabProps): TabState {
    if (props.tab !== this.currentTab.tab && props.tab !== this.previousTab?.tab) {
      if (this.history.length >= this.cacheLimit) {
        this.history.shift()
      }
      this.history.push(this.currentTab);
      this.previousTab = this.currentTab;
    }
    this.currentTab = props;
    console.log('## HistoryNavigator.addToHistory $currentTab=', this.currentTab, ' $history=', this.history);

    return {
      currentTab: {
        ...this.currentTab,
        label: HistoryNavigator.getTabLabel(this.currentTab.tab)
      },
      previousTab: {
        ...this.previousTab,
        label: HistoryNavigator.getTabLabel(this.previousTab.tab)
      }
    };
  }

  getPreviousTab(): TabProps {
    this.previousTab = this.history.pop() || this.homepage;
    this.currentTab = this.previousTab;
    return this.previousTab;
  }

  static getTabLabel(label: string) {
    return HistoryNavigator.tabs[label] || '';
  }

  static registerTab(tab: TabLabel) {
    this.tabs = {...this.tabs, ...tab}
    console.log('## HistoryNavigator.registerTab tab=', tab);
  }
}


export interface TabProps {
  tab: string;
  props?: any;
}

export interface TabPropsLabel extends TabProps {
  label: string;
}

export interface TabState {
  previousTab: TabPropsLabel;
  currentTab: TabPropsLabel
}

export interface TabLabel {
  [key: string]: string;
}
