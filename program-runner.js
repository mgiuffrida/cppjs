'use strict';

global.provide && provide('program-runner');

var types = require('./types');
var Program = require('./program');
var vm = require('./vm');

class ProgramRunner {
  /** @param {!Program} */
  constructor(program) {
    /** @private */ this.program_ = program;

    // Set up the static bss block.
    // MEM is zero-initialized anyway, so we don't have to do anything here.
    /** @private */ this.bssBlockStart_ = 0;

    /** @private */ this.dataBlockStart_ = this.program_.bssSize;
  }
}

module.exports = ProgramRunner;
