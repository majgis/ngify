var NgifySettings = require('../lib/NgifySettings');
var CWD = process.cwd()

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
            htmlMinifyArgs: {
                anything: 'customMinifyArg'
            },
            moduleName: 'customModuleName',
            htmlTemplate: 'customOutputTemplate'
        };
        settings = new NgifySettings(filePath);
    });

    it('sets templateName with the file name', function () {
        expect(settings.getValue('htmlName')).toEqual('123.html');
    });

    it('sets the default extension to .html', function () {
        expect(settings.getValue('htmlExtension')).toEqual('.html');
    });

    it('sets the default minify args', function () {
        expect(settings.getValue('htmlMinifyArgs').collapseWhitespace).toBe(true);
    });

    it('sets the default moduleName to ngify', function () {
        expect(settings.getValue('moduleName')).toBe('ngify');
    });

    it('sets the default htmlTemplate', function () {
        expect(settings.getValue('htmlTemplate').indexOf('.run')).toBe(0);
    });

    it('overrides default extension from userSettings', function () {
        expect(settingsCustom.getValue('htmlExtension')).toBe(args.htmlExtension)
    });

    it('overrides default minify args', function () {
        expect(settingsCustom.getValue('htmlMinifyArgs').anything)
            .toBe(args.htmlMinifyArgs.anything);
    });

    it('overrides default moduleName', function () {
        expect(settingsCustom.getValue('moduleName')).toBe(args.moduleName);
    });

    it('overrides default outputTemplate', function () {
        expect(settingsCustom.getValue('htmlTemplate'))
            .toBe(args.htmlTemplate);
    });

    it('htmlPath=true sets relative path for html name', function(){
        var relativePath =  'a/b/c/123.html';
        var filePath = CWD + '/' + relativePath;
        args = {
            htmlPath: true
        };
        var settings = new NgifySettings(filePath, args);
        expect(settings.getValue('htmlName')).toBe(relativePath);
    });

    it('htmlPath="a/" sets modified relative path for html name', function(){
        var filePath = CWD + '/a/b/c/123.html';
        args = {
            htmlPath: 'a/'
        };
        var settings = new NgifySettings(filePath, args);
        expect(settings.getValue('htmlName')).toBe('b/c/123.html');
    });

    it('htmlPath="b/" sets modified relative path for html name', function(){
        var filePath = CWD + '/a/b/c/123.html';
        args = {
            htmlPath: 'b/'
        };
        var settings = new NgifySettings(filePath, args);
        expect(settings.getValue('htmlName')).toBe('a/c/123.html');
    });

    it('htmlPath=["b/"] sets modified relative path for html name', function(){
        var filePath = CWD + '/a/b/c/123.html';
        args = {
            htmlPath: ['b/']
        };
        var settings = new NgifySettings(filePath, args);
        expect(settings.getValue('htmlName')).toBe('a/c/123.html');
    });

    it('htmlPath=["b/", "c/"] sets mod rel path for html name', function(){
        var filePath = CWD + '/a/b/c/123.html';
        args = {
            htmlPath: ['b/', 'c/']
        };
        var settings = new NgifySettings(filePath, args);
        expect(settings.getValue('htmlName')).toBe('a/123.html');
    });

    it('htmlPath=["/b", "/c"] sets mod rel path for html name', function(){
        var filePath = CWD + '/a/b/c/123.html';
        args = {
            htmlPath: ['/b', '/c']
        };
        var settings = new NgifySettings(filePath, args);
        expect(settings.getValue('htmlName')).toBe('a/123.html');
    });
});