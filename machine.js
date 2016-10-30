// use fixed-length memory for now
let MEM = new ArrayBuffer(4096);

function getArrayType(size, signed) {
  switch (size) {
    case 1:
      return signed ? Int8Array : Uint8Array;
    case 2:
      return signed ? Int16Array : Uint16Array;
    case 4:
      return signed ? Int32Array : Uint32Array;
  }
  assert(false, `Invalid size ${size} specified`);
}

// instruction types
function STORE(value, to, size, signed) {
  var arrType = getArrayType(size, signed);
  var arr = new arrType(MEM, to, 1);
  arr[0] =  value;
}

function READ(from, size, signed) {
  var arrType = getArrayType(size, signed);
  var arr = new arrType(MEM, from, 1);
  return arr[0];
}

function LOAD(from, to, size, signed) {
  var arrType = getArrayType(size, signed);
  var arrFrom = new arrType(MEM, from, 1);
  var arrTo = new arrType(MEM, to, 1);
  arrTo[0] = arrFrom[0];
}

if (typeof exports != 'undefined') {
  exports.machine = {
    STORE: STORE,
    READ: READ,
    LOAD: LOAD,
  };
}
