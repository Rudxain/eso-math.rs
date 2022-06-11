import {isInt} from '../helper/value check'
import {toBigInt} from '../helper/sanitize'
import {Gosper, Gamma, Lanczos} from '../lib/factorial'

const RangeErr = RangeError

Math.factorial = function(x) {
	if ((x = +x) >= 171) return Infinity
	if (x < 0 || x != x) return NaN
	/*
	We could precompute an int lookup table, and use spline interpolation for faster processing.
	The problem is that if `x` is at the extreme, the output would be `NaN` unless we use extrapolation
	*/
	if ( !isInt(x) ) return [Gosper, Gamma, Lanczos][2](x)
	let out = 1
	while (x > 0) out *= x--
	return out
}
//https://en.wikipedia.org/wiki/Factorial#Properties
BigInt.factorial = function(n) {
	if ((n = toBigInt(n)) < 0n) throw new RangeErr('return value is NaN')
	let out = 1n
	while (n > 0n) out *= n--
	return out
}

export {Math, BigInt}