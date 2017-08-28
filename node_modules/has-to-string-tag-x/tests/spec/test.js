'use strict';

var hasToStringTag;
if (typeof module === 'object' && module.exports) {
  require('es5-shim');
  require('es5-shim/es5-sham');
  if (typeof JSON === 'undefined') {
    JSON = {};
  }
  require('json3').runInContext(null, JSON);
  require('es6-shim');
  hasToStringTag = require('../../index.js');
} else {
  hasToStringTag = returnExports;
}

describe('Basic tests', function () {
  it('results should match', function () {
    var expected = typeof Symbol === 'function' && typeof Symbol('') === 'symbol' && typeof Symbol.toStringTag === 'symbol';
    expect(hasToStringTag).toEqual(expected);
  });
});
