NgifyStreamReader = require('./NgifyStreamReader');
through = require('through');

/**
 * A Browserify transform for converting html to Angular $templateCache
 * @param filePath Absolute file path with extension
 * @param settings User settings object
 * @returns {*|exports} Writable stream
 */
function ngify(filePath, settings) {

    var ngifyStreamReader = new NgifyStreamReader(filePath, settings);

    if (!ngifyStreamReader.isValidFile()) {
        return through();
    }

    function write(chunk) {
        ngifyStreamReader.write(this, chunk);
    }

    function end() {
        ngifyStreamReader.end(this);
    }

    return through(write, end);
}

module.exports = ngify;