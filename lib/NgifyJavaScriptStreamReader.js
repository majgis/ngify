var format = require('string-template');
var falafel = require('falafel');
var path = require('path');

function NgifyJsStreamReader(filePath, settings) {
    this._chunks = [];
    this._settings = settings;
    this._fileNameAndType = this._getNameAndTypeFromFilePath(filePath);
}

NgifyJsStreamReader.prototype.write = function (stream, chunk) {
    this._chunks.push(chunk);
};

NgifyJsStreamReader.prototype.end = function (stream) {
    try {
        var output = this._getOutput();
        stream.queue(output);
        stream.queue(null);
    }
    catch (e) {
        e.message = '(ngify) ' + e.message;
        stream.emit('error', e);
    }
};

/////////
//Private
/////////

//Returns object with name and type taken from filename
NgifyJsStreamReader.prototype._getNameAndTypeFromFilePath = function (filePath) {
    var basename = path.basename(filePath, this._settings.getValue('jsExtension'));
    var split = basename.split('.');

    var name;
    var type;
    if (split.length == 1) {
        name = basename
    } else if (split.length > 1) {
        name = split[0];
        type = split[1];
    }

    return {
        name: name,
        type: type
    };

};

NgifyJsStreamReader.prototype._processAnnotatedFile = function (fileContents) {
    var details = this._getDetails(fileContents);
    fileContents = details.fileContents;

    //If type is in file basename, create annotation if it doesn't exist and add type if it doesn't exist
    if (this._fileNameAndType.type) {
        details.annotation = details.annotation || {};
        details.annotation.type = details.annotation.type || this._fileNameAndType.type;
    }

    if (details.annotation) {

        //Get name from file basename if not in annotation
        details.annotation.name = details.annotation.name || this._fileNameAndType.name;

        var appended = this._getAppended(details);
        if (appended) {
            fileContents += appended;
        }
    }
    return fileContents
};

//Returns the JavaScript that should be appended to the file
NgifyJsStreamReader.prototype._getAppended = function (details) {

    //Return undefined if type is unknown
    var jsTemplate = this._settings.getValue('jsTemplates')[details.annotation.type];
    if (!jsTemplate) {
        return;
    }

    //use paramNames from function signature if inject parameter is not given
    var inject = details.annotation.inject ? details.annotation.inject : details.paramNames;

    //Return combined template with tokens replaced
    return format(
        '\n' + this._settings.getValue('moduleTemplate') + jsTemplate,
        {
            type: details.annotation.type,
            name: details.annotation.name,
            inject: (inject && inject.length) ? "'" + inject.join("', '") + "', " : '',
            moduleName: this._settings.getValue('moduleName')
        }
    )
};

// Extract annotation and injectables from string using falafel
NgifyJsStreamReader.prototype._getDetails = function (fileContents) {
    var annotationKey = this._settings.getValue('jsAnnotation');
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
        else if (node.type === 'FunctionDeclaration' && node.id && node.id.name) {
            functionParamsMap[node.id.name] = node.params;
        }

        //Function is assigned to a variable
        else if (node.type === 'VariableDeclarator' && node.init && node.init.type === 'FunctionExpression') {
            functionParamsMap[node.id.name] = node.init.params;
        }

        //Module.exports
        else if (node.type === 'AssignmentExpression' && node.left && node.left.property && node.left.property.name === 'exports') {

            // Assigned variable or already declared function
            if (node.right && node.right.name) {
                functionName = node.right.name;
            }

            // Assigned with function expression
            else if (node.right && node.right.id && node.right.id.name) {
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
    var annotation;

    if (properties) {
        annotation = {};

        properties.forEach(function (property) {

            var value;
            var type = property.value.type;

            if (type === 'Literal') {
                if (property.key.name === 'inject') {
                    value = [property.value.value];
                } else {
                    value = property.value.value;
                }
            } else if (type === 'ArrayExpression') {
                value = property.value.elements.map(function (element) {
                    return element.value;
                });
            }
            var keyName = property.key.name || property.key.value;
            annotation[keyName] = value;
        });
    }
    return {
        annotation: annotation,
        paramNames: paramNames,
        fileContents: fileContents
    };

};

//Returns true if the file name contains a type and a template was found for it
NgifyJsStreamReader.prototype._fileNameHasValidType = function(){
    return this._settings.getValue('jsTemplates')[this._fileNameAndType.type]
};

// Returns true if file contains annotation
NgifyJsStreamReader.prototype._containsAnnotation = function(fileContents){
    var jsAnnotationRegExp = this._settings.getValue('jsAnnotationRegExp');
    return jsAnnotationRegExp.test(fileContents);
};

NgifyJsStreamReader.prototype._getOutput = function () {
    var fileContents = this._chunks.join('');
    if ( this._containsAnnotation(fileContents) || this._fileNameHasValidType()) {
        fileContents = this._processAnnotatedFile(fileContents);
    }

    return fileContents;
};


module.exports = NgifyJsStreamReader;