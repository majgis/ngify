var format = require('string-template');
var path = require('path');
var minify = require('html-minifier').minify;
var NgifySettings = require('./NgifySettings');

function Ngify(filePath) {
    this._filePath = filePath;
    this._extension = '.html';
    this._output = "angular.module('{moduleName}').run(['$templateCache', function($templateCache){$templateCache.put('{templateName}','{html}')}])";
    this._chunks = [];
    this._settings = new NgifySettings(filePath);
}

Ngify.prototype.isValidFile = function () {
    return path.extname(this._filePath) === this._extension;
};

Ngify.prototype.write = function (stream, chunk) {
    this._chunks.push(chunk);
};

Ngify.prototype.end = function (stream) {
    var self = this;
    this._settings.getSettingsPromise().then(function (settings) {
        var html = minify(self._chunks.join('').replace(/\r?\n|\r/g, " "), settings.minifyArgs);
        var result = format(self._output, {
            html: html.replace(/'/g, "\\'"),
            moduleName: settings.moduleName,
            templateName: settings.templateName
        });

        stream.queue(result);
        stream.queue(null);
    });
};

module.exports = Ngify;