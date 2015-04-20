var StreamReader = require('../lib/NgifyJavaScriptStreamReader.js');
var NgifySettings = require('../lib/NgifySettings');
var format = require('string-template');

describe('NgifyJavaScriptStreamReader', function () {
    var defaultReader,
        stream = {},
        queue,
        settings;

    beforeEach(function () {
        settings = new NgifySettings();
        defaultReader = new StreamReader('/test/index.js', settings);
        queue = [];
        stream.queue = function (chunk) {
            queue.push(chunk);
        };
    });

    function executeScenario(scenario) {
        settings = new NgifySettings();
        defaultReader = new StreamReader('/test/index.js', settings);
        queue = [];
        defaultReader.write(stream, scenario.code);
        defaultReader.end(stream);
        expect(queue[0]).toBe(scenario.code + '\n' + scenario.append);
    }

    it('should output unaltered code when there is no annotation', function () {
        var code = 'module.exports=true;';
        defaultReader.write(stream, code);
        defaultReader.end(stream);
        expect(queue[0]).toBe(code);
    });

    it('should output code with appended line when annotation', function () {
        var code = 'exports["@ng"]={type:"controller", name:"test"};';
        var type = "controller";
        var appended = format(
            settings.getValue('moduleTemplate') +
            settings.getValue('jsTemplates')[type],
            {
                name: 'test',
                type: type,
                moduleName: 'ngify'
            }
        );
        defaultReader.write(stream, code);
        defaultReader.end(stream);
        expect(queue[0]).toBe(code + '\n' + appended);
    });

    describe('inject', function () {
        it('should work for a string literal', function () {
            executeScenario({
                code: "exports['@ng']={type:'controller',inject:'test'};",
                append: "angular.module('ngify').controller('', [ 'test', module.exports ] );"
            })
        });

        it('should work for an array expression with no elements', function () {
            executeScenario({
                code: "exports['@ng']={type:'controller',inject:[]};",
                append: "angular.module('ngify').controller('', [ module.exports ] );"
            })
        });

        it('should work for an array expression with one element', function () {
            executeScenario({
                code: "exports['@ng']={type:'controller',inject:['test']};",
                append: "angular.module('ngify').controller('', [ 'test', module.exports ] );"
            })
        });

        it('should work for an array expression with two elements', function () {
            executeScenario({
                code: "exports['@ng']={type:'controller',inject:['test', 'test2']};",
                append: "angular.module('ngify').controller('', [ 'test', 'test2', module.exports ] );"
            })
        })
    });

    it('should produce correct output for provider', function () {
        executeScenario({
            code: 'exports["@ng"]={type:"provider", name:"test", inject:["sam"]};',
            append: "angular.module('ngify').provider('test', [ 'sam', module.exports ] );"
        });
    });

    it('should produce correct output for controller', function () {
        executeScenario({
            code: 'exports["@ng"]={type:"controller", name:"test", inject:["sam"]};',
            append: "angular.module('ngify').controller('test', [ 'sam', module.exports ] );"
        });
    });

    it('should produce correct output for factory', function () {
        executeScenario({
            code: 'exports["@ng"]={type:"factory", name:"test", inject:["sam"]};',
            append: "angular.module('ngify').factory('test', [ 'sam', module.exports ] );"
        });
    });

    it('should produce correct output for value', function () {
        executeScenario({
            code: 'exports["@ng"]={type:"value", name:"test", inject:["sam"]};',
            append: "angular.module('ngify').value('test', module.exports );"
        });
    });

    it('should produce correct output for constant', function () {
        executeScenario({
            code: 'exports["@ng"]={type:"constant", name:"test", inject:["sam"]};',
            append: "angular.module('ngify').constant('test', module.exports );"
        });
    });

    it('should produce correct output for animation', function () {
        executeScenario({
            code: 'exports["@ng"]={type:"animation", name:"test", inject:["sam"]};',
            append: "angular.module('ngify').animation('test', [ 'sam', module.exports ] );"
        });
    });

    it('should produce correct output for filter', function () {
        executeScenario({
            code: 'exports["@ng"]={type:"filter", name:"test", inject:["sam"]};',
            append: "angular.module('ngify').filter('test', [ 'sam', module.exports ] );"
        });
    });

    it('should produce correct output for filter', function () {
        executeScenario({
            code: 'exports["@ng"]={type:"filter", name:"test", inject:["sam"]};',
            append: "angular.module('ngify').filter('test', [ 'sam', module.exports ] );"
        });
    });

    it('should produce correct output for directive', function () {
        executeScenario({
            code: 'exports["@ng"]={type:"directive", name:"test", inject:["sam"]};',
            append: "angular.module('ngify').directive('test', [ 'sam', module.exports ] );"
        });
    });

    it('should produce correct output for config', function () {
        executeScenario({
            code: 'exports["@ng"]={type:"config", name:"test", inject:["sam"]};',
            append: "angular.module('ngify').config([ 'sam', module.exports ]);"
        });
    });

    it('should produce correct output for run', function () {
        executeScenario({
            code: 'exports["@ng"]={type:"run", name:"test", inject:["sam"]};',
            append: "angular.module('ngify').run([ 'sam', module.exports ]);"
        });
    });

});