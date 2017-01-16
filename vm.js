global.provide && provide('vm');

let vm = {};
/** @typedef {number} */
vm.Address;

(function() {
'use strict';

// Machine specifics:
// Endianness is platform specific due to JS typed array implementation.

// ...
// See 1.9 Program execution for more.

/** @type {module.Assert} */
let assert = require('assert');

// Use fixed-length memory for now.
let MEM = new ArrayBuffer(4096);

/**
 * Gets the class needed to represent the given type of number.
 * @param {number} size Size in bytes.
 * @param {boolean} signed
 * @return {!Function} Class of the typed array.  */
function getArrayType(size, signed) {
  switch (size) {
    case 1:
      return signed ? Int8Array : Uint8Array;
    case 2:
      return signed ? Int16Array : Uint16Array;
    case 4:
      return signed ? Int32Array : Uint32Array;
    default:
      return assert(false, `Invalid size ${size} specified`);
  }
}

// Instructions.

/**
 * @param {number} value
 * @param {vm.Address} to
 * @param {number} size
 * @param {boolean} signed
 */
function store(value, to, size, signed) {
  const arrType = getArrayType(size, signed);
  let arr = new arrType(MEM, to, 1);
  arr[0] =  value;
}

/**
 * @param {vm.Address} from
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
 * @param {vm.Address} from
 * @param {vm.Address} to
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
})();
