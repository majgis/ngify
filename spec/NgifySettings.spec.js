var NgifySettings = require('../lib/NgifySettings');

describe('NgifySettings', function () {

    var filePath,
        settings,
        args,
        settingsCustom;

    beforeEach(function () {
        filePath = '/a/b/c/123.html';
        settingsCustom = new NgifySettings(filePath, args);
        args = {
            htmlExtension: 'customExtension',
            minifyArgs: {
                anything: 'customMinifyArg'
            },
            moduleName: 'customModuleName',
            outputTemplate: 'customOutputTemplate'
        };
        settings = new NgifySettings(filePath);
    });

    it('sets templateName with the file name', function () {
        expect(settings.getValue('templateName')).toEqual('123.html');
    });

    it('sets the default extension to .html', function () {
        expect(settings.getValue('htmlExtension')).toEqual('.html');
    });

    it('sets the default minify args', function () {
        expect(settings.getValue('minifyArgs').collapseWhitespace).toBe(true);
    });

    it('sets the default moduleName to ngify', function () {
        expect(settings.getValue('moduleName')).toBe('ngify');
    });

    it('sets the default outputTemplate', function () {
        expect(settings.getValue('outputTemplate').indexOf('angular')).toBe(0);
    });

    it('overrides default extension from userSettings', function () {
        expect(settingsCustom.getValue('htmlExtension')).toBe(args.htmlExtension)
    });

    it('overrides default minify args', function () {
        expect(settingsCustom.getValue('minifyArgs').anything)
            .toBe(args.minifyArgs.anything);
    });

    it('overrides default moduleName', function () {
        expect(settingsCustom.getValue('moduleName')).toBe(args.moduleName);
    });

    it('overrides default outputTemplate', function () {
        expect(settingsCustom.getValue('outputTemplate'))
            .toBe(args.outputTemplate);
    });

});