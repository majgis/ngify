Description
---
[Ngify](https://www.npmjs.com/package/ngify)
is a
[Browserify](https://github.com/substack/node-browserify)
transform for converting
[Angular templates](https://docs.angularjs.org/guide/templates)
to JavaScript using
[$templateCache](https://docs.angularjs.org/api/ng/service/$templateCache).


Breaking Changes at v0.1.0
---
These changes were made to reduce the
complexity of the underlying code and greatly improve performance.

Here is a summary of what changed:

  * All file system calls were eliminated
  * The official [browserify method for configuring transforms](https://github.com/substack/browserify-handbook#configuring-transforms)
was implemented
  * A package.json file with default browserify configuration is now required


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
(the defaults are shown):


      "browserify": {
        "transform": [
          [
            "ngify",
            {
              "moduleName": "ngify",
              "extension": ".html",
              "outputTemplate": "angular.module('{moduleName}').run(['$templateCache', function($templateCache){$templateCache.put('{templateName}','{html}')}])",
              "minifyArgs": {
                  "collapseWhitespace": true,
                  "conservativeCollapse": true
              }
            }
          ]
        ]

When you require html files, they will be processed by ngify:


    require('./templates/angularTemplate.html')

Here is an example of the contents of angularTemplate.html:


    <div>
        {{value}}
    <div>

The output bundle will contain a minified version of the following:


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


Configuration Details
---
Here are the default settings:

    {
      "moduleName": "ngify",
      "extension": ".html",
      "outputTemplate": "angular.module('{moduleName}').run(['$templateCache', function($templateCache){$templateCache.put('{templateName}','{html}')}])",
      "minifyArgs": {
          "collapseWhitespace": true,
          "conservativeCollapse": true
      }
    }

Here is a description of each setting:

* moduleName
    * This value replaces {moduleName} in the outputTemplate
    * If you don't specify your own module name, you need to define the
    following angular module somewhere in your code:


        angular.module('ngify', [])

* extension
    * How ngify identifies the files it will transform
    * As long as the file name ends with this suffix, it will be processed
    * For example, if you have two template types, `.ng.html` might identify
    your angular templates

* outputTemplate
    * This is the JavaScript output, with these three tokens being replaced:
        * {moduleName} - described above
        * {templateName} - file name with extension
        * {html} - minified html file contents
    * The replacements are done using [string-template](https://www.npmjs.com/package/string-template)

* minifyArgs
    * The default object is completely overwritten with the custom arguments
    * See [html-minifier](https://www.npmjs.com/package/html-minifier) for supported options


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