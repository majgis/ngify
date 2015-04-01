var streamReaderFactory = require('./ngifyStreamReaderFactory');
through = require('through');

/**
 * A Browserify transform for creating an Angular module
 * @param filePath Absolute file path with extension
 * @param settings User settings object
 * @returns {*|exports} Writable stream
 */
function ngify(filePath, settings) {

    var streamReader = streamReaderFactory.create(filePath, settings);

    if (!streamReader) {
        return through();
    }

    function write(chunk) {
        streamReader.write(this, chunk);
    }

    function end() {
        streamReader.end(this);
    }

    return through(
        write,
        end
    );
}

module.exports = ngify;