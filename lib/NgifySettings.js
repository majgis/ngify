var q = require('q');
var path = require('path');
var fs = require('fs');
var NgifySettingsCompiler = require('./NgifySettingsCompiler');

function NgifySettings(filePath) {
    this._filePath = filePath;
}

NgifySettings.prototype._getPackageSummaryPromise = function (dirname, parentDeferred) {
    var self = this;
    var deferred = parentDeferred ? parentDeferred : q.defer();
    dirname = (dirname ? dirname: this._filePath) + path.sep;

    var packageJsonDeferred = q.defer();
    var indexJsDeferred = q.defer();
    var packageJsonPath = dirname + 'package.json';
    fs.exists(packageJsonPath, packageJsonDeferred.resolve);
    fs.exists(dirname + 'index.js', indexJsDeferred.resolve);

    q.all([
        packageJsonDeferred.promise,
        indexJsDeferred.promise
    ]).spread(function (packageJsonExists, indexJsExists) {
        if (packageJsonExists || indexJsExists) {
            deferred.resolve({
                dirname: dirname,
                packageJsonExists: packageJsonExists,
                indexJsExists: indexJsExists,
                packageJsonPath: packageJsonPath
            });
        } else {
            self._getPackageSummaryPromise(path.dirname(dirname), deferred);
        }
    });

    return deferred.promise;
};

NgifySettings.prototype._getPackageJsonPromise = function () {
    var self = this;

    if (!this._packageJsonPromise) {
        var deferred = q.defer();
        this._getPackageSummaryPromise().then(function(packageSummary){

        });
        this._packageJsonPromise = deferred.promise;
    }
    return this._packageJsonPromise;
};

NgifySettings.prototype.getSettingsPromise = function () {
    var self = this;

    if (!this._settingsPromise) {
        var deferred = q.defer();
        this._settingsPromise = deferred.promise;

        q.all([
            this._getPackageSummaryPromise(),
            this._getPackageJsonPromise()
        ]).spread(function (packageSummary, packageJson) {
            var ngifySettingsCompiler = new NgifySettingsCompiler(packageSummary, packageJson, self._filePath);
            deferred.resolve(ngifySettingsCompiler.getSettings());
        });
    }

    return this._settingsPromise;
};

module.exports = NgifySettings;