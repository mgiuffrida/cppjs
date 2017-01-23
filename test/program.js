'use strict';

const expect = require('chai').expect;

const types = require('../types');
const program = require('../program');

describe('program', function() {
  it('adds static objects', function() {
    let prog = new program.Program;
    let curAddress = 0;

    // Tests that adding the static object returns the current address, and
    // increments the current address by the expected size for the next call.
    function testAddStaticObject(type, value, expectedIncrement) {
      let valueAddress = prog.addStaticObject(type, value);
      expect(valueAddress).equals(curAddress);
      curAddress += expectedIncrement;
    }

    testAddStaticObject(types.BooleanType.BOOL, false, 1);
    testAddStaticObject(types.BooleanType.BOOL, true, 1);

    // The integer is aligned to 4, so bump curAddress to 4.
    curAddress += 2;

    testAddStaticObject(types.IntegralType.INT, 32, 4);
    testAddStaticObject(types.IntegralType.INT, 9000, 4);
    testAddStaticObject(types.BooleanType.BOOL, true, 1);
    testAddStaticObject(types.BooleanType.BOOL, false, 1);
    curAddress += 2;
    testAddStaticObject(types.IntegralType.INT, 0, 4);

    let uint8View = new Uint8Array(prog.staticDataBytes);
    expect(uint8View[0]).equals(0);
    expect(uint8View[1]).equals(1);
    // Skip the two ints (including +2 for alignment).
    expect(uint8View[12]).equals(1);
    expect(uint8View[13]).equals(0);
  });
});
