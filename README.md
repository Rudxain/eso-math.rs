# NTML

## Intro

Most math libs are focused on arithmetic and algebra, and practical applications like cryptography. This lib takes a different focus based on Pure Math and Number Theory.

## Purpose

I want this to be practical and educational library, with some focus in recreational math and NT. I also want to add better support for the `BigInt`data type.

## Usage and directory tree

If you want to import individual modules, import from [`lib`](./src/lib). If you want the whole lib, import [main `index`](./src/index.js). For polyfills related with the lib use [`polyfills`](./src/polyfill.js). The [`helper`](./src/helper) dir is just for internal stuff.

### ⚠DISCLAIMER

This is still in the process of migrating from IIFE format to ESM format, so currently **A LOT** of files in this repo are unfinished, in need of refactoring, or all at the same time (sorry lol). If you're unsure and want to avoid problems, just read the Issues tab, most bugs and unfinished stuff are described there.

The API is unstable, expect breaking changes.

## Related

* [BigInt Math TC39 proposal](https://github.com/tc39/proposal-bigint-math)
* [Math Extensions proposal](https://github.com/rwaldron/proposal-math-extensions)
