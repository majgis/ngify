var format = require('string-template');
var minify = require('html-minifier').minify;
var NgifySettings = require('./NgifySettings');

/**
 * A stream handler for converting .html streams to Angular $templateCache
 * @param filePath Absolute file path with extension.
 * @constructor
 */
function NgifyStreamReader(filePath, settings) {
    this._filePath = filePath;
    this._chunks = [];
    this._settings = new NgifySettings(filePath, settings);
}

/**
 * Returns true if the file can be processed
 * @returns {boolean}
 */
NgifyStreamReader.prototype.isValidFile = function () {
    var ext = this._settings.getValue('extension');
    var filePath = this._filePath;
    return filePath.indexOf(ext, filePath.length - ext.length) !== -1;
};

/**
 * Write chunks of data to stream
 * @param stream The stream upon which the queue method can be called
 * @param chunk A data chunk
 */
NgifyStreamReader.prototype.write = function (stream, chunk) {
    this._chunks.push(chunk);
};

// Compile the output JavaScript
NgifyStreamReader.prototype._getOutput = function(){
    var settings = this._settings;
    var html = minify(this._chunks.join('')
        .replace(/\r?\n|\r/g, " "), settings.getValue('minifyArgs'));

    return format(settings.getValue('outputTemplate'), {
        html: html.replace(/'/g, "\\'"),
        moduleName: settings.getValue('moduleName'),
        templateName: settings.getValue('templateName')
    });
};

/**
 * Called at the end of the stream, after last call to write
 * @param stream The stream upon which the queue method can be called
 */
NgifyStreamReader.prototype.end = function (stream) {
    var output = this._getOutput();
    stream.queue(output);
    stream.queue(null);
};

module.exports = NgifyStreamReader;