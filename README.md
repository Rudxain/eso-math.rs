# Intro
As some of you may know, Javascript is based on the ECMAscript standard, which is a language specification that defines how JS source code must be interpreted and how it behaves at runtime. This spec is always evolving, a lot of new functions, objects, methods, syntax, etc. is added or modified, a small amount of things are deprecated and removed. However, even though JS and ES are very well supported by the community, every change must be reviewed using a strict multi-stage process known as "tc39 Process" (that's what I understood, I may be wrong), which slows down the progress to make sure only wanted/necessary things are actually changed officially. There are many proposals, some of these **VERY** useful, others are still useful but in very specific scenarios.

# Purpose
My purpose/goal with this library extension (because it extends the Standard Library) is to make it easy for developers to use future ES mathematic functions today, without writting everything from scratch (reusing code is good practice as long as the license is respected). As you may have noticed, it may seem I'm *obsessed* with `BigInt`s, that's because JS lacks **A LOT** of methods for them, so I decided to reduce "discrimination" against this powerful primitive data-type. I also want to include more *obscure* functions to serve as an educational tool for programmers and math students.

# Usage
This library doesn't require installation, because it's not an app by itself (nor a NPM package), just internal "tools" that an app may use. So I usually select all text in a file, and 📋copy-paste it into the browser console or in a `<script>` tag within a HTML file. It's also recommended to just download the file and reference it in a `<script>` tag using the `src` attribute.

# Rules/Standards
This section refers to formatting, style, paradigms, idioms, and related stuff. This repo (specially "Main.js") follows some "rules" or standards.
1. **Every function must behave as if it was built-in.** This means strictly following the ES standard and extrapolating from there, to preserve consistency as much as possible, including the smallest details.
2. **Keep it readable, simple, and educational.** Sometimes, these 3 are mutually exclusive, so I may include comments to add educational value, not just as clarification of what/why the code is doing. In the past, I sacrificed simplicity in exchange of unnecessary potential performance, but I realized the engine will (usually) know how to perfectly optimize something, and minificaton is very important because some minifiers may not recognize complex code. So keeping it simple has a net gain for everyone and everything, even though it can sacrifice educational value.
3. **Use paradigms and patterns as needed.** Every programming paradigm has its use and nobody should adhere to only 1. One should be educated enough to wisely choose the best for every case and context.
4. **Don't split too much the lines.** If something perfectly fits in 1 line, it **must** be placed in 1 line (except if it's a syntax error or it sacrifices too much readability).
5. **Formatting isn't strict.** Consistency and readability are appreciated, but formatting doesn't change the behavior of code, so it doesn't have too much priority.

# DISCLAIMER
Currently some part of source code in this repo is unfinished, badly optimized, in need of refactoring, or all at the same time (sorry lol). Most of the code is in good state though, so don't worry. If you're unsure and want to avoid problems, just read the Issues tab, most bugs and unfinished stuff are described there.

Another tip, **don't use in production.** Specially if it's something with a lot of users. Your projects shouldn't depend/rely too much on this library. This is better suited for local/private use

## WARNING: Side effects
Some built-in methods are modified by this library. This library only modifies built-ins that "need fixing" (such as `isFinite`), so most built-ins are intact.

# Related
[BigInt Math TC39 proposal](https://github.com/tc39/proposal-bigint-math)  
[Math Extensions proposal](https://github.com/rwaldron/proposal-math-extensions)
