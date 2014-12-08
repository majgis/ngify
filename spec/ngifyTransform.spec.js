var ngifyTransform = require('../lib/ngifyTransform');

describe('ngifyTransform', function () {
    var stream;

    beforeEach(function () {
        stream = ngifyTransform('/home/jacksons/projects/ngify_test/templates/a/test.ng.html');
    });

    it('returns a stream', function () {
        expect(!!stream.end && !!stream.write).toBe(true);
    });

    it('calls queue with the transformed data when end is called', function () {
        stream.queue = function(chunk){
            console.log('chunk',chunk);
        };
        stream.write('<div>test</div>');
        stream.end();
        console.log(stream);

    });


});