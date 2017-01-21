'use strict';

let expect = require('chai').expect;
let types = require('../types');
let lex = require('../lexical-types');

let parser = require('../parser').parser;
parser.yy = lex;
parser.yy.types = types;

describe('parser', function() {
  function expectParsed(text, expectedStrings) {
    if (typeof expectedStrings == 'string')
      expectedStrings = [expectedStrings];

    let parsed = parser.parse(text);
    expect(parsed).length(expectedStrings.length);
    for (let i = 0; i < parsed.length; i++)
      expect(parsed[i].toString()).equals(expectedStrings[i]);
  }

  function expectError(text, expectedError) {
    expect(parser.parse.bind(parser, text)).throw(expectedError);
  }

  it('fails on simple-declaration with empty init-declarator-list', function() {
    expectError('static;', 'declaration does not declare anything');
  });

  function expectExpressionString(text, expected) {
    var expr = /** @type {DeclarationStatement} */(
        parser.parse('int i = ' + text + ';')[0])
            .declarator.initializer.expression;
    expect(expr.toString()).equals(expected);
  }

  it('parses primary expressions', function() {
    expectExpressionString('123', 'Constant(123)');
    expectExpressionString('foo', 'UnqualifiedId(foo)');
    expectExpressionString('(bar)', 'UnqualifiedId(bar)');
  });

  it('fails on duplicate decl-specifier', function() {
    expectError('static int static foo;',
                'static specified multiple times in declaration');
    expectError('extern int int foo;',
                'int specified multiple times in declaration');
    expectError('void int static int foo;',
                'int specified multiple times in declaration');
    expectError('void int static void foo;',
                'void specified multiple times in declaration');

    // long long
    expectParsed('static long long foo;',
        'Specifiers:\n  static\n  long\n  long\n' +
        'Declarator:\n  identifier: foo');
    expectError('static long long long foo;',
                'long specified multiple times in declaration');
  });

  it('ignores empty statements', function() {
    expectParsed(';;', []);
    let parsed = parser.parse(
        '; int i = 123; int j = 234;;;int k=345 ; int l = 456;;');
    expect(parsed).length(4);
  });

  it('parses simple statements', function() {
    let result = parser.parse('int i;');
    expect(result).length(1);
    expect(result[0]).instanceof(lex.DeclarationStatement);
    let specifiers = result[0].specifiers;
    expect(specifiers).instanceof(Array);
    expect(specifiers).length(1);
    expect(specifiers[0]).equals(types.IntegralType.INT);
    let declarator = result[0].declarator;
    expect(declarator).instanceof(lex.Declarator);
    expect(declarator.identifier.id).equals('i');
    expect(declarator.initializer).is.null;

    result = parser.parse('static bool jjj = true;');
    expect(result).length(1);
    expect(result[0]).instanceof(lex.DeclarationStatement);
    specifiers = result[0].specifiers;
    expect(specifiers).instanceof(Array);
    expect(specifiers).length(2);
    expect(specifiers[0]).equals(lex.StorageClass.STATIC);
    expect(specifiers[1]).equals(types.BooleanType.BOOL);
    declarator = result[0].declarator;
    expect(declarator).instanceof(lex.Declarator);
    expect(declarator.identifier.id).equals('jjj');
    expect(declarator.initializer).is.not.null;
  });
});

