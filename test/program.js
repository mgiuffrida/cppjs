let expect = require('chai').expect;

let types = require('../types');
let Program = require('../program');

describe('program', function() {
  it('adds static objects', function() {
    let program = new Program;
    expect(program.addStaticObject(types.IntegralType.INT, false)).equals(0);
    expect(program.addStaticObject(types.IntegralType.INT, false)).equals(4);
    expect(program.addStaticObject(types.BooleanType.BOOL, false)).equals(8);
    expect(program.addStaticObject(types.IntegralType.INT, false)).equals(9);

    expect(program.bssSize).equals(0);
    expect(program.addStaticObject(types.IntegralType.INT, true)).equals(0);
    expect(program.addStaticObject(types.IntegralType.INT, true)).equals(4);
    expect(program.addStaticObject(types.BooleanType.BOOL, true)).equals(8);
    expect(program.addStaticObject(types.IntegralType.INT, true)).equals(9);
    expect(program.bssSize).equals(13);
  });
});

