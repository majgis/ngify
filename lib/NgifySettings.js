var path = require('path');

/**
 * Default settings with optional to userSettings to overwrite specific values
 *
 * @param filePath Full path to file
 * @param userSettings Optional object with settings overrides
 * @constructor
 */
function NgifySettings(filePath, userSettings) {
    userSettings = userSettings ? userSettings : {};

    var moduleTemplate = "angular.module('{moduleName}')";

    var namedJsTemplate = ".{type}('{name}', module.exports )";
    var namedInjectableJsTemplate = ".{type}('{name}', [ {inject} module.exports ] );";
    var injectableJsTemplate = ".{type}([ {inject} module.exports ])";

    this._settings = {

        moduleName: 'ngify',

        htmlName: path.basename(filePath),
        htmlMinifyArgs: {
            collapseWhitespace: true,
            conservativeCollapse: true
        },
        htmlExtension: '.html',
        htmlTemplate: moduleTemplate + ".run(" +
        "['$templateCache', function($templateCache){" +
        "$templateCache.put('{htmlName}','{html}')}])",

        jsExtension: '.js',
        jsAnnotation: '@ng',
        jsTemplates: {
            provider: moduleTemplate + namedInjectableJsTemplate,
            factory: moduleTemplate + namedInjectableJsTemplate,
            service: moduleTemplate + namedInjectableJsTemplate,
            value: moduleTemplate + namedJsTemplate,
            constant: moduleTemplate + namedJsTemplate,
            animation: moduleTemplate + namedInjectableJsTemplate,
            filter: moduleTemplate + namedInjectableJsTemplate,
            controller: moduleTemplate + namedInjectableJsTemplate,
            directive: moduleTemplate + namedInjectableJsTemplate,
            config: moduleTemplate + injectableJsTemplate,
            run: moduleTemplate + injectableJsTemplate
        }
    };

    this._loadUserSettings(userSettings);
}

//Iterate settings and overwrite with userSetings if they exist
NgifySettings.prototype._loadUserSettings = function (userSettings) {
    var settings = this._settings;
    for (var key in settings) {
        if (settings.hasOwnProperty(key)) {
            var userSetting = userSettings[key];
            settings[key] = userSetting ? userSetting : settings[key];
        }
    }
    this._settings = settings;
};

/**
 * Get value associated with key
 * @param key Unique identifer for value
 * @returns {*} value
 */
NgifySettings.prototype.getValue = function (key) {
    return this._settings[key];
};

module.exports = NgifySettings;