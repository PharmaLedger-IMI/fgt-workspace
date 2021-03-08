/**
 * @module fgt-dsu-wizard.services
 */
let SUPPORTED = {
    en_US: "en_US"
};

/**
 * This service needs a Global called LOCALE with the locale strings as such:
 * <pre>{
 *     "en_US": {
 *         "pageX": {
 *             "stringKey1": "...",
 *             "formComponent1": {
 *                 "title": "...",
 *                 "placeholder": "..."
 *             }
 *         },
 *         "pageY": {...}
 *     },
 *     "pt_PT": {
 *         "pageX": {
 *             "stringKey1": "...",
 *             "formComponent1": {
 *                 "title": "...",
 *                 "placeholder": "..."
 *             }
 *         },
 *         "pageY": {...}
 *     }
 * }</pre>
 * <strong>locale.js should be included in index.html via</strong>
 * <pre>
 *     <script src="resources/locale/locale.js"></script>
 * </pre>
 * And will provide access to the strings via '@locale.pageX.key1'
 * @param {SUPPORTED} lang
 */
function LocaleService(lang){
    let _genSupported = function(){
        if (!LOCALE)
            throw new Error("Could not find Locale Resource");
        let available = Object.keys(LOCALE);
        available.forEach(a => {
            SUPPORTED[a] = a;
        })
    };

    _genSupported();

    lang = lang || SUPPORTED.en_US;
    let localeObj;

    /**
     * Loads the selected locale
     * @param {SUPPORTED} locale
     */
    this.loadLocale = function(locale){
        if (!SUPPORTED.hasOwnProperty(locale))
            throw new Error("Unsupported Locale");
        localeObj = LOCALE[locale];
    }

    /**
     * binds the SetModel method of the controller to always include the locale info in one of two ways:
     *  <ul>
     *     <li>No page is provided: The model will have the whole locale object under the 'locale' key</li>
     *     <li>A page is provided: the entries under that key will be applied directly to the model, being overwritten by the provided model<br>
     *         Useful for forms</li>
     * </ul>
     * @param {Object} model
     * @param {string} [page]
     */
    this.bindToModel = function(model, page){
        if (!model || typeof model !== 'object')
            throw new Error("Model is not suitable for locale binding");
        if (!page)
            model.locale = JSON.parse(JSON.stringify(localeObj));
        else {
            let tempObj = JSON.parse(JSON.stringify(localeObj[page]));
            model = merge(tempObj, JSON.parse(JSON.stringify(model)));
        }
        return model;
    }

    this.loadLocale(lang);
}


const merge = function(target, source){
    for (const key of Object.keys(source))
        if (source[key] instanceof Object)
            Object.assign(source[key], merge(target[key] ? target[key] : {}, source[key]))
    Object.assign(target || {}, source)
    return target;
}

const bindToController = function(controller, page){
    if (!controller.localized) {
        let func = controller.setModel;
        let m = controller.model;
        controller.setModel = function (model) {
            model = localeService.bindToModel(model, page);
            return func(model);
        };
        controller.setModel(m ? m : {});
        controller.localized = true;
    }
}

let localeService;

module.exports = {
    /**
     * Returns the instance of the LocaleService and binds the locale info to the controller via {@link LocaleService#bindToModel}
     * @param {ContainerController} controller: the current controller
     * @param {SUPPORTED} locale: the supported language to use
     * @param {string} [page]: the name of the view. Must match an existing key in LOCALE
     * @returns {LocaleService}
     */
    bindToLocale: function (controller,locale, page){
        if (!localeService)
            localeService = new LocaleService(locale);
        bindToController(controller, page);
        return localeService;
    },
    supported: {...SUPPORTED}
}