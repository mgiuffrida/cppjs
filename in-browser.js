/** @fileoverview Polyfills a few Node.js functions such as require and assert.
 * Allows using the same syntax in Node.js and in the browser, with the only
 * exception being the call to provide() that must take place in the browser.
 * Also makes closure-compiler happy.
 *
 * This does not really polyfill anything. Only the necessary Node.js functions
 * to get code running are defined. Nor does this provide an actual dependency
 * system; you must still include your source files from HTML and order them
 * properly. The point is for the same code to work in a browser and in node
 * without errors, and to compile in closure-compiler. */

console.clear();

/** @type {!Object} */
let global = this;

/**
 * `var` adds |provide| as a property on |window| (global) for easy detection.
 * @type {function(string)}
 */
var provide;

/** @type {function(string): ?} */
let require;

/** @type {!Object} */
let module = {};

/** @typedef {function(*, string=): ?} */
module.Assert;

(function() {
  /** @type {!Map} */
  let packages = new Map();

  /** @type {string} */
  let curPackageName = '';

  /**
   * @param {*} condition
   * @param {string=} opt_msg
   * @return {?}
   * @throws {Error}
   */
  let assert = function(condition, opt_msg) {
    if (condition)
      return condition;
    throw new Error(opt_msg || 'Assertion failed');
  };

  /**
   * Call at the beginning of files to use |module.exports| in the browser as
   *     in node.
   * @param {string} packageName
   */
  provide = function(packageName) {
    curPackageName = packageName;
  };

  Object.defineProperty(module, 'exports', {
    set: function(value) {
      assert(curPackageName);
      assert(!packages.has(curPackageName),
             'Package ' + curPackageName + ' already exported');
      packages.set(curPackageName, value);
      curPackageName = '';
    },
  });

  require = function(packageName) {
    packageName = packageName.replace(/^\.\//, '');
    assert(packages.has(packageName), 'Required package not found: ' + packageName);
    return packages.get(packageName);
  };

  provide('assert');
  module.exports = assert;
})();
