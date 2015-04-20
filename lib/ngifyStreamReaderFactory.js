var NgifyHtmlStreamReader = require('./NgifyHtmlStreamReader');
var NgifyJavaScriptStreamReader = require('./NgifyJavaScriptStreamReader');
var NgifySettings = require('./NgifySettings');

function NgifyStreamReaderFactory() {

}

NgifyStreamReaderFactory.prototype.create = function (filePath, userSettings) {
    var settings = new NgifySettings(filePath, userSettings);
    var streamReader = null;

    if (this._isHtmlFile(filePath, settings)) {
        streamReader = new NgifyHtmlStreamReader(filePath, settings);
    } else if (this._isJsFile(filePath, settings)) {
        streamReader = new NgifyJavaScriptStreamReader(filePath, settings);
    }
    return streamReader;
};

// Return true if a valid html file
NgifyStreamReaderFactory.prototype._isHtmlFile = function (filePath, settings) {
    var extension = settings.getValue('htmlExtension');
    return extension ? this._endsWith(filePath, extension) : false;
};

// Return true if a valid js file and js is not disabled
NgifyStreamReaderFactory.prototype._isJsFile = function (filePath, settings) {
    var extension = settings.getValue('jsExtension');
    return extension ? this._endsWith(filePath, extension) : false;
};

NgifyStreamReaderFactory.prototype._endsWith = function (value, extension) {
    return value.indexOf(extension, value.length - extension.length) !== -1;
};


exports = module.exports = new NgifyStreamReaderFactory();