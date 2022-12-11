/**
Standard Mathematical Modulo (floor). NOT remainder.
If args are floats, it can have precision errors, similarly to the naive divison-based definition

@template {numeric} T
@param {T} n
@param {T} d
*/
//@ts-ignore
export const mod = (n, d) => /**@type {T}*/((n % d + d) % d)