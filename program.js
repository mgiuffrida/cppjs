'use strict';

/* todo {number} MemoryLocation */

var types = require('./types');

/** Wrapper for VM commands possibly pointing to symbols. */
class ProgramCommand {
}

/* TODO
 * param {number} value
 * param {./vm.Address} to
 * param {number} size
 * param {boolean} signed
ProgramCommand.Store = class Store extends ProgramCommand {
  constructor() {
    super();
  }
}
*/

// A Program is the compiled "output" of a source file. It maintains data
// blocks, an external symbol table and an internal symbol table.
class Program {
  constructor() {
    /** @private {number} Size of the static data block. */
    this.dataSize_ = 0;

    /** @private {number} Size of 0-initialized static bss block. */
    this.bssSize_ = 0;

    this.symbols = new Map();

    /** @type {!Array<ProgramCommand>} */
    this.commands = [];
  }

  get bssSize() {
    return this.bssSize_;
  }

  get dataSize() {
    return this.dataSize_;
  }

  /**
   * Adds a static object at compile time to the data or bss block. This returns
   * its address, and (TODO) possibly adds it to the global symbol table.
   * @param {!./types.Type} type
   * @param {boolean} zeroInitialized
   * @return {number} Location of allocated object in its static data block.
   */
  addStaticObject(type, zeroInitialized) {
    let curPtr;
    if (zeroInitialized) {
      curPtr = this.bssSize_;
      this.bssSize_ += type.size; // TODO: Alignment.
    } else {
      curPtr = this.dataSize_;
      this.dataSize_ += type.size;
    }
    return curPtr;
  }
}

module.exports = {
  Program: Program,
  ProgramCommand: ProgramCommand,
};
