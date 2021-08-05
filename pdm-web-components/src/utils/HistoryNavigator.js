export class HistoryNavigator {
  homepage = undefined;
  cacheLimit = 10;
  #location = {};
  #previous = {};
  #history = [];

  constructor(homepage, cacheLimit = 10) {
    this.#location = homepage;
    this.homepage = homepage;
    this.cacheLimit = cacheLimit;
  }

  addToHistory(props) {
    if (props.tab !== this.#location.tab && props.tab !== this.#previous.tab) {
      if (this.#history.length >= this.cacheLimit) {
        this.#history.shift()
      }
      this.#history.push(this.#location);
      this.#previous = this.#location;
    }
    this.#location = props;
     // console.log('## HistoryNavigator.addToHistory $currentTab=', this.#location, ' $history=', this.#history);
    return {
      currentTab: this.#location.tab,
      previousTab: this.#previous.tab
    };
  }

  getPreviousTab() {
    this.#previous = this.#history.pop() || this.homepage;
    return this.#previous;
  }
}
