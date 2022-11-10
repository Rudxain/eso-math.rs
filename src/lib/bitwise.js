import '../typedefs'

import { isBigInt as isIntN } from '../mod/type check'
import { isInt, isInfNAN } from '../mod/value check'
import { autoN } from '../mod/sanitize'
import { abs } from './std'
import { trunc } from './rounding'
import { F64_to_I64 as castFloat2IntN } from './bit cast'
import { M as nthMersenne } from './Mersenne'

const IntN = BigInt

/**
@param {bigint} n binary numeral to measure
@param {bigint} [word_size=1n] 1: bit, 8: Byte, 16: word, 32: D-word, 64: Q-word
@param {bigint} [init=0] initial counter.
if `word_size` = 1 then: 0: lb, 1: length (ignore sign), 2: length (include sign)
*/
export const sizeOf = (n, word_size = 1n, init = 0n) => {
	n = abs(n)
	//eslint-disable-next-line no-constant-condition
	while (true) {
		n >>= word_size
		if (n == 0n) break
		init++
	}
	return init
}

/**
count trailing zeros in binary.
extended to non-ints, so negative exponents are supported.
@template {numeric} T
@param {T} n
@return {[T, T]} 2-tuple format [CTZ, trimmed `n`]
*/
export const ctztrim = n => {
	if (n === 0) return [0x400, n] //(rounded) `Math.log2(Number.MAX_VALUE)` = (truncated) ilb(2 ^ 1024 - 1) + 1
	if (n === 0n) return [Infinity, n]

	const B = isIntN(n), n1 = B ? 1n : 1
	let c = autoN(0, n)

	if (!B && !isInt(+n)) {
		n = +n
		if (isInfNAN(n)) return [NaN, n]
		n %= 1
		do { c--; n *= 2 } while (n < 1)
	}
	else
		while (!(n & n1)) { c++; n = B ? n >> 1n : n / 2 }
	return [c, n]
}

/**
Count binary Trailing Zeros
@template {numeric} T
@param {T} n
@return {T}
*/
export const ctz = n => ctztrim(n)[0]
/**
strip all binary trailing zeros.
intented as a high-speed alternative to `n >>= ctz(n)`
@template {numeric} T
@param {T} n
@return {T}
*/
export const trim = n => ctztrim(n)[1]

/**
for educational purposes see: en.wikipedia.org/wiki/Hamming_weight#Efficient_implementation

without optimization, it would be slow
@param {numeric} x
@return {numeric}
*/
export const popCount = x => {
	const popcnt = x => {
		const B = isIntN(x); let c = B ? 0n : 0
		while (x) { c += x & (B ? 1n : 1); x = B ? x >> 1n : x >>> 1 }
		return c
	}
	if (isIntN(x)) return x < 0n ? Infinity : popcnt(x)
	if (isInfNAN(x)) return NaN

	x = abs(trunc(x))
	//mantissa popcnt, because exponent doesn't matter
	return Number(popcnt(castFloat2IntN(x) & nthMersenne(52n)) + 1n)
}

/**
carryless multiplication
@param {numeric} a
@param {numeric} b
@return {numeric} `NaN` for negatives
*/
export const clmul = (a, b) => {
	if (a < 0 || b < 0 || isInfNAN(a) || isInfNAN(b))
		return NaN
	a = IntN(trunc(a))
	b = IntN(trunc(b))

	let prod = 0n
	while (b) {
		prod ^= (b & 1n) && a
		b >>= 1n
		a <<= 1n
	}
	return prod

}