var Ngify = require('../lib/Ngify');

describe('ngifyCache', function () {

    it('is valid for files with .html extension', function () {
        var ngify = new Ngify('/this/is/a/test/index.html');
        expect(ngify.isValidFile()).toBe(true);
    });

    it('is not valid for files without .html extension', function(){
        var ngify = new Ngify('/this/is/a/test/index.js');
        expect(ngify.isValidFile()).toBe(false);
    })
});