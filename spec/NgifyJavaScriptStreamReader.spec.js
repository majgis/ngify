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
        filename = scenario.filename || '/test/index.js';
        defaultReader = new StreamReader(filename, settings);
        queue = [];
        defaultReader.write(stream, scenario.code);
        defaultReader.end(stream);
        var appendedCode;
        if (scenario.append) {
            appendedCode = '\n' + scenario.append;
        } else {
            appendedCode = '';
        }
        expect(queue[0]).toBe(scenario.code.split("exports[")[0] + appendedCode);
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
        expect(queue[0]).toBe(code.split("exports[")[0] + '\n' + appended);
    });

    describe('inject', function () {
        it('should work for a string literal', function () {
            executeScenario({
                code: "exports['@ng']={type:'controller',inject:'test', name:'test'};",
                append: "angular.module('ngify').controller('test', [ 'test', module.exports ] );"
            })
        });

        it('should work for an array expression with no elements', function () {
            executeScenario({
                code: "exports['@ng']={type:'controller',inject:[], name:'test'};",
                append: "angular.module('ngify').controller('test', [ module.exports ] );"
            })
        });

        it('should work for an array expression with one element', function () {
            executeScenario({
                code: "exports['@ng']={type:'controller',inject:['test'], name:'test'};",
                append: "angular.module('ngify').controller('test', [ 'test', module.exports ] );"
            })
        });

        it('should work for an array expression with two elements', function () {
            executeScenario({
                code: "exports['@ng']={type:'controller',inject:['test', 'test2'], name:'test'};",
                append: "angular.module('ngify').controller('test', [ 'test', 'test2', module.exports ] );"
            })
        })
    });

    describe('jsTemplates', function () {
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

    describe('optional inject annotation by assignment of already declared function ', function () {

        it('should create injectables for a single param', function () {
            executeScenario({
                code: 'function test(sam){};exports=module.exports=test;exports["@ng"]={type:"run", name:"test"};',
                append: "angular.module('ngify').run([ 'sam', module.exports ]);"
            });
        });

        it('should create injectables for multiple params', function () {
            executeScenario({
                code: 'function test(sam, bilbo, frodo){};exports=module.exports=test;exports["@ng"]={type:"run", name:"test"};',
                append: "angular.module('ngify').run([ 'sam', 'bilbo', 'frodo', module.exports ]);"
            });
        });

    });

    describe('optional inject annotation by assignment of variable ', function () {

        it('should create injectables for a single param', function () {
            executeScenario({
                code: 'var testt = function(sam){};exports=module.exports=testt;exports["@ng"]={type:"run", name:"test"};',
                append: "angular.module('ngify').run([ 'sam', module.exports ]);"
            });
        });

        it('should create injectables for multiple params', function () {
            executeScenario({
                code: 'var testt = function (sam, bilbo, frodo){};exports=module.exports=testt;exports["@ng"]={type:"run", name:"test"};',
                append: "angular.module('ngify').run([ 'sam', 'bilbo', 'frodo', module.exports ]);"
            });
        });

    });

    describe('optional inject annotation by assignment of function expression ', function () {

        it('should create injectables for a single param', function () {
            executeScenario({
                code: 'exports=module.exports=function testt(sam){};exports["@ng"]={type:"run", name:"test"};',
                append: "angular.module('ngify').run([ 'sam', module.exports ]);"
            });
        });

        it('should create injectables for multiple params', function () {
            executeScenario({
                code: 'exports=module.exports=function testt(sam, bilbo, frodo){};exports["@ng"]={type:"run", name:"test"};',
                append: "angular.module('ngify').run([ 'sam', 'bilbo', 'frodo', module.exports ]);"
            });
        });

    });

    describe('inject annotation trumps optional shorthand', function () {

        it('should create injectables for a single param', function () {
            executeScenario({
                code: 'exports=module.exports=function testt(sam){};exports["@ng"]={type:"run", name:"test", inject: ["fred"]};',
                append: "angular.module('ngify').run([ 'fred', module.exports ]);"
            });
        });

        it('should create injectables for multiple params', function () {
            executeScenario({
                code: 'exports=module.exports=function testt(sam, bilbo, frodo){};exports["@ng"]={type:"run", name:"test", inject:["a", "b","c"]};',
                append: "angular.module('ngify').run([ 'a', 'b', 'c', module.exports ]);"
            });
        });

    });

    describe('file basename without type', function () {

        it('should provide name if missing from annotation', function () {
            executeScenario({
                code: "exports['@ng']={type:'controller',inject:[]};",
                append: "angular.module('ngify').controller('index', [ module.exports ] );"
            })
        });

        it('should not provide name if present in annotation', function () {
            executeScenario({
                code: "exports['@ng']={type:'controller',inject:[], name:'test'};",
                append: "angular.module('ngify').controller('test', [ module.exports ] );"
            })
        });

        it('should do nothing if there is no annotation', function () {
            executeScenario({
                code: "module.exports={};",
                append: null
            })
        });

    });

    describe('file basename with type', function () {

        it('should provide name if missing from annotation', function () {
            executeScenario({
                code: "exports['@ng']={type:'controller',inject:[]};",
                append: "angular.module('ngify').controller('name', [ module.exports ] );",
                filename: "name.controller.js"
            })
        });

        it('should not provide name if present in annotation', function () {
            executeScenario({
                code: "exports['@ng']={type:'controller',inject:[], name:'test'};",
                append: "angular.module('ngify').controller('test', [ module.exports ] );",
                filename: "name.controller.js"
            })
        });

        it('should provide type if missing from annotation', function () {
            executeScenario({
                code: "exports['@ng']={inject:[], name:'test'};",
                append: "angular.module('ngify').controller('test', [ module.exports ] );",
                filename: "name.controller.js"
            })
        });

        it('should not provide type if present in annotation', function () {
            executeScenario({
                code: "exports['@ng']={type:'controller',inject:[], name:'test'};",
                append: "angular.module('ngify').controller('test', [ module.exports ] );",
                filename: "name.value.js"
            })
        });

        it('should provide name and type when there is an annotation without name and type',
            function () {
                executeScenario({
                    code: "exports['@ng']={inject:[]};",
                    append: "angular.module('ngify').controller('xxx', [ module.exports ] );",
                    filename: "xxx.controller.js"
                })
            });

        it('should provide name and type when there is no annotation', function () {
            executeScenario({
                code: "",
                append: "angular.module('ngify').controller('xxx', [ module.exports ] );",
                filename: "xxx.controller.js"
            })
        });
    });

    describe('annotations syntax', function(){

        it('should work for single quotes on keys', function(){
            executeScenario({
                code: "function channel(){} exports = module.exports = channel; exports['@ng'] = {'type': 'controller', 'name': 'channel'};",
                append: "angular.module('ngify').controller('channel', [ module.exports ] );"
            });
        });

        it('should work for double quotes on keys', function(){
            executeScenario({
                code: "function channel(){} exports = module.exports = channel; exports['@ng'] = {\"type\": 'controller', \"name\": 'channel'};",
                append: "angular.module('ngify').controller('channel', [ module.exports ] );"
            });
        });

    });

    describe('browserify-ngannotate compatibility', function(){

        it('should not detect @ng annotation when /* @ngInject */ comment is present ', function(){
            executeScenario({
                code: "app.directive('bla', /* @ngInject */ function (serviceA){return templateUrl: require('../templates/test.html')};});",
                append: ""
            });
        })

    });
});