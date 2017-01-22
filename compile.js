'use strict';

var assert = require('assert');
const types = require('./types');
const lex = require('./lexical-types');
var program = require('./program');

let prog = new program.Program();

// Implementation-defined parameters:
let SIZEOF_INT = 4;

// program types

/** @param {./types.Type} type */
function foo(type) { console.log(type); }

// should this be "object"?
class Declaration {
  /**
   * @param {!string} id
   * @param {./types.Type} type
   * @param {!./lexical-types.StorageClass=} opt_storageClass
   */
  constructor(id, type, opt_storageClass) {
    this.id = id;
    this.type = type;
    this.storageClass =
        (opt_storageClass === undefined ? undefined : opt_storageClass);
    this.globalAddress = undefined;
  }
}

class Scope {
  /**
   * @param {!Scope=} opt_parent
   */
  constructor(opt_parent) {
    this.parent = opt_parent || null;
    /** @type {!Map<string, !Declaration>} */
    this.declarations = new Map();
  }

  /** @param {!Declaration} declaration */
  declare(declaration) {
    this.declarations.set(declaration.id, declaration);
  }

  /**
   * @param {string} identifier
   * @param {boolean} recursive
   * @return {boolean}
   */
  has(identifier, recursive) {
    if (this.declarations.has(identifier))
      return true;
    if (recursive && this.parent)
      return this.parent.has(identifier, recursive);
    return false;
  }

  /**
   * @param {string} identifier
   * @param {boolean} recursive
   * @return {?{scope: !Scope, declaration: !Declaration}}
   */
  find(identifier, recursive) {
    if (this.declarations.has(identifier))
      return {
        scope: this,
        declaration: /** @type {!Declaration} */(this.declarations.get(identifier))};
    if (recursive && this.parent)
      return this.parent.find(identifier, true);
    return null;
  }
}

class BaseSymbol {
  /**
   * @param {!./lexical-types.UnqualifiedId} id
   */
  constructor(id) {
    this.id = id;
  }
}

// just static variables?
class DataSymbol extends BaseSymbol {
  /**
   * @param {!./lexical-types.UnqualifiedId} id
   * @param {!./types.Type} type
   */
  constructor(id, type) {
    super(id);
    this.type = type;
  }
}

class FunctionSymbol extends BaseSymbol {
  /* TODO
   * param {string} id
   * param {!./types.Type} returnType
   * param {!Array{string, !./types.Type}} parameters
   */
  constructor(id, returnType, parameters) {
    super(id);
    this.returnType = returnType;
  }
}

/**
 * @param {!Array<!./lexical-types.Statement>} statements
 * @return {!Scope}
 */
function compile(statements) {
  // Start with three simple tasks:
  // 1. Build up the table of declarations (objects) as we go.
  let globalScope = new Scope();
  let scope = globalScope;

  // 2. Create an address model for the translation unit. (Should include
  // function declarations here to "run"?)
  let curStackPtr = 0;

  // 3. Create a list of instructions to execute (output).
  /** @type {!Array<string>} */
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

      let prevDeclaration = scope.find(id, false);
      assert(!prevDeclaration, `Redefinition of ${id}`);

      /* TODO: ???
      assert(!prevDeclaration || !prevDeclaration.declaration.initializer,
             `Declaration of ${id} after initialization`);
             */

      let declaration = new Declaration(id, type, storageClass);
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
        if (storageClass == lex.StorageClass.STATIC) {
          // Globally, this object lives at |address|.
          declaration.globalAddress = prog.addStaticObject(type, false);
          //if (statement.declarator.initializer) {
          //}
        }

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
      scope.declare(declaration);
    }
  }
  return globalScope;
}

// TODO: define interface.
module.exports = {
  compile: compile,
};
