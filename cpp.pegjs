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

IntToken
  = "int" !IdentifierPart

BoolToken
  = "bool" !IdentifierPart

FooToken
  = "foo" !IdentifierPart


Literal
  = IntegerLiteral
  / BooleanLiteral

BooleanLiteral
  = TrueToken { return new Literal(BooleanType.BOOL, true); }
  / FalseToken { return new Literal(BooleanType.BOOL, false); }

IntegerLiteral
  = Digit+ { return new Literal(IntegralType.INT, parseInt(text(), 10)); }

Digit
  = [0-9]


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
  = a:DeclSpecifierSeq? _ b:InitDeclaratorList? ";" {
        return new DeclarationStatement(a, b);
      }

DeclSpecifierSeq
  = a:DeclSpecifier _ b:DeclSpecifierSeq { return [a].concat(b); }
  / a:DeclSpecifier { return [a]; }

DeclSpecifier
  = StorageClassSpecifier
  / TypeSpecifier

StorageClassSpecifier
  = StaticToken { return StorageClass.STATIC; }
  / ExternToken { return StorageClass.EXTERN; }

TypeSpecifier
  = SimpleTypeSpecifier

SimpleTypeSpecifier
  = IntToken { return IntegralType.INT; }
  / BoolToken { return BooleanType.BOOL; }

InitDeclaratorList
  = InitDeclarator

InitDeclarator
  = a:Declarator _ b:Initializer? { return new Declarator(a, b); }

Declarator
  = NoptrDeclarator

NoptrDeclarator
  = DeclaratorId

DeclaratorId
  = Identifier

Initializer
  = "=" _ a:InitializerClause { return new Initializer(a); }

InitializerClause
  = AssignmentExpression

AssignmentExpression
  = PrimaryExpression

// Simplified function syntax as a hack to get things started.
FunctionDeclaration
  = type:SimpleTypeSpecifier _ identifier:Identifier _
      "(" _ parameters:ParameterList? _ ")" _
      "{" _ body:FunctionBody _ "}" {
        return {body: body, parameters: parameters};
      }

ParameterList
  = a:Parameter b:(Comma Parameter)* { return makeList(a, b, 1); }

Parameter
  = type:SimpleTypeSpecifier _ name:Identifier {
        return new Parameter(type, name);
      }

StatementList
  = statements:(Statement _)* {
        return statements.map(s => s[0]).filter(ok);
    }

FunctionBody
  = StatementList
