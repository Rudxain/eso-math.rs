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
https://developer.mozilla.org/en-US/docs/Glossary/Primitive
@typedef {numstr|boolean|undefined|null|symbol} primitive
*/

/**
https://developer.mozilla.org/en-US/docs/Glossary/Primitive
@template T
@typedef {T extends primitive ? never : T} NonPrimitive
*/