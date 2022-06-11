1. **Every function must behave as if it was built-in.** This means strictly following the ES standard and extrapolating from there, to preserve consistency as much as possible, including the smallest details.
2. **Keep it readable, simple, and educational.** Sometimes, these 3 are mutually exclusive, so I may include comments to add educational value, not just as clarification of what/why the code is doing. In the past, I sacrificed simplicity in exchange of unnecessary potential performance, but I realized the engine will (usually) know how to perfectly optimize something, and minificaton is very important because some minifiers may not recognize complex code. So keeping it simple has a net gain for everyone and everything, even though it can sacrifice educational value.
3. **Use paradigms and patterns as needed.** Every programming paradigm has its use and nobody should adhere to only 1. One should be educated enough to wisely choose the best for every case and context.
4. **Don't split too much the lines.** If something perfectly fits in 1 line, it **must** be placed in 1 line (except if it's a syntax error or it sacrifices too much readability).
5. **Formatting isn't strict.** Consistency and readability are appreciated, but formatting doesn't change the behavior of code, so it doesn't have too much priority.