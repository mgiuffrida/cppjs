// TODO: which of these tokens should specify associativity/precedence?

%token IDENTIFIER CONSTANT

%token FRIEND TYPEDEF CONSTEXPR REGISTER STATIC THREAD_LOCAL EXTERN

%token CHAR CHAR16_T CHAR32_T WCHAR_T BOOL SHORT INT LONG SIGNED UNSIGNED FLOAT
%token DOUBLE VOID AUTO

%start translation-unit
%%

translation-unit
  : declaration-seq
      { return $1;  /* Return ends lexing? */ }
  ;

// Reference: N3376.

////////////////////////////////////////////////////////////////////////
// Expressions.
////////////////////////////////////////////////////////////////////////

primary-expression
  : IDENTIFIER
      { $$ = new yy.PrimaryExpression(new yy.UnqualifiedId($1)); }
  | CONSTANT
      {
        $$ = new yy.PrimaryExpression(new yy.Constant($1));
      }
  | '(' primary-expression ')'
      { $$ = $2; }
  ;

expression  // Hack.
  : assignment-expression
  ;

logical-and-expression  // Hack.
  : primary-expression
  | logical-and-expression '&&' primary-expression
    { $$ = new yy.AndExpression($1, $3); }
  ;

logical-or-expression
  : logical-and-expression
  | logical-or-expression '||' logical-and-expression
    { $$ = new yy.OrExpression($1, $3); }
  ;

conditional-expression
  : logical-or-expression
  | logical-or-expression '?' expression ':' assignment-expression
      { yy.lex_util.NOT_IMPLEMENTED(); }
  ;

assignment-expression
  : conditional-expression
  | logical-or-expression '=' initializer-clause
      { $$ = new yy.AssignmentExpression($1, $2); }
  | throw-expression-todo
  ;


////////////////////////////////////////////////////////////////////////
// Declarations.
////////////////////////////////////////////////////////////////////////

declaration-seq
  : declaration {
      if ($1 === null)
        $$ = [];
      else
        $$ = [$1];
    }
  | declaration-seq declaration {
      if ($2 === null)
        $$ = $1;
      else
        $$ = $1.concat([$2]);
    }
  ;

declaration
  : block-declaration
  | empty-declaration
  // TODO: the rest.
  ;

block-declaration
  : simple-declaration
  // TODO: the rest.
  ;

empty-declaration
  : ';'
      { $$ = null; }
  ;

simple-declaration
  : decl-specifier-seq init-declarator-list-opt ';'
      { $$ = new yy.DeclarationStatement($1, $2); }
  | decl-specifier-seq-opt init-declarator-list ';'
      { $$ = new yy.DeclarationStatement($1, $2); }
  | attribute-specifier-seq-todo decl-specifier-seq-opt init-declarator-list ';'
  ;

decl-specifier-seq
  : decl-specifier attribute-specifier-seq-todo-opt
      {
        if ($2)
          yy.lex_util.NOT_IMPLEMENTED();
        $$ = [$1];
      }
  | decl-specifier decl-specifier-seq
      {
        if ($2.includes($1) &&
            ($1 != 'long' || $2.lastIndexOf($1) != $2.indexOf($1)))
          yy.lex_util.error($1.toString() + ' specified multiple times in declaration');
        $$ = [$1].concat($2);
      }
  ;

decl-specifier
  : storage-class-specifier
  | type-specifier
  | function-specifier-todo { yy.lex_util.NOT_IMPLEMENTED(); }
  | FRIEND { yy.lex_util.NOT_IMPLEMENTED(); }
  | TYPEDEF { yy.lex_util.NOT_IMPLEMENTED(); }
  | CONSTEXPR { yy.lex_util.NOT_IMPLEMENTED(); }
  ;

storage-class-specifier
  : REGISTER { yy.lex_util.NOT_IMPLEMENTED(); }
  | STATIC
      { $$ = yy.StorageClass.STATIC; }
  | THREAD_LOCAL { yy.lex_util.NOT_IMPLEMENTED(); }
  | EXTERN
      { $$ = yy.StorageClass.EXTERN; }
  ;

type-specifier
  : trailing-type-specifier
  | class-specifier-todo
  | enum-specifier-todo
  ;

trailing-type-specifier
  : simple-type-specifier
  | elaborated-type-specifier-todo
  | typename-specifier
  | cv-qualifier
  ;

simple-type-specifier
  : nested-name-specifier-todo-opt type-name
  | nested-name-specifier-todo-opt TEMPLATE simple-template-id-todo
  | CHAR { $$ = yy.types.IntegralType.CHAR; }
  | CHAR16_T { $$ = yy.types.IntegralType.CHAR16_T; }
  | CHAR32_T { $$ = yy.types.IntegralType.CHAR32_T; }
  | WCHAR_T { $$ = yy.types.IntegralType.CHAR32_T; }
  | BOOL { $$ = yy.types.BooleanType.BOOL; }
  | SHORT { $$ = yy.types.IntegralType.SHORT; }
  | INT { $$ = yy.types.IntegralType.INT; }
  | LONG { $$ = yy.types.IntegralType.LONG; }
  | SIGNED { $$ = yy.types.IntegralType.INT; }
  | UNSIGNED { yy.lex_util.NOT_IMPLEMENTED(); }
  | FLOAT { yy.lex_util.NOT_IMPLEMENTED(); }
  | DOUBLE { yy.lex_util.NOT_IMPLEMENTED(); }
  | VOID { $$ = yy.types.VoidType.VOID; }
  | AUTO { yy.lex_util.NOT_IMPLEMENTED(); }
  | decltype-specifier-todo
  ;


////////////////////////////////////////////////////////////////////////
// Declarators.
////////////////////////////////////////////////////////////////////////

init-declarator-list-opt
  :
  | init-declarator-list
  ;

init-declarator-list
  : init-declarator
  | init-declarator-list ',' init-declarator { yy.lex_util.NOT_IMPLEMENTED(); }
  ;

init-declarator
  : declarator initializer
      { $$ = new yy.Declarator($1, $2); }
  | declarator
      { $$ = new yy.Declarator($1, undefined); }
  ;

declarator
  : IDENTIFIER  // Hack.
      { $$ = new yy.UnqualifiedId($1); }
  ;

initializer
  : '=' initializer-clause  // Hack.
      { $$ = new yy.Initializer($2); }
  ;

initializer-clause
  : assignment-expression
  | braced-init-list-todo
  ;

////////////////////////////////////////////////////////////////////////
// [opt] definitions.
////////////////////////////////////////////////////////////////////////

decl-specifier-seq-opt : | decl-specifier-seq ;
attribute-specifier-seq-todo-opt : | attribute-specifier-seq-todo ;

