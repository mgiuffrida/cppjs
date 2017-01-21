'use strict';

window.addEventListener('DOMContentLoaded', function() {
  assert(parser);
  var lex = require('./lexical-types');
  var types = require('./types');
  parser.yy = lex;
  parser.yy.types = types;

  var textarea = document.querySelector('#source');
  var output = document.querySelector('#output');
  textarea.focus();
  textarea.addEventListener('input', function() {
    try {
      var parsed = parser.parse(textarea.value);
      var s = '';
      for (var statement of parsed) {
        s += statement.constructor.name + '\n';
        s += statement.toString().split('\n').map(s => '  ' + s).join('\n') + '\n\n';
      }
      output.textContent = s;
    } catch (e) {console.log(e);}
  });
});
