JS = in-browser.js vm.js

# TODO: deal with all these shift/reduce warnings.
parser.js: cpp.jison cpp.jisonlex
	./node_modules/.bin/jison cpp.jison \
	cpp.jisonlex -o ./parser.js \
	> /dev/null

closure: $(JS)
	closure_compiler $(JS) \
	--language_in ECMASCRIPT6_STRICT \
	--language_out ECMASCRIPT5_STRICT \
	--warning_level VERBOSE --checks-only

.PHONY: test
test:
	./node_modules/.bin/mocha

.PHONY: watch
watch:
	./node_modules/.bin/mocha -w
