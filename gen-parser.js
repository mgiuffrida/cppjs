'use strict';

global.provide && provide('gen-parser');

/*
 * Sample usage:
 *
 * var gen_parser = require('gen-parser');
 * var parser = gen_parser.genParser();
 * parser.parse('int i;');
 */
(function() {

let assert = require('assert');
let lex = require('./lexical-types');
let types = require('./types');
let peg = global['peg'];
if (!peg)
  peg = require('pegjs');

let dependencyPrefix = typeof window == 'undefined' ? '../../../../' : './';
let dependencies = {
  types: dependencyPrefix + 'types',
  lex: dependencyPrefix + 'lexical-types',
};

function genParser() {
  try {
    return peg.generate(grammar, {
      format: 'commonjs',
      dependencies: dependencies
    });
  } catch (e) {
    console.error('Exception generating parser');
    throw e;
  }
}

function parse(input) {
  let parser = genParser();
  try {
    return parser.parse(input);
  } catch (e) {
    if (e.name == 'SyntaxError') {
      console.error(e.name + ': ' + e.message);
      let sourceLines = input.split('\n');
      let indicator = '';
      for (let i = 0; i < e.location.start.offset; i++)
        indicator += ' ';
      for (let i = e.location.start.offset; i <= e.location.end.offset; i++)
        indicator += '^';
      sourceLines.splice(e.location.end.line, 0, indicator);
      console.error(sourceLines.join('\n'));
      window.e = e;
    }
    throw e;
  }
}

module.exports = {
  genParser: genParser,
  parse: parse,
};

let grammar = String.raw`

// Reference: N3776

{
  function makeList(head, tail, index) {
    return [head].concat(
      tail.map(result => result[index])
    );
  }

  function ok(x) { return !!x; }
}

start
  = StatementList

Whitespace
  = "\t"
  / " "

LineTerminator
  = "\n"
  / "\r"

Separator =
  (Whitespace / LineTerminator)+ { return ''; }

// Skip whitespace.
_
  = skip:(Whitespace / LineTerminator)* { return ''; }

Comma
  = _ "," _

// Reusable types before specific types...

TrueToken
  = "true" !IdentifierPart

FalseToken
  = "false" !IdentifierPart

StaticToken
  = "static" !IdentifierPart

ExternToken
  = "extern" !IdentifierPart

VoidToken
  = "void" !IdentifierPart

BoolToken
  = "bool" !IdentifierPart

IntToken
  = "int" !IdentifierPart

ShortToken
  = "short" !IdentifierPart

LongToken
  = "long" !IdentifierPart

ReturnToken
  = "return" !IdentifierPart

ConstToken
  = "const" !IdentifierPart

VolatileToken
  = "volatile" !IdentifierPart


Literal
  = IntegerLiteral
  / BooleanLiteral

BooleanLiteral
  = TrueToken { return new lex.Literal(types.BooleanType.BOOL, true); }
  / FalseToken { return new lex.Literal(types.BooleanType.BOOL, false); }

IntegerLiteral
  = Digit+ { return new lex.Literal(types.IntegralType.INT, text()); }

Digit
  = [0-9]

UnqualifiedIdentifier
  = ! ReturnToken a:Identifier { return a; }

Identifier
  = IdentifierNonDigit IdentifierPart* { return text(); }

IdentifierPart
  = [a-zA-Z_0-9]

IdentifierNonDigit
  = [a-zA-Z_]


Expression
  = PrimaryExpression

PrimaryExpression
  = Literal
  / "(" _ a:PrimaryExpression _ ")" { return a; }
  / Identifier


Statement
  = ExpressionStatement
  / DeclarationStatement

ExpressionStatement
  = e:Expression? ";" { return e; }

DeclarationStatement
  = SimpleDeclaration
  / FunctionDeclaration  // Hack.

SimpleDeclaration
  = a:DeclSpecifierSeq _ b:InitDeclaratorList ";" {
      return new lex.DeclarationStatement(a, b);
    }

DeclSpecifierSeq
  = a:DeclSpecifier _ b:DeclSpecifierSeq {
      if (b.includes(a))
        error(a.toString() + ' specified multiple times in declaration');
      return [a].concat(b);
    }
  / a:DeclSpecifier { return [a]; }

DeclSpecifier
  = StorageClassSpecifier
  / CVQualifier
  / TypeSpecifier

StorageClassSpecifier
  = StaticToken { return lex.StorageClass.STATIC; }
  / ExternToken { return lex.StorageClass.EXTERN; }

CVQualifier
  = ConstToken { return lex.CV.CONST; }
  / VolatileToken { return lex.CV.VOLATILE; }

TypeSpecifier
  = SimpleTypeSpecifier

// TODO: Types are more complicated than this; a type can be something like
// "reference to pointer to pointer to unsigned short int"
// implying that types are... recursive?
SimpleTypeSpecifier
  = BoolToken { return types.BooleanType.BOOL; }
  / IntToken { return types.IntegralType.INT; }
  / ShortToken { return types.IntegralType.SHORT; }
  / LongToken _ LongToken { return types.IntegralType.LONG_LONG; }
  / LongToken { return types.IntegralType.LONG; }

SimpleTypeSpecifierVoid
  = SimpleTypeSpecifier
  / VoidToken { return types.VoidType.VOID; }

InitDeclaratorList
  = InitDeclarator

InitDeclarator
  = a:Declarator _ b:Initializer? { return new lex.Declarator(a, b); }

Declarator
  = NoptrDeclarator

NoptrDeclarator
  = DeclaratorId

DeclaratorId
  = UnqualifiedIdentifier

Initializer
  = "=" _ a:InitializerClause { return new lex.Initializer(a); }

InitializerClause
  = AssignmentExpression

AssignmentExpression
  = PrimaryExpression

// Simplified function syntax as a hack to get things started.
FunctionDeclaration
  = FunctionDefinition
  / type:SimpleTypeSpecifierVoid _ identifier:Identifier _
        "(" _ parameters:ParameterList? _ ")" _ {
      return new lex.FunctionDeclaration(type, identifier, parameters);
    }

FunctionDefinition
  = type:SimpleTypeSpecifierVoid _ identifier:Identifier _
        "(" _ parameters:ParameterList? _ ")" _
        "{" _ body:FunctionBody _ "}" {
      return new lex.FunctionDeclaration(type, identifier, parameters, body);
    }

ParameterList
  = a:Parameter b:(Comma Parameter)* { return makeList(a, b, 1); }

Parameter
  = type:SimpleTypeSpecifier _ name:Identifier {
      return new lex.Parameter(type, name);
    }

StatementList
  = statements:(_ Statement _)* {
      return statements.map(s => s[1]).filter(ok);
    }

StatementListInFunction
  = statements:((Statement / ReturnStatement) _)* {
      return statements.map(s => s[0]).filter(ok);
    }

ReturnStatement
  = "return" Separator e:Expression ";" { return new lex.ReturnStatement(e); }

FunctionBody
  = StatementListInFunction
  `
})();
