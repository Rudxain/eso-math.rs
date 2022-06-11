# Intro

# Purpose
My purpose/goal is to make it easy for developers to use future ES mathematic functions today, without writting everything from scratch (reusing code is good practice as long as the license is respected). As you may have noticed, it may seem I'm *obsessed* with `BigInt`s, that's because JS lacks **A LOT** of methods for them, so I decided to reduce "discrimination" against this powerful primitive data-type. I also want to include more *obscure* functions to serve as an educational tool for programmers and math students.

# Usage and directory tree
If you want to import individual modules, import from [`lib`](./src/lib). If you want the whole lib, import [main `index`](./src/index.js). For polyfills related with the lib use [`polyfill`](./src/polyfill). The [`helper`](./src/helper) dir is just for internal stuff.

# DISCLAIMER
This is still in the process of migrating from IIFE format to ESM format, so currently **A LOT** of files in this repo are unfinished, in need of refactoring, or all at the same time (sorry lol). If you're unsure and want to avoid problems, just read the [Issues](https://github.com/Rudxain/more-math-for-JS/issues) tab, most bugs and unfinished stuff are described there.

# Related
* [BigInt Math TC39 proposal](https://github.com/tc39/proposal-bigint-math)
* [Math Extensions proposal](https://github.com/rwaldron/proposal-math-extensions)
