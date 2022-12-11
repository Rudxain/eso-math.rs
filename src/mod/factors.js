import { abs } from "./std"

/**
Standard Mathematical Modulo (floor). NOT remainder.
If args are floats, it can have precision errors, similarly to the naive divison-based definition

@template {numeric} T
@param {T} n
@param {T} d
*/
//@ts-ignore
export const mod = (n, d) => /**@type {T}*/((n % d + d) % d)

/**
Euclidean algorithm for finding Highest Common Factor.
returns correct values for some non-ints (rounding errors can happen)
@template {numeric} T
@param {T} a
@param {T} b
*/
export const Euclid = (a, b) => {
	while (b) [a, b] = [b, /**@type {T}*/(a % b)]
	return abs(a)
}