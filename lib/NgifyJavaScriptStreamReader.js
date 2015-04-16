var format = require('string-template');
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
    var inject = annotation.inject;
    return format(
        this._settings.getValue('moduleTemplate') +
        this._settings.getValue('jsTemplates')[annotation.type],
        {
            type: annotation.type,
            name: annotation.name,
            inject: (inject && inject.length) ? inject.join(', ') + ', ' : '',
            moduleName: this._settings.getValue('moduleName')
        }
    )
};

// Extract annotation from string using falafel
NgifyJsStreamReader.prototype._getAnnotation = function (fileContents, annotationKey) {
    var properties;
    falafel(fileContents, function (node) {
        if (node.property && node.property.value === annotationKey) {
            properties = node.parent.right.properties
        }
    });

    if (properties) {
        var annotation = {};
        properties.forEach(function (property) {

            var value;
            var type = property.value.type;
            if (type === 'Literal'){
                value = [property.value.value];
            } else if (type === 'ArrayExpression'){
                value = [];
                property.value.elements.forEach(function(element){
                    value.push(element.value);
                });
            }
            annotation[property.key.name] = value;
        });
        return annotation;
    }
};

//
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