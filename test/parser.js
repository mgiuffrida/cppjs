let expect = require('chai').expect;

let lex = require('../lexical-types');
let types = require('../types');
let gen_parser = require('../gen-parser')

describe('parser', function() {
  let parser;

  before(function() {
    parser = gen_parser.genParser();
  });

  function parse(source) {
    let result = parser.parse(source);
    expect(result).is.a('array');
    return result;
  }

  it('parses simple statements', function() {
    let result = parse('int i;');
    expect(result).length(1);
    expect(result[0]).instanceof(lex.DeclarationStatement);
    var specifiers = result[0].specifiers;
    expect(specifiers).instanceof(Array);
    expect(specifiers).length(1);
    expect(specifiers[0]).equals(types.IntegralType.INT);
    var declarator = result[0].declarator;
    expect(declarator).instanceof(lex.Declarator);
    expect(declarator.identifier).equals('i');
    expect(declarator.initializer).is.null;

    result = parse('static bool jjj = true;');
    expect(result).length(1);
    expect(result[0]).instanceof(lex.DeclarationStatement);
    var specifiers = result[0].specifiers;
    expect(specifiers).instanceof(Array);
    expect(specifiers).length(2);
    expect(specifiers[0]).equals(lex.StorageClass.STATIC);
    expect(specifiers[1]).equals(types.BooleanType.BOOL);
    var declarator = result[0].declarator;
    expect(declarator).instanceof(lex.Declarator);
    expect(declarator.identifier).equals('jjj');
    expect(declarator.initializer).is.not.null;
  });
});


