var NgifyHtmlStreamReader = require('../lib/NgifyHtmlStreamReader');
var NgifySettings = require('../lib/NgifySettings');

describe('NgifyHtmlStreamReader', function () {
    var defaultReader,
        customReader,
        defaultReaderInvalid,
        customReaderInvalid,
        stream = {},
        queue,
        customSettings;

    beforeEach(function () {
        var settings = new NgifySettings();
        defaultReader = new NgifyHtmlStreamReader('/test/index.html', settings);
        defaultReaderInvalid = new NgifyHtmlStreamReader('/test/index.js', settings);
        var customArgs = {
            htmlExtension: '.ng.h',
            moduleTemplate: '{moduleName}',
            htmlTemplate: '{htmlName}{html}'
        };
        var customSettingsPath = '/test/index.ng.h';
        customSettings = new NgifySettings(customSettingsPath, customArgs);
        customReader = new NgifyHtmlStreamReader(customSettingsPath, customSettings);

        var customInvalidPath = '/test/index.js';
        var customInvalidSettings = new NgifySettings(customInvalidPath, customArgs);
        customReaderInvalid = new NgifyHtmlStreamReader(customInvalidPath, customInvalidSettings);
        queue = [];
        stream.queue = function (chunk) {
            queue.push(chunk);
        };
    });

    it('outputs a formatted outputTemplate', function () {
        defaultReader.write(stream, '<div>test</div>');
        defaultReader.end(stream);
        expect(queue[0].indexOf('angular')).toBe(0);
    });

    it('outputs a custom formatted outputTemplate', function () {
        var chunk = '<div>test</div>';
        customReader.write(stream, chunk);
        customReader.end(stream);
        expect(queue[0]).toBe('ngify' + 'index.ng.h' + chunk + '\nmodule.exports = \'' + 'index.ng.h\';');
    });

    it('outputs with minimized html', function () {
        var chunk = '<div>      test        </div>';
        defaultReader.write(stream, chunk);
        defaultReader.end(stream);
        expect(queue[0].indexOf('<div> test </div>')).toBeGreaterThan(-1);
    });

    it('emits an error event when given invalid HTML', function () {
        stream.emit = jasmine.createSpy('emit');
        var chunk = '<div';
        defaultReader.write(stream, chunk);
        defaultReader.end(stream);
        expect(stream.emit).toHaveBeenCalledWith('error', {});
    });

    it('uses relative path for html template when htmlPath=true', function () {
        var args = {
            htmlPath: true
        };
        var relativePath = 'test/index.html';
        var settingsPath = process.cwd() + '/' + relativePath;
        var settings = new NgifySettings(settingsPath, args);
        var reader = new NgifyHtmlStreamReader(settingsPath, settings);
        var chunk = '<div>test</div>';
        reader.write(stream, chunk);
        reader.end(stream);
        var pathInCode = "'test/index.html'";
        expect(queue[0].lastIndexOf(pathInCode))
            .toBe(queue[0].length - pathInCode.length - 1)
    });

    it('uses relative path for html template when htmlPath=string', function () {
        var args = {
            htmlPath: 'test/'
        };
        var relativePath = 'test/index.html';
        var settingsPath = process.cwd() + '/' + relativePath;
        var settings = new NgifySettings(settingsPath, args);
        var reader = new NgifyHtmlStreamReader(settingsPath, settings);
        var chunk = '<div>test</div>';
        reader.write(stream, chunk);
        reader.end(stream);
        var pathInCode = "'index.html'";
        expect(queue[0].lastIndexOf(pathInCode))
            .toBe(queue[0].length - pathInCode.length - 1)
    });

    it('uses relative path for html template when htmlPath=[]', function () {
        var args = {
            htmlPath: ['test/', 'test3/']
        };
        var relativePath = 'test/test2/test3/index.html';
        var settingsPath = process.cwd() + '/' + relativePath;
        var settings = new NgifySettings(settingsPath, args);
        var reader = new NgifyHtmlStreamReader(settingsPath, settings);
        var chunk = '<div>test</div>';
        reader.write(stream, chunk);
        reader.end(stream);
        var pathInCode = "'test2/index.html'";
        expect(queue[0].lastIndexOf(pathInCode))
            .toBe(queue[0].length - pathInCode.length - 1)
        
    });
});
