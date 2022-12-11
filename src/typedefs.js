/**
https://developer.mozilla.org/en-US/docs/Glossary/Primitive
@typedef {numstr|boolean|undefined|null|symbol} primitive
*/

/**
any strictly numerical value
@typedef {number|bigint} numeric
*/

/**
@typedef {numeric|string} numstr
*/

/**
2-tuple of format [numerator, denominator]
@template {numeric} T
@typedef {[T, T]} fraction
*/

/**
2x2 matrix encoded as a 1D array
@template T
@typedef {[T,T,T,T]} matrix2x2
*/