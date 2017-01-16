let expect = require('chai').expect;

let vm = require('../vm');

describe('machine', function() {
  it('reads and writes', function() {
    let a = 1000;
    let b = 1200;
    vm.store(64, a, 4, false);
    expect(vm.read(a, 4, false)).equals(64);
    vm.store(8754673, b, 4, false);
    expect(vm.read(b, 4, false)).equals(8754673);

    vm.load(b, a, 4, false);
    expect(vm.read(b, 4, false)).equals(8754673);
    expect(vm.read(a, 4, false)).equals(8754673);
  });
});

