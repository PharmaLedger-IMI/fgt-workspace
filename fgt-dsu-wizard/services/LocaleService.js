const LOCALE_PATH = "/resources/locale/";

const SUPPORTED = {
    en_US: "en_US"
}

/**
 * @param {DSUStorage} dsuStorage: the Controller's DSU Storage
 * @param {SUPPORTED} lang
 */
function LocaleService(dsuStorage, lang){
    lang = lang || SUPPORTED.en_US;
    let localeObj;

    /**
     * Loads the selected locale
     * @param {SUPPORTED} locale
     */
    this.loadLocale = function(locale){
        let path = `${LOCALE_PATH}${locale}.json`;
        let localeFile = dsuStorage.getObject(path, (err, result) => {
            if (err)
                throw new Error("Could not load locale file");
            console.log(`Loaded locale ${locale}`);
            localeObj = result;
        });
    }

    /**
     * Binds the locale object the the controller's model so it's accessible in every controller
     * @param {Object} model
     */
    this.bindToModel = function(model){
        if (!model || typeof model !== 'object')
            throw new Error("Model is not suitable for locale binding");
        model.locale = localeObj;
    }
    this.loadLocale(lang);
}

let localeService;

module.exports = {
    getInstance: function (dsuStorage, lang){
        if (!localeService)
            localeService = new LocaleService(dsuStorage, lang);
        return localeService;
    },
    supported: SUPPORTED
}