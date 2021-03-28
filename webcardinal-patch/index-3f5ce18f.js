const EVENT_CONFIG_GET_CORE_TYPE = 'webcardinal:config:getCoreType';
const EVENT_CONFIG_GET_DOCS_SOURCE = 'webcardinal:config:getDocsSource';
const EVENT_CONFIG_GET_IDENTITY = 'webcardinal:config:getIdentity';
const EVENT_CONFIG_GET_LOG_LEVEL = 'webcardinal:config:getLogLevel';
const EVENT_CONFIG_GET_ROUTING = 'webcardinal:config:getRouting';
const EVENT_CONFIG_GET_TRANSLATIONS = 'webcardinal:config:getTranslations';
const EVENT_MODEL_GET = 'webcardinal:model:get';
const EVENT_ROUTING_GET = 'webcardinal:routing:get';
const EVENT_TAGS_GET = 'webcardinal:tags:get';
const EVENT_TRANSLATION_MODEL_GET = 'webcardinal:translationModel:get';

// events
// data-model
const MODEL_KEY = 'data-model';
const MODEL_CHAIN_PREFIX = '@';
const TRANSLATION_CHAIN_PREFIX = '$';
const SKIP_BINDING_FOR_PROPERTIES = ['_saveElement'];
const SKIP_BINDING_FOR_COMPONENTS = ['webc-for', 'webc-if', 'webc-template'];
const PSK_CARDINAL_PREFIX = 'psk-';
// data-for attribute
const DATA_FOR_ATTRIBUTE = 'data-for';
const DATA_FOR_NO_DATA_SLOT_NAME = 'no-data';
// data-if attribute
const DATA_IF_ATTRIBUTE = 'data-if';
const DATA_IF_TRUE_CONDITION_SLOT_NAME = 'true';
const DATA_IF_FALSE_CONDITION_SLOT_NAME = 'false';
// others
const LOG_LEVEL = {
  NONE: 'none',
  WARN: 'warn',
  ERROR: 'error',
};

function extractCallback(event) {
  let callback;
  if (typeof event.detail === 'function') {
    callback = event.detail;
  }
  else if (event.detail && typeof event.detail.callback === 'function') {
    callback = event.detail.callback;
  }
  if (!callback) {
    console.warn(`Invalid callback for event`, event);
    return;
  }
  return callback;
}
class ComponentsListenerService {
  constructor(host, { model, translationModel, tags, routing, }) {
    this.listeners = {
      getModel: () => null,
      getTranslationModel: () => null,
      getTags: () => null,
      getRouting: () => null,
    };
    this.host = host;
    if (model) {
      this.model = model;
      this.listeners.getModel = (event) => {
        event.stopImmediatePropagation();
        const callback = extractCallback(event);
        if (!callback)
          return;
        if (event.detail.chain) {
          let chain = event.detail.chain;
          if (!chain.startsWith(MODEL_CHAIN_PREFIX)) {
            console.warn([
              `Invalid chain found for ${event} (chain: "${chain}")!`,
              `A valid chain must start with "${MODEL_CHAIN_PREFIX}".`,
            ].join('\n'));
            callback(undefined, model);
            return;
          }
          chain = chain.slice(1);
          callback(undefined, model.getChainValue(chain));
          return;
        }
        callback(undefined, model);
      };
    }
    if (translationModel) {
      this.translationModel = translationModel;
      this.listeners.getTranslationModel = (event) => {
        event.stopImmediatePropagation();
        const callback = extractCallback(event);
        if (!callback)
          return;
        if (event.detail.chain) {
          let chain = event.detail.chain;
          if (!chain.startsWith(TRANSLATION_CHAIN_PREFIX)) {
            console.warn([
              `Invalid chain found for ${event} (chain: "${chain}")!`,
              `A valid chain must start with "${TRANSLATION_CHAIN_PREFIX}".`,
            ].join('\n'));
            callback(undefined, translationModel);
            return;
          }
          chain = chain.slice(1);
          callback(undefined, translationModel.getChainValue(chain));
          return;
        }
        callback(undefined, translationModel);
      };
    }
    if (tags) {
      this.tags = tags;
      this.listeners.getTags = (event) => {
        event.stopImmediatePropagation();
        const callback = extractCallback(event);
        if (!callback)
          return;
        if (event.detail.tag) {
          if (!this.tags[event.detail.tag]) {
            callback(`There is no page tag "${event.detail.tag}" registered in webcardinal.json`);
            return;
          }
          callback(undefined, this.tags[event.detail.tag]);
        }
        callback(undefined, this.tags);
      };
    }
    if (routing) {
      this.routing = routing;
      this.listeners.getRouting = (event) => {
        event.stopImmediatePropagation();
        const callback = extractCallback(event);
        if (!callback)
          return;
        callback(undefined, this.routing);
      };
    }
  }
  get getModel() {
    if (!this.model)
      return;
    const eventName = EVENT_MODEL_GET;
    return {
      add: () => this.host.addEventListener(eventName, this.listeners.getModel),
      remove: () => this.host.removeEventListener(eventName, this.listeners.getModel),
      eventName,
    };
  }
  get getTranslationModel() {
    if (!this.translationModel)
      return;
    const eventName = EVENT_TRANSLATION_MODEL_GET;
    return {
      add: () => this.host.addEventListener(eventName, this.listeners.getTranslationModel),
      remove: () => this.host.removeEventListener(eventName, this.listeners.getTranslationModel),
      eventName,
    };
  }
  get getTags() {
    if (!this.tags)
      return;
    const eventName = EVENT_TAGS_GET;
    return {
      add: () => this.host.addEventListener(eventName, this.listeners.getTags),
      remove: () => this.host.removeEventListener(eventName, this.listeners.getTags),
      eventName,
    };
  }
  get getRouting() {
    if (!this.routing)
      return;
    const eventName = EVENT_ROUTING_GET;
    return {
      add: () => this.host.addEventListener(eventName, this.listeners.getRouting),
      remove: () => this.host.removeEventListener(eventName, this.listeners.getRouting),
      eventName,
    };
  }
}

const ControllerRegistryService = {
  getController: async (controllerName) => {
    const { controllers, basePath } = window.WebCardinal;
    if (controllers[controllerName]) {
      return controllers[controllerName];
    }
    try {
      const controller = await import(`${basePath}/scripts/controllers/${controllerName}.js`);
      return controller.default || controller;
    }
    catch (error) {
      console.error(error);
      return null;
    }
  },
};

const ControllerTranslationService = {
  loadAndSetTranslationForPage: async (routingEvent) => {
    var _a;
    const { mapping, skinsPath } = routingEvent;
    const { pathname } = window.location;
    const { language, translations } = window.WebCardinal;

    /**
     * PATCHED
     */
    const pathNameKey = !WebCardinal.basePath || WebCardinal.basePath === '/' ? pathname : pathname.replace(WebCardinal.basePath, '');


    if ((_a = translations[language]) === null || _a === void 0 ? void 0 : _a[pathNameKey]) {
      // the translations are already set for the current language and page
      return;
    }

    const source = mapping[pathNameKey];
    /**
     * PATCHED
     */

    if (!source) {
      console.warn(`No HTML page mapping was found for the current pathname: ${pathname}`);
      return;
    }
    if (source.startsWith('http')) {
      console.warn('Translations for external sources are not supported yet!');
      return;
    }
    let pathWithoutExtension = source.slice(0, source.lastIndexOf('.'));
    if (pathWithoutExtension.indexOf('/') !== 0) {
      pathWithoutExtension = `/${pathWithoutExtension}`;
    }
    const translationFilePrefix = pathWithoutExtension.indexOf('/') === -1
      ? pathWithoutExtension
      : pathWithoutExtension.substr(pathWithoutExtension.lastIndexOf('/') + 1);
    const requestedPath = `${skinsPath}/${language}${pathWithoutExtension}/${translationFilePrefix}.translate.json`;

    try {
      const response = await fetch(requestedPath);
      const translationFile = await response.json();
      if (!translations[language]) {
        translations[language] = {};
      }
      translations[language][pathNameKey] = translationFile;
      return translationFile;
    }
    catch (error) {
      console.log(`Error while loading translation for ${language}: ${requestedPath}`, error);
      console.error(error);
      return null;
    }
  },
};

const STYLED_TAG = 'data-styled';
const SHADOW_TAG = 'data-shadow';
const RULES_REG_EXP = /(.+?){([\w\W]*?)}/g;
const COMMENTS_REG_EXP = /\/\*[\w\W]*?\*\//g;
const MEDIA_QUERIES_REG_EXP = /@media(.+?){([\s\n]*((.+?){([\w\W]*?)})*?[\s\n]*)*[\s\n]*}/g;
const SELECT_SPLIT_REG_EXP = /[~>+ ]/;
class StylingService {
  constructor(host, target) {
    this.host = host;
    this.target = target;
  }
  async applyFromHref(href) {
    const styleText = await StylingService.fetchSource(href);
    await this.applyFromStyleText(styleText);
  }
  async applyFromStyleText(styleText) {
    styleText = StylingService.removeComments(styleText);
    // let mediaQueries = StylingService.getMediaQueries(styleText);
    styleText = StylingService.removeMediaQueries(styleText);
    let rules = StylingService.getRules(styleText);
    for (let [selector, properties] of Object.entries(rules)) {
      this.applyProperties(this.host, selector, properties);
    }
  }
  applyProperties(host, selector, properties) {
    const elements = host.querySelectorAll(selector);
    if (elements.length > 0) {
      if (!host.host) {
        console.warn(`You must use custom styling only when you want to customise a #shadow-root (document fragment)\n`, `In this case use a "link ref='stylesheet'" or a "style" element!\n`, `Read the docs regarding to "${SHADOW_TAG}" attribute!\n`, `target selector: "${selector}"\n`, `target element:`, this.target);
      }
      let hostStyles = [];
      for (let i = 0; i < elements.length; i++) {
        hostStyles.push(`${selector}{${properties}}`);
      }
      let styleElement = host.querySelector(`[${STYLED_TAG}]`);
      if (!styleElement) {
        styleElement = StylingService.appendStyle(host, '');
      }
      if (hostStyles.length > 0) {
        styleElement.append(hostStyles.join('\n'));
      }
      return;
    }
    let arrayOfSelectors = selector.split(SELECT_SPLIT_REG_EXP).filter(String);
    let shadowSelector = '';
    for (let part of arrayOfSelectors) {
      if (part.endsWith(`[${SHADOW_TAG}]`)) {
        shadowSelector = part;
        break;
      }
    }
    if (!shadowSelector) {
      return;
    }
    let [beforeSelector, afterSelector] = selector.split(shadowSelector);
    selector = beforeSelector + shadowSelector.replace(`[${SHADOW_TAG}]`, '');
    let shadowElements = host.querySelectorAll(selector);
    for (let element of shadowElements) {
      if (element.shadowRoot) {
        this.applyProperties(element.shadowRoot, `${afterSelector.trim()}`, properties);
      }
    }
  }
  static async fetchSource(sourcePath) {
    try {
      const response = await fetch(sourcePath);
      return response.ok ? await response.text() : '';
    }
    catch (error) {
      console.error(error);
      return '';
    }
  }
  static removeComments(styleText) {
    return styleText.replace(COMMENTS_REG_EXP, '').trim();
  }
  static removeMediaQueries(styleText) {
    return styleText.replace(MEDIA_QUERIES_REG_EXP, '').trim();
  }
  /**
   * @futureOff
   **/
  // private static getMediaQueries(styleText: string) {
  //   let regex = MEDIA_QUERIES_REG_EXP;
  //   let queries = [];
  //   for (let rule of Array.from((styleText as any).matchAll(regex))) {
  //     if (Array.isArray(rule) && rule.length < 2) {
  //       continue;
  //     }
  //     let query = rule[1].trim();
  //     let rules = StylingService.getRules(rule[2]);
  //     queries.push({ query, rules });
  //   }
  //   return queries;
  // }
  static getRules(styleText) {
    let regex = RULES_REG_EXP;
    let rules = {};
    for (let rule of Array.from(styleText.matchAll(regex))) {
      if (Array.isArray(rule) && rule.length < 2) {
        continue;
      }
      let selector = rule[1].trim();
      if (selector.startsWith('@')) {
        continue;
      }
      rules[selector] = rule[2].split(';').map(i => i.trim()).filter(String).join(';');
    }
    return rules;
  }
  static appendStyle(host, styleText) {
    const styleElement = document.createElement('style');
    styleElement.setAttribute(STYLED_TAG, '');
    styleElement.innerText = styleText;
    host.append(styleElement);
    return styleElement;
  }
}

function getClosestParentElement(element, selector, stopSelector) {
  let closestParent = null;
  while (element) {
    if (element.matches(selector)) {
      closestParent = element;
      break;
    }
    else if (stopSelector && element.matches(stopSelector)) {
      break;
    }
    element = element.parentElement;
  }
  return closestParent;
}
function isNativeProperty(key) {
  // these values are not visible as attributes over the HTMLElement
  return ['value', 'innerText', 'innerHTML'].includes(key);
}
function shortcutToProperty(key) {
  switch (key) {
    case 'model':
      return 'data-model';
    case 'tag':
      return 'data-tag';
    case 'text':
      return 'innerText';
    case 'html':
      return 'innerHTML';
    default:
      return key;
  }
}
function setElementValue(element, { key, value }) {
  if (SKIP_BINDING_FOR_PROPERTIES.includes(key)) {
    return;
  }
  if (['innerHTML', 'innerText'].includes(key)) {
    console.warn(`Model property "${key}" can be short handed, try "${key.substr(5).toLowerCase()}" instead!\n`, `target element:`, element);
  }
  if (['data-tag', 'data-model'].includes(key)) {
    console.warn(`Model property "${key}" can be shorthanded, try "${key.substr(5)}" instead!\n`, `target model:`, element.getAttribute('data-model'));
  }
  key = shortcutToProperty(key);
  if (isNativeProperty(key)) {
    element[key] = value;
    return;
  }
  if (key === 'class') {
    if (value === '') {
      element.className = '';
      return;
    }
    if (typeof value === 'string') {
      element.classList.add(value);
      return;
    }
    if (typeof value === 'object') {
      for (const [className, active] of Object.entries(value)) {
        if (active) {
          element.classList.add(className);
        }
        else {
          element.classList.remove(className);
        }
      }
      return;
    }
    return;
  }
  if (typeof value === 'boolean') {
    if (value) {
      element.setAttribute(key, '');
    }
    else {
      element.removeAttribute(key);
    }
    return;
  }
  if (typeof value === 'string') {
    element.setAttribute(key, value);
    return;
  }
  if (typeof value === 'object') {
    element[key] = value;
    return;
  }
}
function isAttributeForModelChange(element, attribute) {
  const tagName = element.tagName.toLowerCase();
  if (tagName === 'input' && element.getAttribute('type') === 'checkbox' && attribute === 'checked') {
    return true;
  }
  return attribute === 'value';
}
/**
 * @description - Binds all attributes for an Element
 * @param element
 * @param model - Object in which the specified chain (<attribute>="@chain") is searched
 */
function bindElementAttributes(element, model, chainPrefix = MODEL_CHAIN_PREFIX, modelChainPrefix = null) {
  // for some webc-<components> binding is managed by component itself
  if (SKIP_BINDING_FOR_COMPONENTS.includes(element.tagName.toLowerCase())) {
    return;
  }
  // for psk-<components> @BindModel decorator is design for this task
  if (element.tagName.startsWith(PSK_CARDINAL_PREFIX.toUpperCase())) {
    return;
  }
  Array.from(element.attributes).forEach(attribute => {
    const key = attribute.nodeName;
    let chain = attribute.nodeValue;
    if (key === MODEL_KEY) {
      return;
    }
    if (!chain.startsWith(chainPrefix)) {
      return;
    }
    chain = chain.slice(1);
    if (modelChainPrefix) {
      // prepend the modelChainPrefix
      chain = [modelChainPrefix, chain].filter(String).join('.');
    }
    setElementValue(element, { key, value: model.getChainValue(chain) });
    if (chainPrefix === MODEL_CHAIN_PREFIX && isAttributeForModelChange(element, key)) {
      bindElementChangeToModelProperty(element, model, chain);
    }
    model.onChange(chain, _ => {
      setElementValue(element, { key, value: model.getChainValue(chain) });
    });
    if (model.hasExpression(chain)) {
      setElementValue(element, { key, value: model.evaluateExpression(chain) });
      if (chainPrefix === MODEL_CHAIN_PREFIX && isAttributeForModelChange(element, key)) {
        bindElementChangeToModelProperty(element, model, chain);
      }
      model.onChangeExpressionChain(chain, _ => {
        setElementValue(element, { key, value: model.evaluateExpression(chain) });
      });
    }
  });
}
function removeSlotInfoFromElement(element) {
  // when nesting mutiple components that handle binding, the inner slots will have the hidden property set automatically
  // so we make sure to remove both the slot and hidden attributes
  if (element.nodeType !== Node.ELEMENT_NODE) {
    return;
  }
  element.removeAttribute('slot');
  element.removeAttribute('hidden');
}
function bindElementChangeToModelProperty(element, model, propertyChain) {
  const tagName = element.tagName.toLowerCase();
  if (['input', 'textarea'].includes(tagName)) {
    element.addEventListener('input', e => {
      const target = e.target;
      if (tagName === 'input' && element.getAttribute('type') === 'checkbox') {
        model.setChainValue(propertyChain, target.checked);
      }
      else {
        const updatedValue = target.value;
        model.setChainValue(propertyChain, updatedValue);
      }
    });
  }
  else if (tagName === 'select') {
    element.addEventListener('change', e => {
      const target = e.target;
      const updatedValue = target.value;
      model.setChainValue(propertyChain, updatedValue);
    });
  }
}
function bindElementChangeToModel(element, model, chain) {
  const targetModel = model.getChainValue(chain);
  if (!targetModel) {
    return;
  }
  const tagName = element.tagName.toLowerCase();
  const propertyChainSuffix = tagName === 'input' && element.getAttribute('type') === 'checkbox' ? 'checked' : 'value';
  const propertyChain = `${chain}.${propertyChainSuffix}`;
  bindElementChangeToModelProperty(element, model, propertyChain);
}
function isAttributePresentOnElement(element, attributeName) {
  return Array.from(element.attributes).some(attribute => attribute.nodeName === attributeName);
}
function getSlots(elements, slotName) {
  const validElements = elements.filter(child => {
    return child.getAttribute('slot') === slotName;
  });
  return validElements;
}
function getSlotContent(elements, slotName) {
  return getSlots(elements, slotName)
    .map(slotElement => {
    return slotElement.outerHTML;
  })
    .join('');
}
function removeElementChildren(element) {
  while (element.children.length > 0) {
    element.children[0].remove();
  }
}
function removeElementChildNodes(element) {
  while (element.childNodes.length > 0) {
    element.childNodes[0].remove();
  }
}

function convertCSSTimeToMs(time) {
  const num = parseFloat(time);
  let unit = time.match(/m?s/);
  let milliseconds;
  if (unit) {
    unit = unit[0];
  }
  switch (unit) {
    case 's':
      milliseconds = num * 1000;
      break;
    case 'ms':
      milliseconds = num;
      break;
    default:
      milliseconds = 0;
      break;
  }
  return milliseconds;
}

function extractChain(element) {
  const chain = element.getAttribute(MODEL_KEY);
  if (!chain) {
    return '';
  }
  if (!chain.startsWith(MODEL_CHAIN_PREFIX)) {
    const tagName = element.tagName.toLowerCase();
    console.error([
      `Invalid chain found for ${tagName} (chain: "${chain}")!`,
      `A valid chain must start with "${MODEL_CHAIN_PREFIX}".`,
    ].join('\n'));
    return '';
  }
  return chain;
}
async function bindChain(host, { chain, model, translationModel }, options = {}) {
  if (!options) {
    options = {};
  }
  if (model) {
    Array.from(host.childNodes).forEach((child) => {
      BindingService.bindElement(child, Object.assign({ model,
        translationModel, chainPrefix: chain ? chain.slice(1) : null, recursive: true, enableTranslations: true }, options));
    });
  }
  return {
    model,
    translationModel
  };
}

function promisifyEventEmit(event, args = {}) {
  return new Promise((resolve, reject) => {
    event.emit(Object.assign(Object.assign({}, args), { callback: (error, data) => {
        if (error) {
          reject(error);
        }
        resolve(data);
      } }));
  });
}
function promisifyEventDispatch(eventName, host, args = {}) {
  return new Promise((resolve, reject) => {
    host.dispatchEvent(new CustomEvent(eventName, Object.assign({ bubbles: true, composed: true, cancelable: true, detail: {
        callback: (error, data) => {
          if (error) {
            reject(error);
          }
          resolve(data);
        },
      } }, args)));
  });
}

const support = (function () {
  if (!window.DOMParser)
    return false;
  const parser = new DOMParser();
  try {
    parser.parseFromString('x', 'text/html');
  }
  catch (err) {
    return false;
  }
  return true;
})();
/**
 * Convert a template string into HTML DOM nodes
 * @param  {String} str The template string
 * @return {Node}       The template HTML
 */
const stringToHTML = function (str) {
  // If DOMParser is supported, use it
  if (support) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(str, 'text/html');
    return doc.body;
  }
  // Otherwise, fallback to old-school method
  const dom = document.createElement('div');
  dom.innerHTML = str;
  return dom;
};
/**
 * Create an array of the attributes on an element
 * @param  {NamedNodeMap} attributes The attributes on an element
 * @return {Array}                   The attributes on an element as an array of key/value pairs
 */
const getAttributes = function (attributes) {
  return Array.prototype.map.call(attributes, function (attribute) {
    return {
      att: attribute.name,
      value: attribute.value,
    };
  });
};
/**
 * Create a DOM Tree Map for an element
 * @param  {Node}    element The element to map
 * @param  {Boolean} isSVG   If true, node is within an SVG
 * @return {Array}           A DOM tree map
 */
const createDomMap = function (element, isSVG = false) {
  return Array.prototype.map.call(element.childNodes, function (node) {
    const details = {
      content: node.childNodes && node.childNodes.length > 0 ? null : node.textContent,
      atts: node.nodeType !== 1 ? [] : getAttributes(node.attributes),
      type: node.nodeType === 3 ? 'text' : node.nodeType === 8 ? 'comment' : node.tagName.toLowerCase(),
      node: node,
      isSVG: null,
      children: null,
    };
    details.isSVG = isSVG || details.type === 'svg';
    details.children = createDomMap(node, details.isSVG);
    return details;
  });
};
const getStyleMap = function (styles) {
  return styles.split(';').reduce(function (arr, style) {
    if (style.trim().indexOf(':') > 0) {
      const styleArr = style.split(':');
      arr.push({
        name: styleArr[0] ? styleArr[0].trim() : '',
        value: styleArr[1] ? styleArr[1].trim() : '',
      });
    }
    return arr;
  }, []);
};
const removeStyles = function (elem, styles) {
  styles.forEach(function (style) {
    elem.style[style] = '';
  });
};
const changeStyles = function (elem, styles) {
  styles.forEach(function (style) {
    elem.style[style.name] = style.value;
  });
};
const diffStyles = function (elem, styles) {
  // Get style map
  const styleMap = getStyleMap(styles);
  // Get styles to remove
  const remove = Array.prototype.filter.call(elem.style, function (style) {
    const findStyle = styleMap.find(function (newStyle) {
      return newStyle.name === style && newStyle.value === elem.style[style];
    });
    return findStyle === undefined;
  });
  // Add and remove styles
  removeStyles(elem, remove);
  changeStyles(elem, styleMap);
};
const removeAttributes = function (elem, atts) {
  atts.forEach(function (attribute) {
    // If the attribute is a class, use className
    // Else if it's style, remove all styles
    // Otherwise, use removeAttribute()
    if (attribute.att === 'class') {
      elem.className = '';
    }
    else if (attribute.att === 'style') {
      removeStyles(elem, Array.prototype.slice.call(elem.style));
    }
    else {
      elem.removeAttribute(attribute.att);
    }
  });
};
/**
 * Add attributes to an element
 * @param {Node}  elem The element
 * @param {Array} atts The attributes to add
 */
const addAttributes = function (elem, atts) {
  atts.forEach(function (attribute) {
    // If the attribute is a class, use className
    // Else if it's style, diff and update styles
    // Otherwise, set the attribute
    if (attribute.att === 'class') {
      elem.className = attribute.value;
    }
    else if (attribute.att === 'style') {
      diffStyles(elem, attribute.value);
    }
    else {
      elem.setAttribute(attribute.att, attribute.value || true);
    }
  });
};
/**
 * Diff the attributes on an existing element versus the template
 * @param  {Object} template The new template
 * @param  {Object} existing The existing DOM node
 */
const diffAtts = function (template, existing) {
  // Get attributes to remove
  const remove = existing.atts.filter(function (att) {
    const getAtt = template.atts.find(function (newAtt) {
      return att.att === newAtt.att;
    });
    return getAtt === undefined;
  });
  // Get attributes to change
  const change = template.atts.filter(function (att) {
    const getAtt = existing.atts.find(function (existingAtt) {
      return att.att === existingAtt.att;
    });
    return getAtt === undefined || getAtt.value !== att.value;
  });
  // Add/remove any required attributes
  addAttributes(existing.node, change);
  removeAttributes(existing.node, remove);
};
/**
 * Make an HTML element
 * @param  {Object} elem The element details
 * @return {Node}        The HTML element
 */
const makeElem = function (elem) {
  // Create the element
  let node;
  if (elem.type === 'text') {
    node = document.createTextNode(elem.content);
  }
  else if (elem.type === 'comment') {
    node = document.createComment(elem.content);
  }
  else if (elem.isSVG) {
    node = document.createElementNS('http://www.w3.org/2000/svg', elem.type);
  }
  else {
    node = document.createElement(elem.type);
  }
  // Add attributes
  addAttributes(node, elem.atts);
  // If the element has child nodes, create them
  // Otherwise, add textContent
  if (elem.children.length > 0) {
    elem.children.forEach(function (childElem) {
      node.appendChild(makeElem(childElem));
    });
  }
  else if (elem.type !== 'text') {
    node.textContent = elem.content;
  }
  return node;
};
/**
 * Diff the existing DOM node versus the template
 * @param  {Array} templateMap A DOM tree map of the template content
 * @param  {Array} domMap      A DOM tree map of the existing DOM node
 * @param  {Node}  elem        The element to render content into
 */
const diffDomMap = function (templateMap, domMap, elem) {
  // If extra elements in domMap, remove them
  let count = domMap.length - templateMap.length;
  if (count > 0) {
    for (; count > 0; count--) {
      domMap[domMap.length - count].node.parentNode.removeChild(domMap[domMap.length - count].node);
    }
  }
  // Diff each item in the templateMap
  templateMap.forEach(function (node, index) {
    // If element doesn't exist, create it
    if (!domMap[index]) {
      elem.appendChild(makeElem(templateMap[index]));
      return;
    }
    // If element is not the same type, replace it with new element
    if (templateMap[index].type !== domMap[index].type) {
      domMap[index].node.parentNode.replaceChild(makeElem(templateMap[index]), domMap[index].node);
      return;
    }
    // If attributes are different, update them
    diffAtts(templateMap[index], domMap[index]);
    // If content is different, update it
    if (templateMap[index].content !== domMap[index].content) {
      domMap[index].node.textContent = templateMap[index].content;
    }
    // If target element should be empty, wipe it
    if (domMap[index].children.length > 0 && node.children.length < 1) {
      domMap[index].node.innerHTML = '';
      return;
    }
    // If element is empty and shouldn't be, build it up
    // This uses a document fragment to minimize reflows
    if (domMap[index].children.length < 1 && node.children.length > 0) {
      const fragment = document.createDocumentFragment();
      diffDomMap(node.children, domMap[index].children, fragment);
      elem.appendChild(fragment);
      return;
    }
    // If there are existing child elements that need to be modified, diff them
    if (node.children.length > 0) {
      diffDomMap(node.children, domMap[index].children, domMap[index].node);
    }
  });
};

function setElementModel(element, model, chain) {
  // model
  const targetModel = model.getChainValue(chain);
  if (targetModel) {
    for (const [key, value] of Object.entries(targetModel)) {
      setElementValue(element, { key, value });
    }
    if (targetModel._saveElement === true) {
      // ensure that each of element's methods have the correct context attached,
      // because the model proxy doesn't set the context accordingly
      for (const property in element) {
        if (typeof element[property] === 'function') {
          element[property] = element[property].bind(element);
        }
      }
      if (!targetModel.getElement) {
        // we first the getElement function only on the initialization step in order to not generate useless model change events
        // which can lead to infinite loops
        model.setChainValue(chain, Object.assign(Object.assign({}, targetModel), { getElement: () => element }));
      }
    }
  }
  // expressions
  if (model.hasExpression(chain)) {
    const targetModel = model.evaluateExpression(chain);
    for (const [key, value] of Object.entries(targetModel)) {
      setElementValue(element, { key, value });
    }
  }
}
function isElementNode(node) {
  return node.nodeType === Node.ELEMENT_NODE;
}
function isTextNode(node) {
  return node.nodeType === Node.TEXT_NODE && node.nodeValue && node.nodeValue.trim();
}

function bindNodeValue(node, model, translationModel, modelChainPrefix = null) {
  // for some webc-<components> binding is managed by component itself
  if (SKIP_BINDING_FOR_COMPONENTS.includes(node.nodeName.toLowerCase())) {
    return;
  }
  if (node.nodeType !== Node.TEXT_NODE || !node.nodeValue || !node.nodeValue.trim()) {
    // the current node is either not a text node or has an empty value
    return;
  }
  const bindingExpressionTexts = [...node.nodeValue.matchAll(/\{\{\s*([^\s}}]+)\s*\}\}/g)];
  if (!bindingExpressionTexts.length) {
    // no binding expressions were found
    return;
  }
  const bindingExpressions = bindingExpressionTexts
    .map(x => {
    return {
      expression: x[0],
      chainWithPrefix: x[1],
    };
  })
    .filter(({ chainWithPrefix }) => {
    return chainWithPrefix.startsWith(MODEL_CHAIN_PREFIX) || chainWithPrefix.startsWith(TRANSLATION_CHAIN_PREFIX);
  })
    .map(expression => {
    let { chainWithPrefix } = expression;
    const isTranslation = chainWithPrefix.startsWith(TRANSLATION_CHAIN_PREFIX);
    let chain = expression.chainWithPrefix.slice(1);
    if (!isTranslation && modelChainPrefix) {
      // prepend the modelChainPrefix
      chain = [modelChainPrefix, chain].filter(String).join('.');
      chainWithPrefix = `${MODEL_CHAIN_PREFIX}${chain}`;
    }
    const currentModel = isTranslation ? translationModel : model;
    return Object.assign(Object.assign({}, expression), { chain,
      isTranslation, isModel: !isTranslation, isModelExpression: currentModel.hasExpression(chain), evaluateModelExpression: () => currentModel.evaluateExpression(chain), model: currentModel, getChainValue: () => {
        let value = currentModel.getChainValue(chain);
        if (isTranslation && value === undefined) {
          const { language } = window.WebCardinal;
          const { pathname } = window.location;
          console.warn(`No translations found for language ${language}, page ${pathname} and key ${chain}`);
          // we have a translation for a missing key, so we return the translation key (chain)
          value = chain;
        }
        return value;
      } });
  });
  if (!bindingExpressions.length) {
    // no supported binding found
    return;
  }
  const originalNodeValue = node.nodeValue;
  const updateNodeValue = () => {
    let updatedNodeValue = originalNodeValue;
    bindingExpressions.forEach(({ expression, getChainValue, isModelExpression, evaluateModelExpression }) => {
      let value = getChainValue();
      if (["number", "boolean"].includes(typeof value)) {
        value = value.toString();
      }
      if (!value && isModelExpression) {
        value = isModelExpression ? evaluateModelExpression() : '';
      }
      updatedNodeValue = updatedNodeValue.replace(expression, value || '');
    });
    node.nodeValue = updatedNodeValue;
  };
  updateNodeValue();
  bindingExpressions
    .filter(x => x.isModel)
    .forEach(({ model, chain, isModelExpression }) => {
    model.onChange(chain, () => {
      updateNodeValue();
    });
    if (isModelExpression) {
      model.onChangeExpressionChain(chain, () => {
        updateNodeValue();
      });
    }
  });
}

function handleDataIfAttributePresence(element, { model, translationModel, chainPrefix, enableTranslations = false } = {
  model: null,
  translationModel: null,
}) {
  let conditionChain = element.getAttribute(DATA_IF_ATTRIBUTE);
  if (!conditionChain.startsWith(MODEL_CHAIN_PREFIX)) {
    console.warn(`Attribute "${DATA_IF_ATTRIBUTE}" doesn't start with the chain prefix!`);
    return;
  }
  conditionChain = conditionChain.slice(1);
  const completeConditionChain = chainPrefix ? [chainPrefix, conditionChain].filter(String).join('.') : conditionChain;
  const children = Array.from(element.children);
  let conditionValue;
  let trueSlotElements = getSlots(children, DATA_IF_TRUE_CONDITION_SLOT_NAME);
  const falseSlotElements = getSlots(children, DATA_IF_FALSE_CONDITION_SLOT_NAME);
  if (!trueSlotElements.length && !falseSlotElements.length) {
    trueSlotElements = Array.from(element.childNodes);
  }
  removeElementChildNodes(element);
  const setVisibleContent = () => {
    const visibleSlots = conditionValue ? trueSlotElements : falseSlotElements;
    removeElementChildNodes(element);
    visibleSlots.forEach(slot => {
      const slotElement = slot.cloneNode(true);
      removeSlotInfoFromElement(slotElement);
      element.appendChild(slotElement);
      BindingService.bindElement(slotElement, {
        model,
        translationModel,
        chainPrefix,
        enableTranslations,
        recursive: true,
      });
    });
  };
  const setExtractedConditionValue = async (extractedConditionValue) => {
    let value;
    if (extractedConditionValue instanceof Promise) {
      try {
        value = await extractedConditionValue;
      }
      catch (error) {
        console.error('data-if condition promise failed', error);
        value = false;
      }
    }
    else {
      value = !!extractedConditionValue; // ensure we have a boolean value
    }
    // the value has changed so the visible content must be updated
    const mustUpdateVisibleContent = conditionValue !== value;
    conditionValue = value;
    if (mustUpdateVisibleContent) {
      setVisibleContent();
    }
  };
  setExtractedConditionValue(model.getChainValue(completeConditionChain));
  // initial binding
  //   bindElementChangeToModel(element, model, completeConditionChain);
  bindElementAttributes(element, model, MODEL_CHAIN_PREFIX, chainPrefix);
  if (enableTranslations) {
    bindElementAttributes(element, translationModel, TRANSLATION_CHAIN_PREFIX, chainPrefix);
  }
  model.onChange(completeConditionChain, () => {
    setExtractedConditionValue(model.getChainValue(completeConditionChain));
  });
  if (model.hasExpression(completeConditionChain)) {
    setExtractedConditionValue(model.evaluateExpression(completeConditionChain));
    model.onChangeExpressionChain(completeConditionChain, () => {
      setExtractedConditionValue(model.evaluateExpression(completeConditionChain));
    });
  }
}
function handleDataForAttributePresence(element, { model, translationModel, chainPrefix, enableTranslations = false } = {
  model: null,
  translationModel: null,
}) {
  let dataForAttributeChain = element.getAttribute(DATA_FOR_ATTRIBUTE);
  if (!dataForAttributeChain.startsWith(MODEL_CHAIN_PREFIX)) {
    console.warn(`Attribute "${DATA_FOR_ATTRIBUTE}" doesn't start with the chain prefix!`);
    return;
  }
  dataForAttributeChain = dataForAttributeChain.slice(1);
  const completeChain = chainPrefix
    ? [chainPrefix, dataForAttributeChain].filter(String).join('.')
    : dataForAttributeChain;
  const dataForAttributeModelValue = model.getChainValue(completeChain);
  if (!Array.isArray(dataForAttributeModelValue)) {
    console.error(`Attribute "${DATA_FOR_ATTRIBUTE}" must be an array in the model!`);
    return;
  }
  const noDataTemplates = [];
  const templates = [];
  while (element.childNodes.length > 0) {
    const firstChild = element.childNodes[0];
    if (isElementNode(firstChild) && firstChild.getAttribute('slot') === DATA_FOR_NO_DATA_SLOT_NAME) {
      noDataTemplates.push(firstChild);
    }
    else {
      templates.push(firstChild);
    }
    firstChild.remove();
  }
  let existingNodes = [];
  const renderTemplate = () => {
    if (!dataForAttributeModelValue.length) {
      removeElementChildNodes(element);
      noDataTemplates.forEach(templateNode => {
        const childElement = templateNode.cloneNode(true);
        // when nesting mutiple webc-fors, the inner slots will have the hidden property set automatically
        removeSlotInfoFromElement(childElement);
        element.appendChild(childElement);
        BindingService.bindElement(childElement, {
          model,
          translationModel,
          chainPrefix: chainPrefix,
          enableTranslations,
          recursive: true,
        });
      });
      return;
    }
    dataForAttributeModelValue.forEach((_modelElement, modelElementIndex) => {
      const updatedNodes = [];
      templates.forEach(templateNode => {
        const childElement = templateNode.cloneNode(true);
        const modelElementChainPrefix = [completeChain, modelElementIndex].filter(String).join('.');
        BindingService.bindElement(childElement, {
          model,
          translationModel,
          chainPrefix: modelElementChainPrefix,
          enableTranslations,
          recursive: true,
        });
        updatedNodes.push(childElement);
      });
      if (existingNodes[modelElementIndex]) {
        // we have existing nodes that we need to update
        updatedNodes.forEach((element, index) => {
          const updatedElement = document.createElement('div');
          updatedElement.appendChild(element);
          const existingElement = document.createElement('div');
          existingElement.appendChild(existingNodes[modelElementIndex][index].cloneNode(true));
          const templateMap = createDomMap(updatedElement);
          const domMap = createDomMap(existingElement);
          diffDomMap(templateMap, domMap, existingNodes[modelElementIndex][index]);
        });
      }
      else {
        updatedNodes.forEach(childElement => {
          element.appendChild(childElement);
        });
      }
      existingNodes[modelElementIndex] = updatedNodes;
    });
  };
  const updateAndRenderTemplate = newValue => {
    if (!Array.isArray(newValue)) {
      console.error(`Attribute "${DATA_FOR_ATTRIBUTE}" must be an array in the model!`);
      newValue = [];
    }
    newValue = newValue || [];
    const hasContentTypeChanged = (dataForAttributeModelValue.length === 0 && newValue.length !== 0) ||
      (dataForAttributeModelValue.length !== 0 && newValue.length === 0);
    if (hasContentTypeChanged) {
      removeElementChildNodes(element);
      existingNodes = [];
    }
    renderTemplate();
  };
  renderTemplate();
  // initial binding
  //   bindElementChangeToModel(element, model, completeChain);
  bindElementAttributes(element, model, MODEL_CHAIN_PREFIX, chainPrefix);
  if (enableTranslations) {
    bindElementAttributes(element, translationModel, TRANSLATION_CHAIN_PREFIX, chainPrefix);
  }
  model.onChange(completeChain, () => {
    // todo: further optimize the rendering by checking exactly which element of the array triggered the change
    updateAndRenderTemplate(model.getChainValue(completeChain));
  });
  if (model.hasExpression(completeChain)) {
    model.onChangeExpressionChain(completeChain, () => {
      updateAndRenderTemplate(model.evaluateExpression(completeChain));
    });
  }
}
const BindingService = {
  bindElement: (elementOrChildNode, options = {
    model: null,
    translationModel: null,
  }) => {
    const { model, translationModel, chainPrefix, enableTranslations = false, recursive = false } = options;
    if (!model) {
      const tagName = isElementNode(elementOrChildNode)
        ? elementOrChildNode.tagName.toLowerCase()
        : 'text node';
      console.warn(`No model found for: ${tagName}!`);
      return;
    }
    if (isTextNode(elementOrChildNode)) {
      bindNodeValue(elementOrChildNode, model, translationModel, chainPrefix);
      return;
    }
    if (isElementNode(elementOrChildNode)) {
      const element = elementOrChildNode;
      // for some webc-<components> binding is managed by component itself
      if (SKIP_BINDING_FOR_COMPONENTS.includes(element.tagName.toLowerCase())) {
        return;
      }
      const hasDataIfAttribute = isAttributePresentOnElement(element, DATA_IF_ATTRIBUTE);
      const hasDataForAttribute = isAttributePresentOnElement(element, DATA_FOR_ATTRIBUTE);
      if (hasDataIfAttribute && hasDataForAttribute) {
        console.error('Cannot use both data-if and data-for attributes on the same element', element);
      }
      else if (hasDataIfAttribute) {
        handleDataIfAttributePresence(element, options);
      }
      else if (hasDataForAttribute) {
        handleDataForAttributePresence(element, options);
      }
      else {
        if (element.getAttribute(MODEL_KEY)) {
          let chain = element.getAttribute(MODEL_KEY);
          if (chain.startsWith(MODEL_CHAIN_PREFIX)) {
            chain = chain.slice(1);
            const completeChain = chainPrefix ? [chainPrefix, chain].filter(String).join('.') : chain;
            // initial binding
            setElementModel(element, model, completeChain);
            bindElementChangeToModel(element, model, completeChain);
            // onChange
            model.onChange(completeChain, () => setElementModel(element, model, completeChain));
            // onChangeExpressionChain
            if (model.hasExpression(completeChain)) {
              model.onChangeExpressionChain(completeChain, () => setElementModel(element, model, completeChain));
            }
          }
          else {
            console.warn(`Invalid chain found! (chain: "${chain}")!\n`, `A valid chain must start with "${MODEL_CHAIN_PREFIX}".\n`, `target element:`, element);
          }
        }
        // for psk-<components> @BindModel decorator is design for this task
        if (!element.tagName.startsWith(PSK_CARDINAL_PREFIX.toUpperCase())) {
          bindElementAttributes(element, model, MODEL_CHAIN_PREFIX, chainPrefix);
        }
        if (enableTranslations) {
          bindElementAttributes(element, translationModel, TRANSLATION_CHAIN_PREFIX, chainPrefix);
        }
        Array.from(element.childNodes)
          .filter(isTextNode)
          .forEach(node => {
          bindNodeValue(node, model, translationModel, chainPrefix);
        });
        if (recursive) {
          Array.from(element.children).forEach(child => {
            BindingService.bindElement(child, options);
          });
        }
      }
    }
  },
};

export { BindingService as B, ComponentsListenerService as C, EVENT_CONFIG_GET_ROUTING as E, LOG_LEVEL as L, StylingService as S, ControllerRegistryService as a, ControllerTranslationService as b, bindElementAttributes as c, bindElementChangeToModelProperty as d, bindElementChangeToModel as e, getSlots as f, getClosestParentElement as g, getSlotContent as h, isAttributePresentOnElement as i, removeElementChildren as j, removeElementChildNodes as k, convertCSSTimeToMs as l, extractChain as m, bindChain as n, promisifyEventDispatch as o, promisifyEventEmit as p, createDomMap as q, removeSlotInfoFromElement as r, setElementValue as s, diffDomMap as t, stringToHTML as u, EVENT_CONFIG_GET_IDENTITY as v, EVENT_CONFIG_GET_LOG_LEVEL as w, EVENT_CONFIG_GET_CORE_TYPE as x, EVENT_CONFIG_GET_DOCS_SOURCE as y, EVENT_CONFIG_GET_TRANSLATIONS as z };
