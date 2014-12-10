var path = require('path');

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

NgifySettingsCompiler.prototype._getModuleName = function () {
    return this._packageJson.name ?
        this._packageJson.name :
        path.basename(this._packageSummary.packagePath);
};

NgifySettingsCompiler.prototype._getTemplateName = function () {
    return this._fileName;
};

NgifySettingsCompiler.prototype._getMinifyArgs = function () {
    return this._userConfig.minifyArgs ?
        this._userConfig.minifyArgs :
        this._minifyArgs;
};

NgifySettingsCompiler.prototype.getSettings = function () {
    return {
        moduleName: this._getModuleName(),
        templateName: this._getTemplateName(),
        minifyArgs: this._getMinifyArgs()
    };
};
module.exports = NgifySettingsCompiler;