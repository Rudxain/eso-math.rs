import {isBigInt as isIntN} from '../helper/type check'
import {isInfNaN} from '../helper/value check'
import {toNumeric} from '../helper/sanitize'
import {trunc, floor} from './rounding'
import {sizeOf} from './bitwise'

const Float = Number, IntN = BigInt, lb = Math.log2

//n: degree, b: base, e: exponent
export const HyperOP = (n, b, e) => {
	n = trunc(Float(n))
	if (n < 0 || isInfNaN(n)) return NaN
	let ONE = e^e; ONE++
	//`switch` is overrated
	if (n < 4) return [e + ONE, b + e, b * e, b ** e][n]
	e = toNumeric(e)
	if (e < 0 || e != e) return NaN
	b = toNumeric(b)
	if ((e > 2**32 && b > 1) || (b > 2**52 && e > 2)) return Infinity
	if (e == 0) return ONE
	let x = b
	n--
	while (--e > 0) x = HyperOP(n, b, x)
	return x
}

export const Ackermann = (m, n) => HyperOP(m, 2n, IntN(n) + 3n) - 3n
//https://en.wikipedia.org/wiki/Ackermann_function#Inverse
export const Ackermann_inv = (m, n) => {//"Inverse"
	let x = m^m^n^n, i = x**x //auto 0 and 1 respectively
	const lbn = isIntN(n) ? sizeOf(n, 1n, 0n) : lb(n)
	while (x < lbn) x = Ackermann(i++, floor(m / n))
	return x
}

export const Graham = n => {
	n = IntN(n)
	if (n < 0n) return NaN
	let x = 4n
	while (n--) x = HyperOP(x + 2n, 3n, 3n)
	return x
}