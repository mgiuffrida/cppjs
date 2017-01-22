JS = assert.js types.js lexical-types.js vm.js program.js compile.js interactive.js

# TODO: deal with all these shift/reduce warnings.
parser.js: cpp.jison cpp.jisonlex
	./node_modules/.bin/jison cpp.jison \
	cpp.jisonlex -o ./parser.js \
	> /dev/null

closure: $(JS)
	closure_compiler $(JS) \
	--language_in ECMASCRIPT6_STRICT \
	--language_out ECMASCRIPT5_STRICT \
	--process_common_js_modules \
	--common_js_entry_module=lexical-types \
	--externs externs.js \
	--warning_level VERBOSE \
	--js_output_file compiled.js

.PHONY: test
test:
	./node_modules/.bin/mocha

.PHONY: watch
watch:
	./node_modules/.bin/mocha -w
