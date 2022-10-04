import '../typedefs'
import {isBigInt as isIntN} from '../helper/type check'
import {isInt, isNegZero} from '../helper/value check'
import {autoN, toNumeric} from '../helper/sanitize'
import {trunc, floor} from './rounding'

const IntN = BigInt, lb = Math.log2 //in general, lb has better precision and performance than ln

/**
absolute value
@param {numeric} x
*/
export const abs = x => x < 0 || isNegZero(x) ? -x : x

/**@param {numeric} x*/
export const sign = x => x == 0 ? autoN(0, x) : (x < 0 ? autoN(-1, x) : autoN(1, x))
/**
get a 2-tuple with both the sign and absolute value of `x`. similar to `divrem`
@param {numeric} x*/
export const signabs = x => [sign(x), abs(x)]

/**
calculate truncated division with remainder, returning both values in a 2-tuple
@param {numeric} n dividend/numerator
@param {numeric} d divisor/denominator
*/
export const divrem = (n, d) => [trunc(n / d), n % d]

/**
calculate Euclidean division with remainder, returning both values in a 2-tuple
@param {numeric} n dividend/numerator
@param {numeric} d divisor/denominator
*/
export const divEuclid = (n, d) => floor(n / abs(d)) * sign(d) //this is incorrect for `BigInt`s

export const isEven = x => isInt(x) && x % autoN(2, x) == 0
//`!isEven` is wrong, because `NaN` is none of them
export const isOdd = x => isInt(x) && x % autoN(2, x) != 0

/**
@param {numstr} x
@param {numstr} min
@param {numstr} max
*/
export const clamp = (x, min, max) => x > max ? max : x < min ? min : x

/**
@param {(numeric|string)[]} arr values to compare
@param {boolean} op falsy: min, truthy: max
@param {function} f type coercion fn, eg. `Number`, `BigInt`, `String`
*/
export const minmax = (arr, op, f) => {
	let i = 0, v = f(arr[i]), m = v
	while (++i < arr.length) {
		v = f(arr[i])
		if (op ? v > m : v < m) m = v
	}
	return m
}

/**
Logarithm in any base
@param {numeric} x get exponent of this
@param {numeric} [b=2] base of logarithm
@return {numeric}
*/
export const logB = (x, b = 2) => {
	x = toNumeric(x)
	b = toNumeric(b)

	if (x < 0 || b == 0 || b == 1) return NaN
	if (x == 0) return -Infinity
	if (x == 1) return autoN(0, x)
	if (!isIntN(x)) return lb(x) / lb(b)

	b = IntN(b)
	let i = 0n
	while (x /= b) i++
	return i
}