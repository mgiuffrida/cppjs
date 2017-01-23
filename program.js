'use strict';

const types = require('./types');
const assert = require('./assert');

// A Program is the compiled "output" of a source file. It stores information
// about data blocks, an external symbol table and an internal symbol table.
class Program {
  constructor() {
    /** @private {number} Size of the memory used for static variables. */
    this.staticDataSize_ = 0;

    /**
     * @type {!ArrayBuffer} Bytes of static data.
     *     Starts with length 256 (bytes); when necessary, is replaced by a new
     *     ArrayBuffer of twice its size.
     */
    this.staticDataBytes = new ArrayBuffer(4096);
  }

  get staticDataSize() {
    return this.staticDataSize_;
  }

  /**
   * Adds a static object at compile time. This returns its address, and (TODO)
   * possibly adds it to the global symbol table.
   * @param {!./types.Type} type
   * @param {number|boolean} value
   * @return {number} Location of allocated object in its static data block.
   */
  addStaticObject(type, value) {
    let start = this.staticDataSize_;
    // If necessary, increment |start| to the next multiple of the size.
    if (start % type.size != 0)
      start += type.size - start % type.size;
    this.staticDataSize_ = start + type.size;

    // TODO: grow buffer.
    assert(this.staticDataSize_ < this.staticDataBytes.byteLength);

    // Create a view of the bytes we're setting, then set them from the value's
    // bytes.
    let arrayType = type.getArrayType();
    let typedArray = type.toBytes(value);
    let view = new arrayType(this.staticDataBytes, start, 1);
    view[0] = typedArray[0];
    return start;
  }
}

module.exports = {
  Program: Program,
};
