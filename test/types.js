let expect = require('chai').expect;

let types = require('../types');

describe('types', function() {
  it('has basic types', function() {
    expect(types.IntegralType).ok;
    expect(types.BooleanType).ok;

    expect(types.IntegralType.INT.size).equals(4);
    expect(types.BooleanType.BOOL.size).equals(1);
  });
});


