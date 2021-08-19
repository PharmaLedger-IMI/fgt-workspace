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

/**
 * Send error Event. Handled by Home Controller
 * @memberOf Constants
 */
export const EVENT_SEND_ERROR = 'ssapp-send-error';
/**
 * Send Message Event. Handled by Home Controller
 * @memberOf Constants
 */
export const EVENT_SEND_MESSAGE = 'ssapp-send-message';
/**
 * Signals when the SSApp has loaded
 * @memberOf Constants
 */
export const EVENT_SSAPP_HAS_LOADED = 'ssapp-has-loaded';
/**
 * signals loading progress
 * @memberOf Constants
 */
export const EVENT_SSAPP_STATUS_UPDATE = 'ssapp-update-status';
/**
 * Signals a refresh event
 * @memberOf Constants
 */
export const EVENT_REFRESH = 'ssapp-refresh';
/**
 * Send Select event
 * @memberOf Constants
 */
export const EVENT_SELECT = 'ssapp-select';

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
export const EVENT_NAVIGATE_TAB = 'ssapp-navigate-tab';
/**
 * Show more event
 * @memberOf Constants
 */
export const EVENT_SHOW_MORE = 'ssapp-show-more';
/**
 * Send action event
 * @memberOf Constants
 */
export const EVENT_ACTION = 'ssapp-action';
/**
 * Ioniuc's tab change event
 * @memberOf Constants
 */
export const EVENT_ION_TABS_WILL_CHANGE = "ionTabsWillChange";
/**
 * Browser history navigation event
 * @memberOf Constants
 */
export const EVENT_BACK_NAVIGATE = 'ssapp-back-navigate';
/**
 * CSS constants
 * @memberOf Constants
 */
export const CSS = {
  ALERT: 'ssapp-alert',
  TOAST: 'ssapp-toast',
  SPINNER: 'ssapp-spinner'
}
/**
 * Button roles
 * @memberOf Constants
 */
export const BUTTON_ROLES = {
  CONFIRM: 'confirm',
  CANCEL: 'cancel'
}
/**
 * Specific CSS selector for the side menu button
 * @memberOf Constants
 */
export const SIDE_MENU_CLASS_SELECTOR = ".side-menu menu-tab-button";

