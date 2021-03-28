export { c as createAnimation } from './animation-096c6391.js';
export { iosTransitionAnimation } from './ios.transition-48010460.js';
export { mdTransitionAnimation } from './md.transition-464fd4a8.js';
export { g as getTimeGivenProgression } from './cubic-bezier-eea9a7a9.js';
export { createGesture } from './index-f49d994d.js';
export { g as getPlatforms, i as initialize, a as isPlatform } from './ionic-global-63a97a32.js';
export { c as componentOnReady } from './helpers-dd7e4b7b.js';
export { I as IonicSafeString } from './index-9e3fe806.js';
export { a as LIFECYCLE_DID_ENTER, c as LIFECYCLE_DID_LEAVE, L as LIFECYCLE_WILL_ENTER, b as LIFECYCLE_WILL_LEAVE, d as LIFECYCLE_WILL_UNLOAD } from './index-c3ff7f2e.js';
export { m as menuController } from './index-0d58a5bf.js';
export { b as actionSheetController, a as alertController, l as loadingController, m as modalController, p as pickerController, c as popoverController, t as toastController } from './overlays-28c23c35.js';
import './gesture-controller-31cb6bb9.js';
import './index-7a8b7a1c.js';
import './hardware-back-button-4a6b37fb.js';

const setupConfig = (config) => {
  const win = window;
  const Ionic = win.Ionic;
  if (Ionic && Ionic.config && Ionic.config.constructor.name !== 'Object') {
    console.error('ionic config was already initialized');
    return;
  }
  win.Ionic = win.Ionic || {};
  win.Ionic.config = Object.assign(Object.assign({}, win.Ionic.config), config);
  return win.Ionic.config;
};
const getMode = () => {
  const win = window;
  const config = win && win.Ionic && win.Ionic.config;
  if (config) {
    if (config.mode) {
      return config.mode;
    }
    else {
      return config.get('mode');
    }
  }
  return 'md';
};

export { getMode, setupConfig };
