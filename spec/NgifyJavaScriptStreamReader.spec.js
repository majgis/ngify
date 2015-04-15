var StreamReader = require('../lib/NgifyJavaScriptStreamReader.js');
var NgifySettings = require('../lib/NgifySettings');
var format = require('string-template');

describe('NgifyJavaScriptStreamReader', function () {
    var defaultReader,
        stream={},
        queue,
        settings;

    beforeEach(function () {
        settings = new NgifySettings();
        defaultReader = new StreamReader('/test/index.js', settings)
        queue = [];
        stream.queue = function(chunk) {
            queue.push(chunk);
        };
    });

    it('should output unaltered code when there is no annotation', function () {
        var code = 'module.exports=true;';
        defaultReader.write(stream, code);
        defaultReader.end(stream);
        expect(queue[0]).toBe(code);
    });

    describe ('controller', function(){
        it('should output code with appended line', function () {
            var code = 'exports["@ng"]={type:"controller", name:"test"};';
            var type = "controller";
            var appended = format(
                settings.getValue('jsTemplates')[type],
                {
                    name: 'test',
                    type: type,
                    moduleName: 'ngify'
                }
            );
            defaultReader.write(stream, code);
            defaultReader.end(stream);
            expect(queue[0]).toBe(code + appended);
        });

        it('should output code with appended line with inject', function () {
            var code = 'exports["@ng"]=' +
                '{type:"controller", name:"test", inject:["sam"]};';
            var type = "controller";
            var appended = format(
                settings.getValue('jsTemplates')[type],
                {
                    name: 'test',
                    type: type,
                    moduleName: 'ngify'
                }
            );
            defaultReader.write(stream, code);
            defaultReader.end(stream);
            expect(queue[0]).toBe(code + appended + 'x');
        })
    });


});
