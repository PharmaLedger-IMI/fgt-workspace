let SUPPORTED = {
    en_US: "en_US"
};

/**
 * This service needs a Global called LOCALE with the locale strings as such:
 * <pre>{
 *     "en_US": {
 *         "pageX": {
 *             "key1": "...",
 *             "component1": {
 *                 "title": "...",
 *                 "placeholder": "..."
 *             }
 *         },
 *         "pageY": {...}
 *     },
 *     "pt_PT": {
 *         "pageX": {
 *             "key1": "...",
 *             "component1": {
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
     * Binds the locale object the the controller's model so it's accessible in every controller
     * @param {Object} model
     */
    this.bindToModel = function(model){
        if (!model || typeof model !== 'object')
            throw new Error("Model is not suitable for locale binding");
        model.locale = localeObj;
        return model;
    }

    this.loadLocale(lang);
}

let bindToController = function(controller){
    if (!controller.localized) {
        let func = controller.setModel;
        controller.setModel = function (model) {
            localeService.bindToModel(model);
            return func(model);
        };
        controller.localized = true;
    }
}

let localeService;

module.exports = {
    /**
     * Returns the instance of the LocaleService and binds the SetModel method of the controller to always include the locale info
     * @param {SUPPORTED} lang: the language to use
     * @param {ContainerController} controller: the current controller
     * @returns {LocaleService}
     */
    getInstance: function (lang, controller){
        if (!localeService)
            localeService = new LocaleService(lang);
        bindToController(controller);
        return localeService;
    },
    supported: {...SUPPORTED}
}