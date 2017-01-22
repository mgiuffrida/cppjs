'use strict';

/**
 * @param {T} cond
 * @param {string=} opt_msg
 * @return {T}
 * @template T
 */
function assert(cond, opt_msg) {
  if (cond)
    return cond;
  throw new Error(opt_msg || 'Assertion failure!');
}

module.exports = assert;
