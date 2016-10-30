'use strict';

var g = {};

function assert(cond) {
  if (cond)
    return;
  throw new Error('Assertion failure!');
}

/** @enum {symbol} */
var Keyword = {
  THIS: Symbol('this'),
};

// Implementation-defined parameters:
var SIZEOF_INT = 4;
// ...
// See 1.9 Program execution for more.

// ====Value categories====
class anyvalue {
  get islvalue() { return false; }
  get isxvalue() { return false; }
  get isprvalue() { return false; }
  get isrvalue() { return this.isxvalue() || this.isprvalue(); }
  get isglvalue() { return this.isxvalue() || this.islvalue(); }
}

class lvalue extends anyvalue {
  get islvalue() { return true; }
}

class xvalue extends anyvalue {
  get isxvalue() { return true; }
}

class prvalue extends anyvalue {
  get isprvalue() { return true; }
}

// ====Types====

class Type {
  constructor(name, size) {
    this.name = name;
    this.size = size;
  }
}

class IntegralType extends Type {
  /**
   * @param {string} name
   * @param {number} size Width of the type, in bytes.
   */
  constructor(name, size) {
    super(name, size);
  }

  // TODO: Specializations for different sizes and signedness.
  // TODO: Range validation and type detection.
}

class BooleanType extends Type {

  /**
   * @param {string} name
   * @param {number} size Width of the type, in bytes.
   */
  constructor(name, size) {
    super(name, size);
  }
}

IntegralType.INT = new IntegralType('int', 4);
BooleanType.BOOL = new BooleanType('bool', 1);

// ====Lexical conventions====

class Identifier {
  constructor(identifier) {
    assert(identifier.length);
    assert(identifier[0] < '0' || identifier[0] > '9');
    this.identifier = identifier;
  }
}

// Not a parser or compiler unit, just an abstract idea: a Literal specifies a
// type and a value.
class Literal {
  constructor(type, value) {
    this.type = type;
    this.value = value;
  }
}

// ====Expressions====

/*
Simplified grammar:
  primary-expression:
      literal
      this
      ( expression )
      id-expression
    id-expression:
      unqualified-id
    unqualified-id:
      identifier
*/

class Expression {
  get valueType() {
    return 'ERROR';
  }

  // TODO: has-a type? (how we interpret the value of the expression, not how we
  // *determine* that value)
}

class ParenExpression {
  /** @param {Expression} expression */
  constructor(expression) {
    this.expression = expression;
  }
}

class UnqualifiedId {
  /** @param {Identifier} identifier */
  constructor(identifier) {
    this.identifier = identifier;
  }
}

class IdExpression {
  /** @param {UnqualifiedId} subvalue */
  constructor(subvalue) {
    this.subvalue = subvalue;
  }
}

class PrimaryExpression extends Expression {
  /**
   * @param {Literal|Keyword|ParenExpression|IdExpression}
   *     subvalue
   */
  constructor(subvalue) {
    super();
    this.subvalue = subvalue;
  }
}

// entity: a value, object, reference, function, enumerator, type, class member,
//     template, template specialization, namespace, parameter pack, or |this|.
// name: use of an identifier, [...] that denotes an entity or label.
// declaration: every name that denotes an entity is introduced by a
//     declaration.
// variable: a variable is introduced by the declaration of a reference other
//     than a non-static data member or of an object; the variable's name
//     denotes the reference or object.

// memory location: an object of scalar type, or a maximal sequence of adjacent
// bit-fields

/** @enum {symbol} */
var StorageDuration = {
  AUTOMATIC: Symbol('automatic'),
};

/** @enum {symbol} */
var StorageClass = {
  STATIC: Symbol('static'),
  EXTERN: Symbol('extern'),
};

// An object, a region of storage. Possible result of an expression.
/**
 * null means it doesn't have that property
 * undefined means we don't know/haven't decided that property yet
 * @typedef {{
 *   name: ?string,
 *   storageDuration: !StorageDuration,
 *   type: !Type,
 *   subobjects: ?Array<object>,
 *   parent_object: ?object,
 *   size: number,
 *   address: number,
 * }}
 */
var object;

/*
This is annoying:
  A token can consist of a literal.
  A primary-expression can consist of a literal.

It's not that a literal IS-A token and IS-A primary-expression.
Neither are there separate LiteralToken and LiteralPrimaryExpression types.

A token *can be* a literal. A primary-expression *can be* a literal.
But a primary-expression could also be a combination of a literal and something else.

There should be 2 considerations:
1. Ease of constructing (in the parser, or from parser output).
2. Ease of compiling (turning into executable code).

When constructing, which is like "reducing" a bunch of words, I only need to say
"this thing is a [[name]]".

When compiling, I need to process semantics: this thing is acting as a [[role]].

....
*/



// Declarations.

/*

A statement is a *union* of things.
An expression *can be* a statement, or it can be part of another expression...

Simplified grammar:

statement:
    expression-statement
    selection-statement
    iteration-statement
    declaration-statement:
      simple-declaration:
        init-declarator:
          declarator-id initializer?
            initializer:
              = primary-expression
              (actually, it's "assignment-expression", but jesus christ that
                  goes deep

  expression-statement:
    expression=;
  selection-statement:
    if ( condition ) statement
    if ( condition ) statement else statement
  condition:
    expression
  iteration-statement:
    while (condition) statement

In terms of optimization, how the hell do we check that something is of the
right type (eg, assignment-expression can be a primary-expression through a
LONG chain of expression definitions)?

maybe this is why we need a real lexer? It's my job to analyze the expression,
not to determine the type of the expression.

So like, given "= assignment-expression", my lexer just needs to return
something that can satisfy that definition; it might just be a
PrimaryExpression. The result would *lexically* flow up through to the full
statement itself.

So I need to get started on the damn lexer.
*/

class Condition {
  constructor(expression) {
    this.expression = expression;
  }
}

class Statement {
}

class ExpressionStatement extends Statement {
  /**
   * @param {Expression=} opt_expression
   */
  constructor(opt_expression) {
    super();
    this.expression = opt_expression || null;
  }
}

class SelectionStatement extends Statement {
  /** @param {Condition} condition */
  constructor(condition) {
    super();
    this.condition = condition;
  }
}

class IfStatement extends SelectionStatement {
  /**
   * @param {Condition} condition
   * @param {Statement} thenBranch
   * @param {Statement=} opt_elseBranch
   */
  constructor(condition, thenBranch, opt_elseBranch) {
    super(condition);
    this.thenBranch = thenBranch;
    this.elseBranch = opt_elseBranch || null;
  }
}

class IterationStatement extends Statement {
  constructor() { super(); }
}

class WhileIterationStatement extends IterationStatement {
  /**
   * @param {Condition} condition
   * @param {Statement} statement
   */
  constructor(condition, statement) {
    super();
    this.condition = condition;
    this.statement = statement;
  }
}

class DeclarationStatement extends Statement {
  constructor(specifiers, declarator) {
    super();
    this.specifiers = specifiers;
    this.declarator = declarator;
  }
}

class Initializer {
  constructor(expression) {
    this.expression = expression;
  }
}

class Declarator {
  constructor(declarator, opt_initializer) {
    this.declarator = declarator;
    this.initializer = opt_initializer || null;
  }
}

// Translation unit.
class TranslationUnit {
  constructor() {
    this.decls = [];
  }
  push(decl) {
    this.decls.push(decl);
  }
}

(function() {
  /** @return {TranslationUnit} */
  function getFakeTU() {
    var u = new TranslationUnit;
    u.push(
        new IfStatement(
          new Condition(
            new PrimaryExpression(
              new Literal(BooleanType.BOOL, true))),
          new ExpressionStatement(
            new PrimaryExpression(
              new Literal(IntegralType.INT, 12)))));
    u.push(
        new ExpressionStatement(
          new PrimaryExpression(
            new Literal(BooleanType.BOOL, false))));
    return u;
  }

  /** @param {TranslationUnit} u */
  function compile(u) {
//    console.log(u);
  }

  compile(getFakeTU());
})();


/*
   option 1: compile to basic operations, use a huge Array for memory, etc.
   option 2: keep things in semantic objects, compiling creates real JS classes
   out of C++ classes, etc.; able to not only step through a web-based
   "debugger", but can inspect the actual classes as easy as JS syntax allows.

   possibly doable if we can map C++ class features to JS classes
   but.. how the hell would I do something like, say, pointer arithmetic with
   class members?
*/
