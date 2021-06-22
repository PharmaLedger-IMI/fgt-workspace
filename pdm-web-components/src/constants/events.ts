export const EVENT_CONFIG_GET_CORE_TYPE = 'webcardinal:config:getCoreType';
export const EVENT_CONFIG_GET_DOCS_SOURCE = 'webcardinal:config:getDocsSource';
export const EVENT_CONFIG_GET_IDENTITY = 'webcardinal:config:getIdentity';
export const EVENT_CONFIG_GET_LOG_LEVEL = 'webcardinal:config:getLogLevel';
export const EVENT_CONFIG_GET_ROUTING = 'webcardinal:config:getRouting';
// export const EVENT_CONFIG_GET_TRANSLATIONS = 'webcardinal:config:getTranslations';
// export const EVENT_CONFIG_GET_SKINS = 'webcardinal:config:getSkins';
export const EVENT_MODEL_GET = 'webcardinal:model:get';
export const EVENT_ROUTING_GET = 'webcardinal:routing:get';
export const EVENT_TAGS_GET = 'webcardinal:tags:get';
export const EVENT_TRANSLATION_MODEL_GET = 'webcardinal:translationModel:get';

/**
 * @namespace Constants
 */

export const EVENT_SEND_ERROR = 'ssapp-send-error';
export const EVENT_SEND_MESSAGE = 'ssapp-send-message';
export const EVENT_SSAPP_HAS_LOADED = 'ssapp-has-loaded';
export const EVENT_SSAPP_STATUS_UPDATE = 'ssapp-update-status';
export const EVENT_REFRESH = 'ssapp-refresh'
export const EVENT_SELECT = 'ssapp-select'

/**
 * Standard event for navigation events on PDM's SSApp Architecture
 * Expects an object like
 * <pre>
 *  {
 *    tab: 'tab name',
 *    props: 'optional properties that will appear on the tab's controller's {@link EVENT_REFRESH} event detail
 *  }
 * </pre>
 *
 * @memberOf Constants
 */
export const EVENT_NAVIGATE_TAB = 'ssapp-navigate-tab'
export const EVENT_SHOW_MORE = 'ssapp-show-more'
export const EVENT_ACTION = 'ssapp-action'

export const EVENT_ION_TABS_WILL_CHANGE = "ionTabsWillChange";


export const CSS = {
  ALERT: 'ssapp-alert',
  TOAST: 'ssapp-toast',
  SPINNER: 'ssapp-spinner'
}

export const BUTTON_ROLES = {
  CONFIRM: 'confirm',
  CANCEL: 'cancel'
}

export const SIDE_MENU_CLASS_SELECTOR = ".side-menu menu-tab-button";

