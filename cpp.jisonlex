DIGIT  [0-9]
L  [a-zA-Z_]
H  [a-fA-F0-9]
E  ([Ee][+-]?{DIGIT}+)
P  ([Pp][+-]?{DIGIT}+)

%%

'friend' return 'FRIEND';
'typedef' return 'TYPEDEF';
'constexpr' return 'CONSTEXPR';
'register' return 'REGISTER';
'static' return 'STATIC';
'thread_local' return 'THREAD_LOCAL';
'extern' return 'EXTERN';

'char' return 'CHAR';
'char16_t' return 'CHAR16_T';
'char32_t' return 'CHAR32_T';
'wchar_t' return 'WCHAR_T';
'bool' return 'BOOL';
'short' return 'SHORT';
'int' return 'INT';
'long' return 'LONG';
'signed' return 'SIGNED';
'unsigned' return 'UNSIGNED';
'float' return 'FLOAT';
'double' return 'DOUBLE';
'void' return 'VOID';
'auto' return 'AUTO';

[1-9]{DIGIT}*  return 'CONSTANT';
{L}({L}|{D})*  return 'IDENTIFIER';

','  return ',';
';'  return ';';
'='  return '=';
'('  return '(';
')'  return ')';
'&&'  return '&&';
'||'  return '||';
\s+  /* skip */
