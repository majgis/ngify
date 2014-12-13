var Q = require('q');
var path = require('path');
var fs = require('fs');
var NgifySettingsCompiler = require('./NgifySettingsCompiler');
var ngifyCache = require('./ngifyCache');


/**
 * Ngify settings
 * @param filePath Absolute file path with extension
 * @constructor
 */
function NgifySettings(filePath) {
    this._filePath = filePath;
}


// Returns package details about a directory, called recursively
NgifySettings.prototype._getPackageSummaryPromise = function (dirname, parentDeferred) {
    var self = this;
    var deferred = parentDeferred ? parentDeferred : Q.defer();
    dirname = (dirname ? dirname : this._filePath) + path.sep;

    var packageJsonExistsDeferred = Q.defer();
    var indexJsExistsDeferred = Q.defer();
    var packageJsonPath = dirname + 'package.json';
    fs.exists(packageJsonPath, packageJsonExistsDeferred.resolve);
    fs.exists(dirname + 'index.js', indexJsExistsDeferred.resolve);

    Q.all([
        packageJsonExistsDeferred.promise,
        indexJsExistsDeferred.promise
    ]).spread(function (packageJsonExists, indexJsExists) {
        if (packageJsonExists || indexJsExists) {
            deferred.resolve({
                packagePath: dirname,
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


// Returns package.json object if it exists, or an empty object if it doesn't
NgifySettings.prototype._getPackageJsonPromise = function () {
    if (!this._packageJsonPromise) {
        var deferred = Q.defer();
        this._getPackageSummaryPromise().then(function (packageSummary) {
            if (packageSummary.packageJsonExists) {
                fs.readFile(packageSummary.packageJsonPath, 'utf8', function (err, data) {
                    if (err) {
                        throw err;
                    }
                    deferred.resolve(JSON.parse(data));
                });
            } else {
                deferred.resolve({})
            }
        });
        this._packageJsonPromise = deferred.promise;
    }
    return this._packageJsonPromise;
};


/**
 * The promise resolves to a Ngify settings object
 * @returns {promise|*|Q.promise}
 */
NgifySettings.prototype.getSettingsPromise = function () {
    var self = this;

    if (!this._settingsPromise) {
        var deferred = Q.defer();
        this._settingsPromise = deferred.promise;

        Q.all([
            this._getPackageSummaryPromise(),
            this._getPackageJsonPromise()
        ]).spread(function (packageSummary, packageJson) {
            var ngifySettingsCompiler = new NgifySettingsCompiler(packageSummary, packageJson, self._filePath);
            deferred.resolve(ngifySettingsCompiler.getSettings());
        });
    }

    return this._settingsPromise;
};

/**
 * @type {NgifySettings} An instantiable class
 */
module.exports = NgifySettings;