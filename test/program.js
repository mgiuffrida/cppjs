let expect = require('chai').expect;

let types = require('../types');
let program = require('../program');

describe('program', function() {
  it('adds static objects', function() {
    let prog = new program.Program;
    expect(prog.addStaticObject(types.IntegralType.INT, false)).equals(0);
    expect(prog.addStaticObject(types.IntegralType.INT, false)).equals(4);
    expect(prog.addStaticObject(types.BooleanType.BOOL, false)).equals(8);
    expect(prog.addStaticObject(types.IntegralType.INT, false)).equals(9);

    expect(prog.bssSize).equals(0);
    expect(prog.addStaticObject(types.IntegralType.INT, true)).equals(0);
    expect(prog.addStaticObject(types.IntegralType.INT, true)).equals(4);
    expect(prog.addStaticObject(types.BooleanType.BOOL, true)).equals(8);
    expect(prog.addStaticObject(types.IntegralType.INT, true)).equals(9);
    expect(prog.bssSize).equals(13);
  });
});

