let expect = require('chai').expect;

let types = require('../types');
let program = require('../program');
let ProgramRunner = require('../program-runner');

describe('program', function() {
  it('adds static objects', function() {
    let prog = new program.Program;
    prog.addStaticObject(types.IntegralType.INT, false);
    prog.addStaticObject(types.IntegralType.INT, false);

    prog.addStaticObject(types.IntegralType.INT, true);
    prog.addStaticObject(types.BooleanType.BOOL, true);

    var runner = new ProgramRunner(prog);
    expect(runner.bssBlockStart_).equals(0);
    expect(runner.dataBlockStart_).equals(5);
  });
});

