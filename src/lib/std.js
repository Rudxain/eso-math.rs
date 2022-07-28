import {isBigInt as isIntN} from '../helper/type check'
import {isNegZero} from '../helper/value check'
import {autoN, toNumeric} from '../helper/sanitize'
import {trunc} from './rounding'

const IntN = BigInt, lb = Math.log2 //in general, lb has better precision and performance than ln

//should these use `toNumeric`?
export const
	abs = x => x < 0 || isNegZero(x) ? -x : x,
	sign = x => x == 0 ? autoN(x, x) : (x < 0 ? autoN(-1, x) : autoN(1, x)),
	signabs = x => [sign(x), abs(x)],
	divrem = (n, d) => [trunc(n / d), n % d],
	clamp = (x, min, max) => x > max ? max : x < min ? min : x

/**
@param {boolean} op falsy: min, truthy: max
@param {function} f is the type coercion fn
*/
export const minmax = (arr, op, f) => {
	let i = 0, v = f(arr[i]), m = v
	while (++i < arr.length) {v = f(arr[i]); if (op ? v > m : v < m) m = v}
	return m
}

/**
Logarithm in any base
@param {numeric} x get exponent of this
@param {numeric} [b=2] base of logarithm
@return {numeric}
*/
export const logB = (x, b = 2) => {
	x = toNumeric(x); b = toNumeric(b)
	if (x < 0 || b == 0 || b == 1) return NaN
	if (x == 0) return -Infinity
	if (x == 1) return x^x
	if (!isIntN(x)) return lb(x) / lb(b)
	b = IntN(b)
	let i = 0n; while (x /= b) i++
	return i
}