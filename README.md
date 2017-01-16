# jscpp

A silly project to compile C++11 in JavaScript written by someone with no compilers knowledge.

## Structure

jscpp will consist of 5 core components:

1. Grammar and parser actions for a simplified C++-like language that aims to implement the C++11 specification but will
   undoubtedly remain woefully incomplete.
2. Parser for the jscpp grammar. Generated from the grammar and parser actions using
   [PEG.js](https://github.com/pegjs/pegjs).
3. Compiler. Processes the parsed structure to create a program representation. Mostly unimplemented.
4. Runner. Implements the compiler's output on a VM. Unimplemented.
5. VM. Simple virtual machine with basic instructions. Mostly unimplemented.

## Set-up

```sh
# Install:
npm install

# Run tests:
npm run mocha

# Yep, nothing else to see here:
exit
```
