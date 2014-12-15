var NgifySettingsCompiler = require('../lib/NgifySettingsCompiler');

describe('ngifyCache', function () {

    function getDefaultSettings() {
        return new NgifySettingsCompiler(
            {packagePath: '/this/is/a/test'},
            {},
            'this/is/a/test/index.html'
        ).getSettings();
    }

    function getNgifySettings() {
        return new NgifySettingsCompiler(
            {packagePath: '/this/is/a/test'},
            {
                name:'testName',
                ngify: {
                    moduleName: 'testModuleName',
                    minifyArgs: {
                        collapseWhitespace: false
                    }
                }
            },
            'this/is/a/test/index.html'
        ).getSettings();
    }

    it('can return a settings object', function () {
        var settings = getDefaultSettings();
        expect(typeof settings).toEqual('object');
    });

    it('can set the module name from packagePath', function () {
        var settings = getDefaultSettings();
        expect(settings.moduleName).toEqual('test');
    });

    it('can set the template from filePath', function () {
        var settings = getDefaultSettings();
        expect(settings.templateName).toEqual('index.html');
    });

    it('will return the default minifyArgs', function () {
        var settings = getDefaultSettings();
        expect(settings.minifyArgs.collapseWhitespace).toEqual(true);
    });

    it('can set the module name from ngify settings', function () {
        var settings = getNgifySettings();
        expect(settings.moduleName).toEqual('testModuleName');
    });

    it('will return the minifyArgs from ngify settings', function () {
        var settings = getNgifySettings();
        expect(settings.minifyArgs.collapseWhitespace).toEqual(false);
    });

    it('will return the module name from package.json name', function(){
        var settings = getNgifySettings();
        expect(settings.moduleName).toEqual('testModuleName');
    });


});