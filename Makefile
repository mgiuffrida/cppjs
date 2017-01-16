.PHONY: closure
closure:
	closure-compiler in-browser.js vm.js \
	  ${CLOSURE_ARGS}

.PHONY: test
test:
	./node_modules/.bin/mocha

CLOSURE_ARGS = --language_in ECMASCRIPT6_STRICT \
	--language_out ECMASCRIPT5_STRICT \
	--warning_level VERBOSE --checks-only

