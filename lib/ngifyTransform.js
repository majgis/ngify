Ngify = require('./Ngify');
through = require('through');
ngifyCache = require('./ngifyCache');


/**
 * A Browserify transform for converting .html to Angular $templateCache
 * @param filePath Absolute file path with extension
 * @returns {*|exports} Writable stream
 */
function ngifyTransform(filePath) {

    var ngify = new Ngify(filePath);

    if (!ngify.isValidFile()) {
        return through();
    }

    function write(chunk) {
        ngify.write(this, chunk);
    }

    function end() {
        ngify.end(this);
    }

    return through(write, end);
}


/**
 * Completely clear the cache
 */
ngifyTransform.clearCache = function () {
    ngifyCache.clearAll();
};


module.exports = ngifyTransform;