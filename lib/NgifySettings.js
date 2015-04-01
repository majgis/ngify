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
    this._settings = {
        templateName: path.basename(filePath),
        minifyArgs: {
            collapseWhitespace: true,
            conservativeCollapse: true
        },
        disableJs: true,
        disableHtml: false,
        htmlExtension: '.html',
        jsExtension: '.js',
        jsAnnotation: '@ng',
        moduleName: 'ngify',
        outputTemplate: moduleTemplate + ".run(" +
        "['$templateCache', function($templateCache){" +
        "$templateCache.put('{templateName}','{html}')}])",
        jsTemplates: {
            provider: moduleTemplate +
            ".provider('{name}', [ {inject} {exports} ] );",
            factory: moduleTemplate +
            ".factory('{name}', [ {inject} {exports} ] );",
            service: moduleTemplate +
            ".service('{name}', [ {inject} {exports} ] )",
            value: moduleTemplate +
            ".value('{name}', {exports} )",
            constant: moduleTemplate +
            ".constant('{name}', {exports} )",
            animation: moduleTemplate +
            ".animation('{name}',[ {inject} {exports} ] )",
            filter: moduleTemplate +
            ".filter('{name}', [ {inject} {exports} ] )",
            controller: moduleTemplate +
            ".controller('{name}', [ {inject} {exports} ] )",
            directive: moduleTemplate +
            ".directive('{name}', [ {inject} {exports} ] )",
            config: moduleTemplate +
            ".config([ {inject} {exports} ])",
            run: moduleTemplate +
            ".run([ {inject} {exports} ])"
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