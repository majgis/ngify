var falafel = require('falafel');

function NgifyJsStreamReader(filePath, settings) {
    this._chunks = [];
    this._settings = settings;
}

NgifyJsStreamReader.prototype.write = function (stream, chunk) {
    this._chunks.push(chunk);
};

NgifyJsStreamReader.prototype._processAnnotatedFile = function (fileContents) {
    var annotationKey = this._settings.getValue('jsAnnotation');
    var annotation = this._getAnnotation(fileContents, annotationKey);
    if (annotation) {
        var appended = this._getAppended(annotation);
        if (appended) {
            fileContents += appended;
        }
    }
    return fileContents
};

NgifyJsStreamReader.prototype._getAppended = function (annotation) {
    //Todo: convert annotation to js snippet
};

NgifyJsStreamReader.prototype._getAnnotation = function (fileContents, annotationKey) {
    var properties;
    falafel(fileContents, function (node) {
        if (node.property && node.property.value === annotationKey)
            properties = node.parent.right.properties
    });

    if (properties) {
        var annotation = {};
        properties.forEach(function (property) {
            annotation[property.key.name] = property.value.value
        });
        return annotation;
    }
};

NgifyJsStreamReader.prototype._getOutput = function () {
    var fileContents = this._chunks.join('');
    var jsAnnotation = this._settings.getValue('jsAnnotation');

    if (fileContents.indexOf(jsAnnotation) > -1) {
        fileContents = this._processAnnotatedFile(fileContents);
    }

    return fileContents
};

NgifyJsStreamReader.prototype.end = function (stream) {
    try {
        var output = this._getOutput();
        stream.queue(output);
        stream.queue(null);
    }
    catch (e) {
        stream.emit('error', e);
    }
};

module.exports = NgifyJsStreamReader;