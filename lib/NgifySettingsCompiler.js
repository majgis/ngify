function NgifySettingsCompiler(packageSummary, packageJson, filePath) {
    this._filePath = filePath;
    this._fileName = path.basename(this._filePath);
    this._userConfig = packageJson;
    this._packageSummary = packageSummary;
    this._packageJson = packageJson;
    this._minifyArgs = {
        collapseWhitespace: true,
        conservativeCollapse: true
    };
}

NgifySettingsCompiler.prototype._getModuleName = function () {
    return this._fileName;
};

NgifySettingsCompiler.prototype._getTemplateName = function () {

};

NgifySettingsCompiler.prototype._getMinifyArgs = function () {

};

NgifySettingsCompiler.prototype.getSettings = function () {
    return {
        moduleName: this._getModuleName(),
        templateName: this._getTemplateName(),
        minifyArgs: this._getMinifyArgs()
    };
};
module.exports = NgifySettingsCompiler;