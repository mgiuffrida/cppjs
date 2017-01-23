'use string';

const expect = require('chai').expect;

const types = require('../types');

describe('types', function() {
  it('has basic types', function() {
    expect(types.IntegralType).ok;
    expect(types.BooleanType).ok;

    expect(types.IntegralType.INT.size).equals(4);
    expect(types.BooleanType.BOOL.size).equals(1);
  });

  it('can convert values to bytes', function() {
    let bytes = types.BooleanType.BOOL.toBytes(true);
    // Should only contain one element, one byte long.
    expect(bytes.byteLength).equals(1);
    expect(bytes).instanceOf(Uint8Array);
    expect(bytes[0]).equals(1);

    bytes = types.BooleanType.BOOL.toBytes(false);
    expect(bytes.byteLength).equals(1);
    expect(bytes).instanceOf(Uint8Array);
    expect(bytes[0]).equals(0);

    expect(types.BooleanType.BOOL.toBytes.bind(
               types.BooleanType.BOOL, 3)).throws();

    let value = 65;
    bytes = types.IntegralType.CHAR.toBytes(value);
    expect(bytes.byteLength).equals(1);
    expect(bytes).instanceOf(Uint8Array);
    expect(bytes[0]).equals(value);

    value = 500;
    bytes = types.IntegralType.SHORT.toBytes(value);
    expect(bytes.byteLength).equals(2);
    expect(bytes).instanceOf(Uint16Array);
    expect(bytes[0]).equals(value);

    expect(types.IntegralType.SHORT.toBytes.bind(
               types.IntegralType.SHORT, 70000)).throws(/65535/);

    bytes = types.IntegralType.INT.toBytes(value);
    expect(bytes.byteLength).equals(4);
    expect(bytes).instanceOf(Uint32Array);
    expect(bytes[0]).equals(value);

    value = 4294967295;
    bytes = types.IntegralType.LONG.toBytes(value);
    expect(bytes.byteLength).equals(4);
    expect(bytes).instanceOf(Uint32Array);
    expect(bytes[0]).equals(value);
  });
});
