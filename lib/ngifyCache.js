/**
 * A cache object for storing any key value pair
 * @constructor
 */
function NgifyCache() {
    this._cache = {};
}

/**
 * Set a value in the cache
 * @param key A unique key for identification
 * @param value
 */
NgifyCache.prototype.setValue = function (key, value) {
    this._cache[key] = value;
};

/**
 * Get a value from the cache
 * @param key  A unique key for identification
 * @returns {*}
 */
NgifyCache.prototype.getValue = function (key) {
    return this._cache[key];
};

/**
 * Completely flush the cache
 */
NgifyCache.prototype.clearAll = function () {
    this._cache = {}
};

/**
 * @type {NgifyCache} A single shared instance
 */
module.exports = new NgifyCache();
