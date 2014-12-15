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
    this._dirName = path.dirname(this._filePath);
}


// Constants
NgifySettings.prototype.JSON_SUFFIX = path.sep + 'package.json';
NgifySettings.prototype.INDEX_SUFFIX = path.sep + 'index.js';
NgifySettings.prototype.PACKAGE_SUMMARY_SUFFIX = '.packageSummaryPromise';
NgifySettings.prototype.PACKAGE_JSON_SUFFIX = '.packageJsonSuffix';

// Recursively searches for package directory
NgifySettings.prototype._recursivelyFindPackage = function (dirName, deferred) {
    var self = this;

    var jsonExistsDeferred = Q.defer();
    var jsonPath = dirName + this.JSON_SUFFIX;
    fs.exists(jsonPath, jsonExistsDeferred.resolve);

    var indexExistsDeferred = Q.defer();
    var indexPath = dirName + this.INDEX_SUFFIX;
    fs.exists(indexPath, indexExistsDeferred.resolve);

    Q.all([
        jsonExistsDeferred.promise,
        indexExistsDeferred.promise
    ]).spread(function (packageJsonExists, indexJsExists) {
        if (packageJsonExists || indexJsExists) {
            deferred.resolve({
                packagePath: dirName,
                packageJsonExists: packageJsonExists,
                indexJsExists: indexJsExists,
                packageJsonPath: jsonPath
            });
        } else {
            var parentDirName = path.dirname(dirName);
            var cacheKey = parentDirName + self.PACKAGE_SUMMARY_SUFFIX;
            var cachedPromise = ngifyCache.getValue(cacheKey);
            if (cachedPromise) {
                cachedPromise.then(function (packageSummary) {
                    deferred.resolve(packageSummary);
                });
            } else {
                ngifyCache.setValue(cacheKey, deferred.promise);
                self._recursivelyFindPackage(parentDirName, deferred);
            }
        }
    });
};


// Returns details about the containing package
NgifySettings.prototype._getPackageSummaryPromise = function () {
    if (!this._packageSummaryPromise) {
        var cacheKey = this._dirName + this.PACKAGE_SUMMARY_SUFFIX;
        var cachedPromise = ngifyCache.getValue(cacheKey);

        if (cachedPromise) {
            this._packageSummaryPromise = cachedPromise;
        } else {
            var deferred = Q.defer();
            this._packageSummaryPromise = deferred.promise;
            ngifyCache.setValue(cacheKey, deferred.promise);

            this._recursivelyFindPackage(this._dirName, deferred);
        }
    }
    return this._packageSummaryPromise;
};


// Returns package.json object if it exists, or an empty object if it doesn't
NgifySettings.prototype._getPackageJsonPromise = function () {
    if (!this._packageJsonPromise) {
        var cacheKey = this._dirName + this.PACKAGE_JSON_SUFFIX;
        var cachedPromise = ngifyCache.getValue(cacheKey);
        if (cachedPromise) {
            this._packageJsonPromise = cachedPromise;
        } else {
            var deferred = Q.defer();
            this._packageJsonPromise = deferred.promise;
            ngifyCache.setValue(cacheKey, deferred.promise);

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

        }

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