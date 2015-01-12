var NgifyStreamReader = require('../lib/NgifyStreamReader');

describe('NgifyStreamReader', function () {
    var defaultReader,
        customReader,
        defaultReaderInvalid,
        customReaderInvalid,
        stream={},
        queue;

    beforeEach(function () {
        defaultReader = new NgifyStreamReader('/test/index.html');
        defaultReaderInvalid = new NgifyStreamReader('/test/index.js');
        var customArgs = {
            extension: '.ng.h',
            outputTemplate: '{moduleName}{templateName}{html}'
        };
        customReader = new NgifyStreamReader('/test/index.ng.h', customArgs);
        customReaderInvalid = new NgifyStreamReader('/test/index.js', customArgs);
        queue = [];
        stream.queue = function(chunk) {
            queue.push(chunk);
        };
    });

    it('is valid for files with .html extension by default', function () {

        expect(defaultReader.isValidFile()).toBe(true);
    });

    it('is valid for other file extensions when specified', function () {
        expect(customReader.isValidFile()).toBe(true);
    });

    it('is not valid for files without .html extension by default', function () {
        expect(defaultReaderInvalid.isValidFile()).toBe(false);
    });

    it('is not valid for files without full custom extension', function () {
        expect(customReaderInvalid.isValidFile()).toBe(false);
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
        expect(queue[0]).toBe('ngify' + 'index.ng.h' + chunk);
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
        expect(stream.emit).toHaveBeenCalledWith('error', jasmine.any(String));
    });
});
