# Intro
As some of you may know, Javascript is based on the ECMAscript standard, which is a language specification that defines how JS source code must be interpreted and how it behaves at runtime. This spec is always evolving, a lot of new functions, objects, methods, syntax, etc. is added or modified, a small amount of things are deprecated and removed. However, even though JS and ES are very well supported by the community, every change must be reviewed using a strict multi-stage process known as "tc39 Process" (that's what I understood, I may be wrong), which slows down the progress to make sure only wanted/necessary things are actually changed officially. There are many proposals, some of these **VERY** useful, others are still useful but in very specific scenarios.

# Purpose
My purpose/goal with this library extension (because it extends the Standard Library) is to make it easy for developers to use future ES mathematic functions today, without writting everything from scratch (reusing code is good practice as long as the license is respected). As you may have noticed, it may seem I'm *obsessed* with `BigInt`s, that's because JS lacks **A LOT** of methods for them, so I decided to reduce "discrimination" against this powerful primitive data-type. I also want to include more *obscure* functions to serve as an educational tool for programmers and math students.

# Usage
This library doesn't require installation, because it's not an app by itself (nor a NPM package), just internal "tools" that an app may use. So I usually select all text in a file, and 📋copy-paste it into the browser console or in a `<script>` tag within a HTML file. It's also recommended to just download the file and reference it in a `<script>` tag using the `src` attribute.

# DISCLAIMER
Currently some part of source code in this repo is unfinished, badly optimized, in need of refactoring, or all at the same time (sorry lol). Most of the code is in good state though, so don't worry. If you're unsure and want to avoid problems, just read the Issues tab, most bugs and unfinished stuff are described there.

Another tip, **don't use in production.** Specially if it's something with a lot of users. Your projects shouldn't depend/rely too much on this library. This is better suited for local/private use

## WARNING: Side effects
Some built-in methods are modified by this library. This library only modifies built-ins that "need fixing", so most built-ins are intact.

# Related
* [BigInt Math TC39 proposal](https://github.com/tc39/proposal-bigint-math)
* [Math Extensions proposal](https://github.com/rwaldron/proposal-math-extensions)
