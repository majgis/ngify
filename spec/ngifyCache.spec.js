var ngifyCache = require('../lib/ngifyCache');

describe('ngifyCache', function () {


    afterEach(function () {
        ngifyCache.clearAll();
    });

    it('can store and retrieve a value', function () {
        ngifyCache.setValue('test', 'abc123' );
        expect(ngifyCache.getValue('test')).toEqual('abc123');
    });

    it ('can overwrite an existing value', function(){
        ngifyCache.setValue('test', 'abc123');
        ngifyCache.setValue('test', '123abc');
        expect(ngifyCache.getValue('test')).toEqual('123abc');

    });

    it('clears all values in the cache', function(){
        ngifyCache.setValue('test1', 'abc123');
        ngifyCache.setValue('test2', '123abc');
        ngifyCache.clearAll();
        expect(ngifyCache.getValue('test1')).toEqual(undefined);
        expect(ngifyCache.getValue('test2')).toEqual(undefined);
    });

    it('will store/retrieve the same value across files', function(){
        ngifyCache.setValue('test', 'abc123');
        expect(require('../lib/ngifyCache').getValue('test')).toEqual('abc123');
    });

});