var string = require('string');
var minify = require('html-minifier').minify;
var path = require('path');
var q = require('q');

var minifyArgs = {
    collapseWhitespace: true,
    conservativeCollapse: true
};

function Ngify(filePath) {
    this._filePath = filePath;
    this._extension = '.html';
    this._output = string('angular.module("{{moduleName}}").run(["$templateCache", function($templateCache){$templateCache.put("{{templateName}}","{{html}}")}])');
    this._chunks = [];

    //Prime the cache.  When this.end() is eventually called, everything is ready
    this._getEndPromise()
}


Ngify.prototype._getModuleNamePromise = function () {

    if (!this._moduleNamePromise) {
        var deferred = q.defer();
        deferred.resolve('MODULE_NAME');
        this._moduleNamePromise = deferred.promise;
    }

    return this._moduleNamePromise;
};

Ngify.prototype._getTemplateNamePromise = function () {
    if (!this._templateNamePromise) {
        var deferred = q.defer();
        deferred.resolve(path.basename(this._filePath));
        this._templateNamePromise = deferred.promise;
    }
    return this._templateNamePromise;
};

Ngify.prototype._getEndPromise = function () {

    if (!this._endPromise) {
        var deferred = q.defer();
        this._endPromise = deferred.promise;

        q.all([
            this._getModuleNamePromise(),
            this._getTemplateNamePromise()
        ]).spread(function (moduleName, templateName) {

            deferred.resolve({
                moduleName: moduleName,
                templateName: templateName
            });
        });
    }

    return this._endPromise;
};

Ngify.prototype.isValidFile = function () {
    return string(this._filePath).endsWith(this._extension);
};

Ngify.prototype.write = function (stream, chunk) {
    this._chunks.push(chunk);
};

Ngify.prototype.end = function (stream) {
    var self = this;
    var html = minify(self._chunks.join(''), minifyArgs);

    this._getEndPromise().then(function (asPromised) {

        var result = self._output.template({
            html: html,
            moduleName: asPromised.moduleName,
            templateName: asPromised.templateName
        }).toString();

        stream.queue(result);
        stream.queue(null);
    });
};

module.exports = Ngify;