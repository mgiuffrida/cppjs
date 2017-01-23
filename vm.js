'use strict';

/** @typedef {number} */
var Address;

// Machine specifics:
// Endianness is platform specific due to JS typed array implementation.

// ...
// See 1.9 Program execution for more.

const assert = require('./assert');

// Use fixed-length memory for now.
let MEM = new ArrayBuffer(4096);

/**
 * Gets the class needed to represent the given type of number.
 * @param {number} size Size in bytes.
 * @param {boolean} signed
 * @return {!function(new:ArrayView, number, number=, number=)} Class of the typed array.  */
/** @suppress {missingReturn} */
function getArrayType(size, signed) {
  switch (size) {
    case 1:
      return signed ? Int8Array : Uint8Array;
    case 2:
      return signed ? Int16Array : Uint16Array;
    case 4:
      return signed ? Int32Array : Uint32Array;
    default:
      assert(false, `Invalid size ${size} specified`);
      return Uint8Array;
  }
}

// Instructions.

/**
 * @param {number} value
 * @param {Address} to
 * @param {number} size
 * @param {boolean} signed
 */
function store(value, to, size, signed) {
  const arrType = getArrayType(size, signed);
  let arr = new arrType(MEM, to, 1);
  arr[0] =  value;
}

/**
 * @param {Address} from
 * @param {number} size
 * @param {boolean} signed
 * @return {number}
 */
function read(from, size, signed) {
  const arrType = getArrayType(size, signed);
  let arr = new arrType(MEM, from, 1);
  return arr[0];
}

/**
 * @param {Address} from
 * @param {Address} to
 * @param {number} size
 * @param {boolean} signed
 */
function load(from, to, size, signed) {
  const arrType = getArrayType(size, signed);
  const arrFrom = new arrType(MEM, from, 1);
  const arrTo = new arrType(MEM, to, 1);
  arrTo[0] = arrFrom[0];
}

module.exports = {
  store: store,
  read: read,
  load: load,
};
