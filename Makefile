JS = assert.js types.js syntax.js vm.js program.js compile.js interactive.js

# TODO: deal with all these shift/reduce warnings.
parser.js: cpp.jison cpp.jisonlex
	./node_modules/.bin/jison cpp.jison \
	cpp.jisonlex -o ./parser.js \
	> /dev/null

closure: $(JS)
	java -jar ./node_modules/google-closure-compiler/compiler.jar $(JS) \
	--language_in ECMASCRIPT6_STRICT \
	--language_out ECMASCRIPT5_STRICT \
	--process_common_js_modules \
	--common_js_entry_module=interactive.js \
	--externs externs.js \
	--new_type_inf \
	--warning_level VERBOSE \
	--create_source_map compiled-map \
	--js_output_file compiled.js

.PHONY: test
test:
	./node_modules/.bin/mocha

.PHONY: watch
watch:
	./node_modules/.bin/mocha -w
