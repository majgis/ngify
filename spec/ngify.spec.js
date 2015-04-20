var ngify = require('../lib/ngify');

describe('ngify', function () {
    var stream,
        queue;

    beforeEach(function () {
        stream = ngify('/a/test.ng.html', {htmlName: 'ngify.spec.js'});
        queue = [];
        stream.queue = function(chunk){
            queue.push(chunk);
        }
    });

    it('returns a stream', function () {
        expect(!!stream.end && !!stream.write).toBe(true);
    });

    it('calls queue with the transformed data when end is called', function () {
        var output = '<div>test</div>';
        stream.write(output);
        stream.end();
        expect (queue[0].indexOf(output)).toBeGreaterThan(-1);
    });

    it('calls queue with null when end is called', function () {
        var output = '<div>test</div>';
        stream.write(output);
        stream.end();
        expect (queue[1]).toEqual(null);
    });
});