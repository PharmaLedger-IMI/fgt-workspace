/**
 * @namespace Locale
 * @memberOf Services
 */

/**
 * This service depends on WebCardinal's translation API
 *
 * Integrates with {@link WebCardinal}'s translation model, and natively integrates into controllers and their model
 * @function LocaleService
 * @memberOf Locale
 */
function LocaleService(){
    if (!WebCardinal)
        throw new Error("Could not find WebCardinal");

    const supported = [];

    const getLocale = () => WebCardinal.language;

    const setLocale = (locale) => {
        if (!(locale in supported))
            throw new Error("Provided locale not supported");
        WebCardinal.language = locale;
        this.loadLocale();
    }

    const _genSupported = () => {
        Object.keys(WebCardinal.translations).forEach(a => {
            supported.push(a);
        })
    };

    _genSupported();

    /**
     * Loads the current locale
     */
    this._loadLocale = function(controller){
        return controller.translationModel;
    }

    /**
     *
     * @param model
     * @param translationKey
     * @return {*}
     */
    const parseTranslationModel = function(model, translationKey){
        const index = translationKey.indexOf('.');
        if (index === -1)
            return model[translationKey];

        return parseTranslationModel(model[translationKey.substring(0, translationKey.indexOf('.'))],
            translationKey.substring(index + 1));
    }

    /**
     * Retrieves the translation information from WebCardinal
     * @param {string} pageName if contains '.' it will be translated into hierarchy in json object (just one level currently supported)
     * @param {WebcController} controller
     * @returns {object} the translation object for the provided page in the current language
     */
    this.getByPage = function(pageName, controller){
        let locale = this._loadLocale(controller);
        if (!locale){
            console.log("no locale set");
            return {};
        }

        locale = locale.toObject();
        if (!pageName)
            return locale;
        if (pageName.includes("."))
            return parseTranslationModel(locale, pageName);
        return locale[pageName];
    }
}

/**
 * Util function to merge JSON objects according to a specified priority
 * @memberOf Locale
 */
const merge = function(target, source){
    for (const key of Object.keys(source))
        if (source[key] instanceof Object)
            Object.assign(source[key], merge(target[key] ? target[key] : {}, source[key]))
    Object.assign(target || {}, source)
    return target;
}

/**
 * Util function to provide string format functionality similar to C#'s string.format
 *
 * @param {string} string
 * @param {string} args replacements made by order of appearance (replacement0 wil replace {0} and so on)
 * @return {string} formatted string
 * @memberOf Locale
 */
const stringFormat = function(string, ...args){
    return string.replace(/{(\d+)}/g, function(match, number) {
        return typeof args[number] != 'undefined'
            ? args[number]
            : match;
    });
}

/**
 * Binds the translation model to the controller and its setModel method
 * @memberOf Locale
 */
const bindToController = function(controller, page){
    if (!controller.localized) {
        let getter = controller.initializeModel;
        controller.initializeModel = () => {
            let locale = localeService.getByPage(page, controller);
            if (!locale){
                console.log(`No translations found for page ${page}`);
                return getter();
            }
            locale = JSON.parse(JSON.stringify(locale));
            let model = getter();
            return merge(locale, model);
        };

        let translator = controller.translate;
        controller.translate = (key, ...args) => {
            const translation = translator.call(controller, page && page.length > 0 ? `${page}.${key}` : key);
            return translation && args && args.length ? stringFormat(translation, ...args) : translation;
        }

        controller.localized = true;
    }
}

let localeService;

module.exports = {
    /**
     * Returns the instance of the LocaleService and binds the locale info to the controller via {@link bindToController}
     * @param {WebcController} controller: the current controller
     * @param {string} page: the name of the view. Must match an existing key in {@link WebCardinal#translations}
     * @returns {LocaleService}
     * @memberOf Locale
     */
    bindToLocale: function (controller, page){
        if (!localeService)
            localeService = new LocaleService();
        bindToController(controller, page);
        return localeService;
    }
}