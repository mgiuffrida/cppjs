'use strict';

global.provide && provide('compile');

module.exports = function() {

var assert = require('assert');
var types = require('./types');
var lex = require('./lexical-types');
var Program = require('./program');

// Implementation-defined parameters:
let SIZEOF_INT = 4;

// program types

// should this be "object"?
class Declaration {
  /**
   * @param {!string} id
   * @param {!types.Type} type
   * @param {!lex.StorageClass=} opt_storageClass
   */
  constructor(id, type, opt_storageClass) {
    this.id = id;
    this.type = type;
    this.storageClass =
        (opt_storageClass === undefined ? undefined : opt_storageClass);
  }
}

class Scope {
  constructor(type, opt_parent) {
    this.type = type;
    this.parent = opt_parent || null;
    /** @type {!Map<!Declaration>} */
    this.decls = new Map();
  }

  /** @param {!Declaration} decl */
  declare(decl) {
    this.decls.set(decl.id, decl);
  }

  /**
   * @param {string} identifier
   * @param {boolean} recursive
   * @return {boolean}
   */
  has(identifier, recursive) {
    if (this.decls.has(identifier))
      return true;
    if (recursive && this.parent)
      return this.parent.has(identifier, recursive);
  }

  /**
   * @param {string} identifier
   * @param {boolean} recursive
   * @return {?{scope: !Scope, decl: !DeclarationStatement}}
   */
  find(identifier, recursive) {
    if (this.decls.has(identifier))
      return {scope: this, decl: this.decls.get(identifier)};
    if (recursive && this.parent)
      return this.parent.find(identifier, true);
    return null;
  }
}

class BaseSymbol {
  /**
   * @param {!UnqualifiedId} id
   */
  constructor(id) {
    this.id = id;
  }
}

// just static variables?
class DataSymbol extends BaseSymbol {
  /**
   * @param {!UnqualifiedId} id
   * @param {!types.Type} type
   */
  constructor(id, type) {
    super(id);
    this.type = type;
  }
}

class FunctionSymbol extends BaseSymbol {
  /**
   * @param {string} id
   * @param {!types.Type} returnType
   * @param {!Array{string, !types.Type}} parameters
   */
  constructor(id, returnType, parameters) {
    super(id);
    this.returnType = type;
  }
}

function compile(statements) {


  // Start with three simple tasks:
  // 1. Build up the table of declarations (objects) as we go.
  let globalScope = new Scope();
  let scope = globalScope;

  // 2. Create an address model for the translation unit. (Should include
  // function declarations here to "run"?)
  let curStackPtr = 0;


  // 3. Create a list of instructions to execute (output).
  let instrs = [];

  for (let statement of statements) {
    if (statement instanceof lex.DeclarationStatement) {
      let id = statement.declarator.identifier;
      let storageClass = undefined;
      let type = undefined;
      for (let specifier of statement.specifiers) {
        if (specifier == lex.StorageClass.STATIC ||
            specifier == lex.StorageClass.EXTERN) {
          assert(!storageClass,
                 `Multiple storage classes in declaration of ${id}`);
          storageClass = specifier;
        } else if (specifier instanceof types.Type) {
          assert(!type, `Multiple types in declaration of ${id}`);
          type = specifier;
        }
      }
      assert(type, `Type specifier not found in declaration of ${id}`);

      let prevDecl = scope.find(id, false);
      assert(!prevDecl || !prevDecl.decl.initializer,
             `Declaration of ${id} after initialization`);
      let decl = new Declaration(id, type, storageClass);
      // Add the declarator to the stack offset. (Should work on functions
      // first.)

      if (statement.declarator.initializer) {
        assert(storageClass != lex.StorageClass.EXTERN,
               `Definition of extern ${id}`);
        // ...
        // for static:
        // say "this named variable refers to this object, which is at this
        // address", so later uses of it resolve to that object
        // append an instruction to initialize the object in memory at its
        // known address
        //
        // for auto:
        // say "in this scope, this named variable refers to this object, which
        // will be at a particular offset in the stack." we know what part of
        // the stack it will be in, right?
        // append an instruction to initialize the object in memory at its
        // offset within the stack. (the stack will point to the current stack
        // instance, e.g. the same function at multiple levels in the stack uses
        // two different parts of the stack.)

        // Generate instructions to evaluate the expression and store its result
        // at the declarator's stack offset.
      }
      scope.declare(decl);
    }
  }
  return globalScope;
}

// TODO: define interface.
return {
  compile: compile,
};

}();
