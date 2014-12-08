Ngify = require('./Ngify');
through = require('through');

function ngifyTransform(file) {

    var ngify = new Ngify(file);

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

module.exports = ngifyTransform;