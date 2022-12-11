import '../typedefs'
import { isInt, isNegZero } from '../mod/value check'
import { autoN } from '../mod/sanitize'
import { trunc, floor } from './rounding'

const IntN = BigInt, lb = Math.log2 //in general, lb has better precision and performance than ln

/**
absolute value
@template {numeric} T
@param {T} x
*/
export const abs = x => /**@type {T}*/(x < 0 || isNegZero(x) ? -x : x)

/**
@template {numeric} T
@param {T} x
@return {T}
*/
export const sign = x => x == 0 ? autoN(0, x) : (x < 0 ? autoN(-1, x) : autoN(1, x))

/**
get a 2-tuple with both the sign and absolute value of `x`. similar to `divrem`
@template {numeric} T
@param {T} x
@return {[T, T]}
*/
export const signabs = x => [sign(x), abs(x)]

/**
calculate truncated division with remainder, returning both values in a 2-tuple
@template {numeric} T
@param {T} n dividend/numerator
@param {T} d divisor/denominator
*/
export const divrem = (n, d) => /**@type {[T, T]}*/([trunc(n / d), n % d])

/**
calculate Euclidean division with remainder, returning both values in a 2-tuple.

Currently, this is incorrect for `BigInt`s
@template {numeric} T
@param {T} n dividend/numerator
@param {T} d divisor/denominator
*/
export const divEuclid = (n, d) => /**@type {T}*/(floor(n / abs(d)) * sign(d))

/**
@param {*} x
*/
export const isEven = x => isInt(x) && x % autoN(2, x) == 0

/**
@param {*} x
*/
export const isOdd = x => isInt(x) && x % autoN(2, x) != 0

/**
@template {numstr} T
@param {T} x
@param {T} min
@param {T} max
*/
export const clamp = (x, min, max) => x > max ? max : x < min ? min : x

/**
@template {NumberConstructor | BigIntConstructor | StringConstructor} T
@param {numstr[]} arr values to compare
@param {boolean} op falsy: min, truthy: max
@param {T} f type coercion fn
*/
export const minmax = (arr, op, f) => {
	let i = 0
	let v = /**@type {T extends NumberConstructor ? number : T extends BigIntConstructor ? bigint : string}*/(
		f(arr[i])
	)
	let m = v
	while (++i < arr.length) {
		v = /**@type {T extends NumberConstructor ? number : T extends BigIntConstructor ? bigint : string}*/(
			f(arr[i])
		)
		if (op ? v > m : v < m) m = v
	}
	return m
}

/**
Logarithm in any base
@template {numeric} T
@param {T} x get exponent of this
@param {T} b base of logarithm
@return {T extends number ? number : numeric}
*/
export const logB = (x, b) => {
	//@ts-ignore
	if (x < 0 || b == 0 || b == 1) return NaN
	//@ts-ignore
	if (x == 0) return -Infinity
	//@ts-ignore
	if (x == 1) return autoN(0, x)
	//@ts-ignore
	if (typeof x != 'bigint') return lb(x) / lb(b)

	const b_int = IntN(b)
	let i = 0n
	while (/**@type {bigint}*/(x) /= b_int) i++
	//@ts-ignore
	return i
}