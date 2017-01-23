'use strict';

const assert = require('./assert');

/** @enum {string} */
/**
 * https://github.com/google/closure-compiler/issues/2135
 * @suppress {newCheckTypes}
 */
const Keyword = {
  THIS: 'this',
};

/** @enum {number} */
/** @suppress {newCheckTypes} */
const StorageClass = {
  STATIC: 'static',
  EXTERN: 'extern',
};

/** @enum {string} */
/** @suppress {newCheckTypes} */
const StorageDuration = {
  AUTOMATIC: 'automatic',
};

/** @enum {string} */
/** @suppress {newCheckTypes} */
const CV = {
  CONST: 'const',
  VOLATILE: 'volatile',
};

function indent(s) {
  return s.toString().split('\n').map(line => '  ' + line).join('\n');
}

function fail(s) {
  throw new Error('fail: ' + s);
}

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

// ====Lexical conventions====

class Identifier {
  constructor(name) {
    assert(name.length);
    assert(name[0] < '0' || name[0] > '9');
    this.name = name;
  }

  toString() {
    return this.name;
  }
}

// Not a parser or compiler unit, just an abstract idea: a Literal specifies a
// type and a value.
class Literal {
  constructor(type, value) {
    this.type = type;
    this.value = value;
  }

  toString() {
    return this.type + '(' + this.value + ')';
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
  /** @param {string} id */
  constructor(id) {
    this.id = id;
  }

  toString() {
    return this.id;
  }
}

class IdExpression {
  /** @param {UnqualifiedId} value */
  constructor(value) {
    this.value = value;
  }

  toString() {
    return 'IdExpression: ' + this.value.toString();
  }
}

class Constant {
  /**
   * @param {!*} value
   */
  constructor(value) {
    this.value = value;
  }

  toString() {
    return this.value.toString();
  }
}

class ConstantKnownType {
  /**
   * @param {!./types.Type} type
   * @param {!*} value
   */
  constructor(type, value) {
    this.type = type;
    this.value = value;
  }

  toString() {
    return this.type + ' ' + this.value;
  }
}

class PrimaryExpression extends Expression {
  /**
   * @param {Literal|Keyword|ParenExpression|IdExpression}
   *     value
   */
  constructor(value) {
    super();
    this.value = value;
  }

  toString() {
    return this.value.constructor.name + '(' + this.value.toString() +
        ')';
  }
}

class AssignmentExpression extends Expression {
  /**
   * @param {PrimaryExpression} lhs
   * @param {AssignmentExpression|PrimaryExpression} rhs
   */
  constructor(lhs, rhs) {
    super();
    this.lhs = lhs;
    this.rhs = rhs;
  }

  toString() {
    return this.lhs.toString() + ' = ' + this.rhs.constructor.name +
        '(' + this.rhs.toString() + ')';
  }
}

// Abstraction of expressions of binary operations.
class BinaryExpression extends Expression {
  /**
   * @param {!Expression} lhs
   * @param {!Expression} rhs
   * @param {string} operator For debug purposes.
   */
  constructor(lhs, rhs, operator) {
    super();
    this.lhs = lhs;
    this.rhs = rhs;
    this.operator = operator;
  }

  toString() {
    return this.constructor.name + '(' + this.lhs.toString() + ', ' + this.rhs.toString() + ')';
  }
}

class OrExpression extends BinaryExpression {
  constructor(lhs, rhs) {
    super(lhs, rhs, '||');
  }
}

class AndExpression extends BinaryExpression {
  constructor(lhs, rhs) {
    super(lhs, rhs, '&&');
  }
}

class FunctionCall extends Expression {
  /*
   * TODO
   * param {PrimaryExpression} name
   * param  {ExpressionList=} opt_params
   */
  constructor(name, opt_params) {
    super();
    this.name = name;
    this.params = opt_params;
  }

  toString() {
    return 'call ' + this.name.toString() + ' (' +
        (this.params ? this.params.map(p => p.toString()).join() + ')'
                    : '')
        + ')';
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

// An object, a region of storage. Possible result of an expression.
/*
 * null means it doesn't have that property
 * undefined means we don't know/haven't decided that property yet
 * typedef {{
 *   name: ?string,
 *   storageDuration: !ns.StorageDuration,
 *   type: !Type,
 *   subobjects: ?Array<object>,
 *   parent_object: ?object,
 *   size: number,
 *   address: number,
 * }}
 */
//let object;

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
*/

class Condition {
  constructor(expression) {
    this.expression = expression;
  }

  toString() {
    return 'Expression(' + this.expression + ')';
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

  toString() {
    return this.expression.constructor.name + '(' + this.expression + ')';
  }
}

class SelectionStatement extends Statement {
  /** @param {Condition} condition */
  constructor(condition) {
    super();
    this.condition = condition;
  }

  toString() {
    return 'Condition(' + this.condition + ')';
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
  /**
   * @param {?Array<number>} specifiers
   * @param {!Declarator} declarator
   */
  constructor(specifiers, declarator) {
    super();
    this.specifiers = specifiers || [];
    this.declarator = declarator;
    if (!declarator)
      fail('declaration does not declare anything');
  }

  toString() {
    let s = 'Specifiers:\n';
    for (var specifier of this.specifiers)
      s += '  ' + specifier.toString() + '\n';
    s += 'Declarator:\n' + indent(this.declarator);
    return s;
  }
}

class Initializer {
  /**
   * @param {!Expression} expression
   */
  constructor(expression) {
    this.expression = expression;
  }

  toString() {
    return 'Expression(' + this.expression + ')';
  }
}

class Declarator {
  constructor(identifier, opt_initializer) {
    this.identifier = identifier;
    this.initializer = opt_initializer || null;
  }

  toString() {
    return 'identifier: ' + this.identifier +
      (this.initializer ? '\n' + 'initializer: ' + this.initializer : '');
  }
}

class Parameter {
  constructor(type, name) {
    this.type = type;
    this.name = name;
  }

  toString() {
    return this.name + ' (' + this.type + ')';
  }
}

class ReturnStatement extends Statement {
  constructor(expression) {
    super();
    this.expression = expression;
  }

  toString() {
    return 'return ' + this.expression;
  }
}

class FunctionDeclaration {
  constructor(type, name, parameters, opt_body) {
    this.type = type;
    this.name = name;
    this.parameters = parameters;
    this.body = opt_body == undefined ? null : opt_body;
  }

  toString() {
    var s = 'return type: ' + this.type + '\n';
    s += 'name: ' + this.name + '\n';
    s += 'paremeters:\n';
    s += indent(this.parameters.map(p => p.toString()).join('\n')) + '\n';
    s += 'body:\n';
    s += indent(this.body.map(statement => statement.constructor.name + '\n' + 
          indent(statement.toString())).join('\n'));
    return s;
  }
}

module.exports = {
  Keyword: Keyword,
  StorageDuration: StorageDuration,
  StorageClass: StorageClass,
  CV: CV,
  anyvalue: anyvalue,
  lvalue: lvalue,
  xvalue: xvalue,
  prvalue: prvalue,
  Literal: Literal,
  Expression: Expression,
  ParenExpression: ParenExpression,
  Identifier: Identifier,
  UnqualifiedId: UnqualifiedId,
  Constant: Constant,
  IdExpression: IdExpression,
  PrimaryExpression: PrimaryExpression,
  AssignmentExpression: AssignmentExpression,
  BinaryExpression: BinaryExpression,
  OrExpression: OrExpression,
  AndExpression: AndExpression,
  FunctionCall: FunctionCall,
  Condition: Condition,
  Statement: Statement,
  ExpressionStatement: ExpressionStatement,
  SelectionStatement: SelectionStatement,
  IfStatement: IfStatement,
  IterationStatement: IterationStatement,
  WhileIterationStatement: WhileIterationStatement,
  DeclarationStatement: DeclarationStatement,
  Initializer: Initializer,
  Declarator: Declarator,
  Parameter: Parameter,
  ReturnStatement: ReturnStatement,
  FunctionDeclaration: FunctionDeclaration,
  lex_util: {
    makeList: function(head, tail, index) {
      return [head].concat(
          tail.map(result => result[index])
          );
    },

    ok: function(x) { return !!x; },

    NOT_IMPLEMENTED: function() { throw new Error('Not implemented.'); },

    error: function(s) {
      throw new Error('Syntax error: ' + s);
    },
  },
};
