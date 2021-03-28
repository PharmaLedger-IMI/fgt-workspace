export { setAssetPath, setPlatformOptions } from '@stencil/core/internal/client';
export { c as createAnimation } from './animation.js';
export { iosTransitionAnimation } from './ios.transition.js';
export { mdTransitionAnimation } from './md.transition.js';
export { g as getTimeGivenProgression } from './cubic-bezier.js';
export { createGesture } from './index2.js';
export { g as getPlatforms, i as initialize, a as isPlatform } from './ionic-global.js';
export { c as componentOnReady } from './helpers.js';
export { I as IonicSafeString } from './index3.js';
export { a as LIFECYCLE_DID_ENTER, c as LIFECYCLE_DID_LEAVE, L as LIFECYCLE_WILL_ENTER, b as LIFECYCLE_WILL_LEAVE, d as LIFECYCLE_WILL_UNLOAD } from './index4.js';
export { m as menuController } from './index5.js';
export { b as actionSheetController, a as alertController, l as loadingController, m as modalController, p as pickerController, c as popoverController, t as toastController } from './overlays.js';

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
