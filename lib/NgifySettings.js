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
        moduleName: 'ngify',
        outputTemplate: "angular.module('{moduleName}').run(" +
        "['$templateCache', function($templateCache){" +
        "$templateCache.put('{templateName}','{html}')}])"
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