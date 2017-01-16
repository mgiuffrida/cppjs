let expect = require('chai').expect;

let types = require('../types');
let Program = require('../program');
let ProgramRunner = require('../program-runner');

describe('program', function() {
  it('adds static objects', function() {
    let program = new Program;
    program.addStaticObject(types.IntegralType.INT, false);
    program.addStaticObject(types.IntegralType.INT, false);

    program.addStaticObject(types.IntegralType.INT, true);
    program.addStaticObject(types.BooleanType.BOOL, true);

    var runner = new ProgramRunner(program);
    expect(runner.bssBlockStart_).equals(0);
    expect(runner.dataBlockStart_).equals(5);
  });
});

