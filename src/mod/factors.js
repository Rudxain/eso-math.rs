import '../typedefs'

import { isInt, isInfNAN, isNAN } from './value check'
import { autoN } from './sanitize'
import { abs, isEven } from './std'
import { trunc } from '../lib/rounding'

/**
check if `n` is strictly divisible by `d`
@param {unknown} n dividend/numerator
@param {unknown} d divisor/denominator
*/
export const isDivisible = (n, d) => {
	n = n?.valueOf?.()
	d = d?.valueOf?.()
	return typeof n == typeof d &&
		isInt(n) && isInt(d) &&
		d != 0 &&
		//@ts-ignore
		n % d == 0
}

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

/**
Greatest Common Divisor

returns correct values for some non-ints (rounding errors can happen)
@template {numeric} T
@param {...T} args
*/
export const gcd = (...args) =>
	args.length ? args.reduce(Euclid, autoN(0, args[0])) : 0

/**
Lowest Common Multiple

returns correct values for some non-ints (rounding errors can happen)
@template {numeric} T
@param {...T} args
*/
export const lcm = (...args) =>
	//@ts-ignore
	args.length ? args.reduce((a, b) => 0 == a && 0 == b ? a ^ b : a / gcd(a, b) * b, autoN(1, args[0])) : 1

//returns ALL divisors of x, proper and trivial
//it's a generator, because arrays are too expensive for memory
/**
@template {numeric} T
@param {T} x
*/
export const divisors = function* (x) {
	x = trunc(abs(x))
	if (isInfNAN(x)) return

	const
		n1 = autoN(1, x),
		n2 = autoN(2, x),
		n3 = autoN(3, x)

	yield n1

	if (isEven(x)) yield n2

	//@ts-ignore
	for (let i = n3; i <= x; i += n2)
		if (!(x % i)) yield i
}

/**
convert to smallest fraction that represents the same number
@template {numeric} T
@param {T} x
@return {fraction<T>}
*/
export const toFraction = x => {
	if (isInt(x) || isNAN(x)) return [x, autoN(1, x)]

	const s = x < 0
	if (s) x = -x //abs

	if (x == Infinity) return [s ? -1 : 1, 0]

	const n = trunc(x)
	x -= n

	let f0 = [0, 1], f1 = [1, 1], midOld = NaN // ensure same-type comparison
	//eslint-disable-next-line no-constant-condition
	while (true) {
		/**@type {fraction<T>}*/
		const fm = [f0[0] + f1[0], f0[1] + f1[1]]
		const mid = fm[0] / fm[1]
		// guaranteed to halt
		if (mid == x || midOld == mid) {
			fm[0] += n * fm[1]
			if (s) fm[0] *= -1
			return fm
		}
		mid < x ? f0 = fm : f1 = fm
		midOld = mid
	}
}