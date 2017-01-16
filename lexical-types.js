'use strict';

global.provide && provide('lexical-types');

module.exports = function() {
  let assert = require('assert');

  /** @enum {symbol} */
  let Keyword = {
    THIS: Symbol('this'),
  };

  let lex = {};

  // ====Value categories====
  lex.anyvalue = class {
    get islvalue() { return false; }
    get isxvalue() { return false; }
    get isprvalue() { return false; }
    get isrvalue() { return this.isxvalue() || this.isprvalue(); }
    get isglvalue() { return this.isxvalue() || this.islvalue(); }
  };

  lex.lvalue = class extends lex.anyvalue {
    get islvalue() { return true; }
  };

  lex.xvalue = class extends lex.anyvalue {
    get isxvalue() { return true; }
  };

  lex.prvalue = class extends lex.anyvalue {
    get isprvalue() { return true; }
  };

  // ====Lexical conventions====

  /*
  lex.Identifier = class {
    constructor(name) {
      assert(name.length);
      assert(name[0] < '0' || name[0] > '9');
      this.name = name;
    }
  };
  */

  // Not a parser or compiler unit, just an abstract idea: a Literal specifies a
  // type and a value.
  lex.Literal = class {
    constructor(type, value) {
      this.type = type;
      this.value = value;
    }
  };

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

  lex.Expression = class {
    get valueType() {
      return 'ERROR';
    }

    // TODO: has-a type? (how we interpret the value of the expression, not how we
    // *determine* that value)
  };

  lex.ParenExpression = class {
    /** @param {Expression} expression */
    constructor(expression) {
      this.expression = expression;
    }
  };

  lex.UnqualifiedId = class {
    /** @param {string} identifier */
    constructor(identifier) {
      this.identifier = identifier;
    }
  };

  lex.IdExpression = class {
    /** @param {UnqualifiedId} subvalue */
    constructor(subvalue) {
      this.subvalue = subvalue;
    }
  };

  lex.PrimaryExpression = class extends lex.Expression {
    /**
     * @param {Literal|Keyword|ParenExpression|IdExpression}
     *     subvalue
     */
    constructor(subvalue) {
      super();
      this.subvalue = subvalue;
    }
  };

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
  lex.StorageDuration = {
    AUTOMATIC: Symbol('automatic'),
  };

  /** @enum {symbol} */
  lex.StorageClass = {
    STATIC: Symbol('static'),
    EXTERN: Symbol('extern'),
  };

  /** @enum {symbol} */
  lex.CV = {
    CONST: Symbol('const'),
    VOLATILE: Symbol('volatile'),
  }

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

  So I need to get started on the damn lexer.
  */

  lex.Condition = class {
    constructor(expression) {
      this.expression = expression;
    }
  };

  lex.Statement = class {
  };

  lex.ExpressionStatement = class extends lex.Statement {
    /**
     * @param {Expression=} opt_expression
     */
    constructor(opt_expression) {
      super();
      this.expression = opt_expression || null;
    }
  };

  lex.SelectionStatement = class extends lex.Statement {
    /** @param {Condition} condition */
    constructor(condition) {
      super();
      this.condition = condition;
    }
  };

  lex.IfStatement = class extends lex.SelectionStatement {
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
  };

  lex.IterationStatement = class extends lex.Statement {
    constructor() { super(); }
  };

  lex.WhileIterationStatement = class extends lex.IterationStatement {
    /**
     * @param {Condition} condition
     * @param {Statement} statement
     */
    constructor(condition, statement) {
      super();
      this.condition = condition;
      this.statement = statement;
    }
  };

  lex.DeclarationStatement = class extends lex.Statement {
    constructor(specifiers, declarator) {
      super();
      this.specifiers = specifiers;
      this.declarator = declarator;
    }
  };

  lex.Initializer = class {
    constructor(expression) {
      this.expression = expression;
    }
  };

  lex.Declarator = class {
    constructor(identifier, opt_initializer) {
      this.identifier = identifier;
      this.initializer = opt_initializer || null;
    }
  };

  lex.Parameter = class {
    constructor(type, name) {
      this.type = type;
      this.name = name;
    }
  };

  lex.ReturnStatement = class extends lex.Statement {
    constructor(expression) {
      super();
      this.expression = expression;
    }
  };

  lex.FunctionDeclaration = class FunctionDeclaration {
    constructor(type, name, parameters, opt_body) {
      this.type = type;
      this.name = name;
      this.parameters = parameters;
      this.body = opt_body == undefined ? null : opt_body;
    }
  };

  return lex;
}();
