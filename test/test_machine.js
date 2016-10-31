let machine = require('../machine');
let expect = require('../bower_components/chai/chai').expect;

let m = machine.machine;

describe('machine', function() {
  it('reads and writes', function() {
    let a = 1000;
    let b = 1200;
    m.STORE(64, a, 4, false);
    expect(m.READ(a, 4, false)).equals(64);
    m.STORE(8754673, b, 4, false);
    expect(m.READ(b, 4, false)).equals(8754673);

    m.LOAD(b, a, 4, false);
    expect(m.READ(b, 4, false)).equals(8754673);
    expect(m.READ(a, 4, false)).equals(8754673);
  });
});

