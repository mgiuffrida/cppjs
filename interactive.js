'use strict';

window.addEventListener('DOMContentLoaded', function() {
  const assert = require('./assert');
  assert(parser);
  const lex = require('./syntax');
  const types = require('./types');
  const compile = require('./compile');
  parser.yy = lex;
  parser.yy.types = types;

  let textarea = document.querySelector('#source');
  let output = document.querySelector('#output');
  textarea.focus();
  textarea.addEventListener('input', function() {
    try {
      let parsed = parser.parse(textarea.value);
      let s = '';
      for (let statement of parsed) {
        s += statement.constructor.name + '\n';
        s += statement.toString().split('\n').map(s => '  ' + s).join('\n') + '\n\n';
      }
      output.textContent = s;

      try {
        console.log(compile.compile(parsed));
      } catch (e) {
        output.textContent += 'Compile error:\n' + e.message;
      }
    } catch (e) {console.log(e);}
  });
});
