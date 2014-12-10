var string = require('string');
var minify = require('html-minifier').minify;
var NgifySettings = require('./NgifySettings');

function Ngify(filePath) {
    this._filePath = filePath;
    this._extension = '.html';
    this._output = string('angular.module("{{moduleName}}").run(["$templateCache", function($templateCache){$templateCache.put("{{templateName}}","{{html}}")}])');
    this._chunks = [];
    this._settings = new NgifySettings(filePath);
}

Ngify.prototype.isValidFile = function () {
    return string(this._filePath).endsWith(this._extension);
};

Ngify.prototype.write = function (stream, chunk) {
    this._chunks.push(chunk);
};

Ngify.prototype.end = function (stream) {
    var self = this;
    this._settings.getSettingsPromise().then(function (settings) {
        var html = minify(self._chunks.join(''), settings.minifyArgs);
        var result = self._output.template({
            html: html,
            moduleName: settings.moduleName,
            templateName: settings.templateName
        }).toString();

        stream.queue(result);
        stream.queue(null);
    });
};

module.exports = Ngify;