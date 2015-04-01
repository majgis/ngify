var NgifyHtmlStreamReader = require('./NgifyHtmlStreamReader');
var NgifyJsStreamReader = require('./NgifyJsStreamReader');
var NgifySettings = require('./NgifySettings');

function NgifyStreamReaderFactory() {

}

NgifyStreamReaderFactory.prototype.create = function (filePath, userSettings) {
    var settings = new NgifySettings(filePath, userSettings);
    var streamReader = null;

    if (this._isHtmlFile(filePath, settings)) {
        streamReader = new NgifyHtmlStreamReader(filePath, settings);
    } else if (this._isJsFile(filePath, settings)) {
        streamReader = new NgifyJsStreamReader(filePath, settings);
    }
    return streamReader;
};

// Return true if a valid html file
NgifyStreamReaderFactory.prototype._isHtmlFile = function (filePath, settings) {
    if (settings.getValue('disableHtml')) {
        return false;
    }
    var extension = settings.getValue('htmlExtension');
    return this._endsWith(filePath, extension);
};

// Return true if a valid js file and js is not disabled
NgifyStreamReaderFactory.prototype._isJsFile = function (filePath, settings) {
    if (settings.getValue('disableJs')) {
        return false;
    }
    var extension = settings.getValue('jsExtension');
    return this._endsWith(filePath, extension);
};

NgifyStreamReaderFactory.prototype._endsWith = function (value, extension) {
    return value.indexOf(extension, value.length - extension.length) !== -1;
};


exports = module.exports = new NgifyStreamReaderFactory();