var ngifyTransform = require('../lib/ngifyTransform');
var ngifyCache = require('../lib/ngifyCache');

describe('ngifyTransform', function () {
    var stream;

    beforeEach(function () {
        stream = ngifyTransform('/home/jacksons/projects/ngify_test/templates/a/test.ng.html');
    });

    it('returns a stream', function () {
        expect(!!stream.end && !!stream.write).toBe(true);
    });

    it('calls queue with the transformed data when end is called', function () {

        //TODO: test async
        stream.queue = function(chunk){
            if (chunk)
                console.log(chunk);
        };
        stream.write('<div>test</div>');
        stream.end();
    });

    it('clears ngifyCache', function(){

        ngifyCache.setValue('test', 'abc321');
        ngifyTransform.clearCache();
        expect (ngifyCache.getValue('test')).toEqual(undefined);
    })

});