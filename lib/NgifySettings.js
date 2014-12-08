var q = require('q');
var path = require('path');
var fs = require('fs');

function NgifySettings(filePath) {
    this._filePath = filePath;
    this._fileName = path.basename(this._filePath);
    this._minifyArgs = {
        collapseWhitespace: true,
        conservativeCollapse: true
    };
}

NgifySettings.prototype._getPackageFilesPromise = function (dirname, parentDeferred) {
    var self = this;
    var deferred = parentDeferred ? parentDeferred : q.defer();
    dirname += path.sep;
    console.log(dirname);
    var packageJsonDeferred = q.defer();
    var indexJsDeferred = q.defer();

    fs.exists(dirname + 'package.json', packageJsonDeferred.resolve);
    fs.exists(dirname + 'index.js', indexJsDeferred.resolve);

    q.all([
        packageJsonDeferred.promise,
        indexJsDeferred.promise
    ]).spread(function (packageJsonExists, indexJsExists) {
        if (packageJsonExists && indexJsExists) {
            deferred.resolve({
                dirname: dirname,
                packageJsonExists: packageJsonExists,
                indexJsExists: indexJsExists
            });
        } else {
            self._getPackageFilesPromise(path.dirname(dirname), deferred);
        }
    });

    return deferred.promise;
};

NgifySettings.prototype._getPackageDirPromise = function () {
    var self = this;

    if (!this._packageDirectoryPromise) {

        var deferred = q.defer();

        this._getPackageFilesPromise(path.dirname(this._filePath)).then(function (packagePath) {
            deferred.resolve(packagePath);
        });

        this._packageDirectoryPromise = deferred.promise;
    }
    return this._packageDirectoryPromise;
};

NgifySettings.prototype._getPackageJsonPromise = function () {
    var self = this;

    if (!this._packageJsonPromise) {
        var deferred = q.defer();
        deferred.resolve('');
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
            this._getPackageDirPromise(),
            this._getPackageJsonPromise()
        ]).spread(function (packageDirectory, packageJson) {
            console.log('packageDirectory:', packageDirectory);
            var userConfig = packageJson && packageJson.ngify ? packageJson.ngify : {};

            var settings = {
                moduleName: self._fileName,
                templateName: userConfig.templateName,
                minifyArgs: self._minifyArgs
            };
            deferred.resolve(settings);
        });
    }

    return this._settingsPromise;
};

module.exports = NgifySettings;