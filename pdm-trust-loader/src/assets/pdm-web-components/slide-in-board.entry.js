import { r as registerInstance, h, f as Host } from './index-21b82b33.js';

const slideInBoardCss = ":host{display:block}";

const SlideInBoard = class {
  constructor(hostRef) {
    registerInstance(this, hostRef);
  }
  render() {
    return (h(Host, null, h("slot", null)));
  }
};
SlideInBoard.style = slideInBoardCss;

export { SlideInBoard as slide_in_board };
