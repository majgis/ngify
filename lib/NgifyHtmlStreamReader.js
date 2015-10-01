var format = require('string-template');
var minify = require('html-minifier').minify;

/**
 * A stream handler for converting .html streams to Angular $templateCache
 * @param filePath Absolute file path with extension.
 * @constructor
 */
function NgifyHtmlStreamReader(filePath, settings) {
    this._chunks = [];
    this._settings = settings;
}

/**
 * Write chunks of data to stream
 * @param stream The stream upon which the queue method can be called
 * @param chunk A data chunk
 */
NgifyHtmlStreamReader.prototype.write = function (stream, chunk) {
    this._chunks.push(chunk);
};

// Compile the output JavaScript
NgifyHtmlStreamReader.prototype._getOutput = function () {
    var settings = this._settings;
    var html = minify(
        this._chunks.join('').replace(/\r?\n|\r/g, " "),
        settings.getValue('htmlMinifyArgs')
    );

    var htmlName = settings.getValue('htmlName');

    return format(
        settings.getValue('moduleTemplate') +
        settings.getValue('htmlTemplate'),
        {
            html: html.replace(/'/g, "\\'"),
            moduleName: settings.getValue('moduleName'),
            htmlName: htmlName
        }
    ) + "\nmodule.exports = '" + htmlName + "';";
};

/**
 * Called at the end of the stream, after last call to write
 * @param stream The stream upon which the queue method can be called
 */
NgifyHtmlStreamReader.prototype.end = function (stream) {
    try {
        var output = this._getOutput();
        stream.queue(output);
        stream.queue(null);
    }
    catch (e) {
        e.message = '(ngify) ' + e.message;
        stream.emit('error', e);
    }
};

module.exports = NgifyHtmlStreamReader;