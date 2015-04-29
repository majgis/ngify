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
    var details = this._getDetails(fileContents, annotationKey);
    fileContents = details.fileContents;
    if (details.annotation) {
        var appended = this._getAppended(details);
        if (appended) {
            fileContents += appended;
        }
    }
    return fileContents
};

NgifyJsStreamReader.prototype._getAppended = function (details) {
    var inject = details.annotation.inject ? details.annotation.inject : details.paramNames;
    return format(
        '\n' +
        this._settings.getValue('moduleTemplate') +
        this._settings.getValue('jsTemplates')[details.annotation.type],
        {
            type: details.annotation.type,
            name: details.annotation.name,
            inject: (inject && inject.length) ? "'" + inject.join("', '") + "', " : '',
            moduleName: this._settings.getValue('moduleName')
        }
    )
};

// Extract annotation and injectables from string using falafel
NgifyJsStreamReader.prototype._getDetails = function (fileContents, annotationKey) {
    var properties;
    var functionParamsMap = {};
    var functionName;
    fileContents = falafel(fileContents, function (node) {



        // Annotation
        if (node.type === 'MemberExpression' && node.property && node.property.value === annotationKey) {
            properties = node.parent.right.properties;

            //Delete Annotation
            node.parent.parent.update('');
        }

        //Function is declared on its own
        else if (node.type === 'FunctionDeclaration' && node.id.name) {
            functionParamsMap[node.id.name] = node.params;
        }

        //Function is assigned to a variable
        else if (node.type === 'VariableDeclarator' && node.init.type === 'FunctionExpression') {
            functionParamsMap[node.id.name] = node.init.params;
        }

        //Module.exports
        else if (node.type === 'AssignmentExpression' && node.left.property && node.left.property.name === 'exports') {

            // Assigned variable or already declared function
            if (node.right && node.right.name) {
                functionName = node.right.name;
            }

            // Assigned with function expression
            else if (node.right && node.right.id && node.right.id.name){
                functionName = node.right.id.name;
                functionParamsMap[functionName] = node.right.params;
            }
        }
    });

    //Extract Function Signature
    var params = functionParamsMap[functionName];
    var paramNames;
    if (params) {
        paramNames = params.map(function (param) {
            return param.name;
        });
    }

    if (properties) {
        var annotation = {};
        properties.forEach(function (property) {

            var value;
            var type = property.value.type;
            if (type === 'Literal') {
                value = [property.value.value];
            } else if (type === 'ArrayExpression') {
                value = [];
                property.value.elements.forEach(function (element) {
                    value.push(element.value);
                });
            }
            annotation[property.key.name] = value;
        });
        return {
            annotation: annotation,
            paramNames: paramNames,
            fileContents: fileContents
        };
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