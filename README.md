Description
---
[Ngify](https://www.npmjs.com/package/ngify)
is a
[Browserify](https://github.com/substack/node-browserify)
transform that performs the following tasks:

1. Converts
[Angular templates](https://docs.angularjs.org/guide/templates)
to JavaScript using
[$templateCache](https://docs.angularjs.org/api/ng/service/$templateCache).
2. Eliminates Angular boilerplate by using annotations


Usage
---
Install ngify locally:


    npm install ngify --save-dev


Configure browserify to use this transform in package.json:


      "browserify": {
        "transform": [
          "ngify"
        ]
      }

To change the default settings, you can configure ngify as follows
(The defaults are shown.  There is an explanation of each in the next section):


      "browserify": {
        "transform": [
          [
            "ngify",
            {
              moduleName: 'ngify',
              moduleTemplate: "angular.module('{moduleName}')",

              htmlExtension: '.html',
              htmlTemplate: ".run(['$templateCache', function($templateCache){$templateCache.put('{templateName}','{html}')}])",
              htmlMinifyArgs: {
                collapseWhitespace: true,
                conservativeCollapse: true
              },

              jsExtension: '.js',
              jsAnnotation: '@ng',
              jsTemplates: {
              
                provider:   ".{type}('{name}', [ {inject}module.exports ] );",
                factory:    ".{type}('{name}', [ {inject}module.exports ] );",
                service:    ".{type}('{name}', [ {inject}module.exports ] );",
                animation:  ".{type}('{name}', [ {inject}module.exports ] );",
                filter:     ".{type}('{name}', [ {inject}module.exports ] );",
                controller: ".{type}('{name}', [ {inject}module.exports ] );",
                directive:  ".{type}('{name}', [ {inject}module.exports ] );",
                
                value:    ".{type}('{name}', module.exports );",
                constant: ".{type}('{name}', module.exports );",
                
                config: ".{type}([ {inject}module.exports ]);",
                run:    ".{type}([ {inject}module.exports ]);"
              }
            }
          ]
        ]

When you require html or js files, they will be processed by ngify:


    require('./templates/angularTemplate.html');
    require('./lib/myLib.js');

Here is an example of the contents of angularTemplate.html:


    <div>
        {{value}}
    <div>

Here is an example of the contents of  myLib.js:


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


In the case of the HTML file, the file contents are replaced with
a minified version of the following:


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


In the case of the JS file, the following is appended to the file contents:


    angular.module('ngify')
        .controller('myCtrl', [ 'serviceName', module.exports ])


Configuration Details
---
Here is a description of each configuration setting:

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

* htmlTemplate
    * This is the JavaScript output, with these three tokens being replaced:
        * {moduleName} - described above
        * {templateName} - file name with extension
        * {html} - minified html file contents
    * The replacements are done using [string-template](https://www.npmjs.com/package/string-template)

* htmlMinifyArgs
    * The default object is completely overwritten with the custom arguments
    * See [html-minifier](https://www.npmjs.com/package/html-minifier) for supported options

* jsExtension
    * How ngify identifies the JS files it will transform
    * As long as the file name ends with this suffix, it will be processed
    * For example, `.ng.js` might identify your angular files

* jsAnnotation
    * A property on module.exports that ngify uses to generate the Angular boilerplate

* jsTemplates
    * Each template is matched using the jsAnnotation `type` property

Change Log
---
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