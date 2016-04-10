Description
---
[Ngify](https://www.npmjs.com/package/ngify) is a
[Browserify](https://github.com/substack/node-browserify)
transform that performs the following tasks for building Angular 1.x apps:

1. Converts
[Angular templates](https://docs.angularjs.org/guide/templates)
to JavaScript using
[$templateCache](https://docs.angularjs.org/api/ng/service/$templateCache).
2. Eliminates need for managing Angular's minification syntax
3. Reduces Angular boilerplate


Ngify provides these benefits:

* Execute tests faster on non-browser specific units
* Share units between different frameworks
* Facilitate migration to newer/different frameworks


Use in conjunction with [require-globify](https://github.com/capaj/require-globify)
to easily bulk load files.

Install
---

[![npm install ngify](https://nodei.co/npm/ngify.png?downloads=true&downloadRank=true&stars=true)](https://www.npmjs.com/package/ngify)

Add Ngify as a Browserify Transform
---
[Configure browserify](https://github.com/substack/browserify-handbook#configuring-transforms)
 to use this transform in package.json:


      "browserify": {
        "transform": [
          "ngify"
        ]
      }

Configure browserify to use this transform in package.json with settings:


      "browserify": {
        "transform": [
          [
            "ngify",
            {
              moduleName: "test"
            }
          ]
        ]
      }

Configure browserify to use this transform programmatically:


    var b = browserify(options)
       .transform(require('ngify'))

Configure browserify to use this transform programmatically with settings:


    var b = browserify()
        .transform(require('ngify'), {moduleName: 'test'})


Load HTML Files
---

Require an HTML file (the name registered with Angular's $templateCache is 
returned):

    require('./templates/angularTemplate.html');

Here is an example of the contents of angularTemplate.html:

    <div>
        {{value}}
    <div>

Ngify *replaces* the file contents with the following:

    angular.module('ngify')
        .run([
            '$templateCache',
            function($templateCache){
                $templateCache.put(
                    'angularTemplate.html',
                    '<div> {{value}} </div>'
                )
            }
         ])


Load Plain Old JavaScript Objects (POJOs) with Annotations
---

Require a JavaScript file:

    require('./lib/myLib.js');

Here is an example of the contents of myLib.js:

    function MyCtrl (serviceName){
        this.message = 'Hello World!';
    }

    MyCtrl.prototype.sayHello = function(){
        console.log(this.message);
    }

    exports = module.exports = MyCtrl

    exports['@ng'] = {
        name: 'myCtrl',
        type: 'controller',
        inject: [ 'serviceName' ],
    }

The annotation statement is deleted and Ngify *appends* the
following code to the file contents:

    angular.module('ngify')
        .controller('myCtrl', [ 'serviceName', module.exports ])


Annotation Properties
---

**name (Required when used)**

* The name given as the first argument to the Angular convenience method.
* Not used for the run and config types.


**type (Required)**

* The Angular convenience method name.


**inject (Optional when used)**

* The names of the injectables used in Angular's minification syntax.
* Not used for value and constant types.
* Here is an example of the contents of myLib.js without the optional inject
property:


    function MyCtrl (serviceName){
        this.message = 'Hello World!';
    }

    MyCtrl.prototype.sayHello = function(){
        console.log(this.message);
    }

    exports = module.exports = MyCtrl

    exports['@ng'] = {
        name: 'myCtrl',
        type: 'controller',
    }


The injectables are read from the function signature, the annotation statement
is deleted and the following is appended to the file contents:

    angular.module('ngify')
        .controller('myCtrl', [ 'serviceName', module.exports ])

File Name Parsing
---
Both the name and type can be taken from the file name, allowing annotations to be optional.  
Annotation values always override the filename when they are present. Filename formats are as follows: 

    <name>.<type>.js (annotation is optional)
    <name>.js (annotation is required)

For example, the following filename:

    myCtrl.controller.js
    
and no annotation, will result in this output:

    angular.module('ngify')
        .controller('myCtrl', [ 'serviceName', module.exports ])

The type can be omitted from the filename, but the annotation is required in this case:

    myCtrl.js
    
plus this annotation:

    exports['@ng'] = {
      type: 'controller'
    }
    
will provide the same output as above:
    
    angular.module('ngify')
        .controller('myCtrl', [ 'serviceName', module.exports ])



Configuration
---
To change the default settings, you can configure ngify as follows
(the defaults are shown):

      "browserify": {
        "transform": [
          [
            "ngify",
            {
              "moduleName": 'ngify',
              "moduleTemplate": "angular.module('{moduleName}')",

              "htmlExtension": ".html",
              "htmlTemplate": ".run(['$templateCache', function($templateCache){$templateCache.put('{templateName}','{html}')}])",
              "htmlPath": false,
              "htmlMinifyArgs": {
                "collapseWhitespace": true,
                "conservativeCollapse": true
              },

              "jsExtension": ".js",
              "jsAnnotation": "@ng",
              "jsTemplates": {

                "provider":   ".{type}('{name}', [ {inject}module.exports ] );",
                "factory":    ".{type}('{name}', [ {inject}module.exports ] );",
                "service":    ".{type}('{name}', [ {inject}module.exports ] );",
                "animation":  ".{type}('{name}', [ {inject}module.exports ] );",
                "filter":     ".{type}('{name}', [ {inject}module.exports ] );",
                "controller": ".{type}('{name}', [ {inject}module.exports ] );",
                "directive":  ".{type}('{name}', [ {inject}module.exports ] );",

                "value":    ".{type}('{name}', module.exports );",
                "constant": ".{type}('{name}', module.exports );",

                "config": ".{type}([ {inject}module.exports ]);",
                "run":    ".{type}([ {inject}module.exports ]);"
              }
            }
          ]
        ]

Here is a description of each setting:


* moduleName
    * This value replaces {moduleName} in the moduleTemplate
    * If you don't specify your own module name, you need to define the
    following angular module somewhere in your code:


    angular.module('ngify', [])


* moduleTemplate
    * This template is prefixed to all other templates
    * {moduleName} is replaced with value specified


* htmlExtension
    * How ngify identifies the HTML files it will transform
    * As long as the file name ends with this suffix, it will be processed
    * For example, if you have two template types, `.ng.html` might identify
    your angular templates
    * You can disable the HTML functionality (all html files will be ignored)
    by setting this value to false.


* htmlTemplate
    * This is the JavaScript output, with these tokens being replaced:
        * {templateName} - file name with extension
        * {html} - minified html file contents


* htmlPath
    * Set to false by default, you just get the file name
    * If true, path is relative to the current working directory (cwd)
    * If a string, relativePath.replace(string, '')
    * If an array of strings, relativePath.replace(string, '') for each item in 
    the array
    * Paths have forward slashes on all platforms
    * Managing the removal forward slashes is up to you. 


* htmlMinifyArgs
    * The default object is completely overwritten with the custom arguments
    * See [html-minifier](https://www.npmjs.com/package/html-minifier) for supported options


* jsExtension
    * How ngify identifies the JS files it will transform
    * As long as the file name ends with this suffix, it will be processed
    * For example, `.ng.js` might identify your angular files
    * You can disable the JS functionality (all JS files will be ignored)
    by setting this value to false


* jsAnnotation
    * The property name on module.exports that ngify uses to generate the Angular boilerplate


* jsTemplates
    * Each template is matched using the jsAnnotation `type` property


Change Log
---

**v1.6.0** - htmlPath option allows for prefixed html template

**v1.5.0** - html-minifier v1.4.0

**v1.4.0** - The name registered with Angular's $templateCache is now returned 
from the require of html files

**v1.3.0** - Annotations are now optional, with the name and type coming from the filename.

**v1.2.0** - The annotation statements are now removed from the output

**v1.1.0** - The inject annotation is now optional

**v1.0.0** - Breaking changes to add support for annotations

  * The following configuration properties were renamed:
    * minifyArgs --> htmlMinifyArgs
    * extension --> htmlExtension
    * outputTemplate --> htmlTemplate

  * Support for @ng annotations was added

**v0.1.0** - Breaking changes to eliminate file system calls

  * All file system calls were eliminated
  * The official [browserify method for configuring transforms](https://github.com/substack/browserify-handbook#configuring-transforms)
was implemented
  * A package.json file with default browserify configuration is now required


Contribute
---
Execute tests for a single run:


    npm test

Execute tests for continuous testing with changes:


    npm run autotest


License
---
The MIT License (MIT)

Copyright (c) 2014 majgis

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
