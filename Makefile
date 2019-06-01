all:

test:
	./node_modules/.bin/_mocha

test2:
	node --inspect --debug-brk test2.js

c:
	@echo "chrome://inspect"
	google-chrome

test-coveralls: test
