var path = require('path');


/**
 * Assembles separate information into a single Ngify settings object
 * @param packageSummary An object with details about a package
 *      packagePath: Absolue path to package.json
 *
 * @param packageJson A node.js package.json object
 * @param filePath Absolute file path with extension
 * @constructor
 */
function NgifySettingsCompiler(packageSummary, packageJson, filePath) {
    this._filePath = filePath;
    this._fileName = path.basename(this._filePath);
    this._userConfig = packageJson.ngify ? packageJson.ngify : {};
    this._packageSummary = packageSummary;
    this._packageJson = packageJson;
    this._minifyArgs = {
        collapseWhitespace: true,
        conservativeCollapse: true
    };
}


// Name registered with Angular for the module containing the template
NgifySettingsCompiler.prototype._getModuleName = function () {
    var moduleName = this._packageJson.name ?
        this._packageJson.name :
        path.basename(this._packageSummary.packagePath);

    return this._userConfig.moduleName ?
        this._userConfig.moduleName :
        moduleName
};


// Name registered with Angular for the template
NgifySettingsCompiler.prototype._getTemplateName = function () {
    return this._fileName;
};


// Html minification arguments
NgifySettingsCompiler.prototype._getMinifyArgs = function () {
    return this._userConfig.minifyArgs ?
        this._userConfig.minifyArgs :
        this._minifyArgs;
};


/**
 * Ngify settings object
 * @returns {{
 *  moduleName: *,
 *  templateName: *,
 *  minifyArgs: *
 * }}
 */
NgifySettingsCompiler.prototype.getSettings = function () {
    return {
        moduleName: this._getModuleName(),
        templateName: this._getTemplateName(),
        minifyArgs: this._getMinifyArgs()
    };
};
module.exports = NgifySettingsCompiler;