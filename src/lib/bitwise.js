import '../typedefs'

import { MANTISSA_SIZE } from '../mod/const'
import { isInt, isInfNAN } from '../mod/value check'
import { autoN } from '../mod/sanitize'
import { abs } from '../mod/std'
import { trunc } from './rounding'
import { F64_to_I64 as castFloat2IntN } from '../mod/bit cast'
import { M as nthMersenne } from './Mersenne'

const IntN = BigInt, RangeErr = RangeError

/**
maximum float exponent
{@link Math.log2}({@link Number.MAX_VALUE}) = ilb(2^1024 - 1) + 1
*/
const MAX_EXP = 0x400

const MANTISSA_MASK = /**@type {0xfffffffffffffn}*/(IntN(nthMersenne(MANTISSA_SIZE)))

/**
@param {bigint} n binary numeral to measure
@param {bigint} [word_size=1n] 1: bit, 8: Byte, 16: word, 32: D-word, 64: Q-word
@param {bigint} [init=0] initial counter.
if `word_size` = 1 then: 0: lb, 1: length (ignore sign), 2: length (include sign)
*/
export const sizeOf = (n, word_size = 1n, init = 0n) => {
	n = abs(n)
	while (n >>= word_size) init++
	return init
}

/**
count trailing zeros in binary.
extended to non-ints, so negative exponents are supported.
@template {numeric} T
@param {T} n
@return {[numeric, T]} 2-tuple format [CTZ, trimmed `n`]
*/
export const ctztrim = n => {
	if (n === 0) return [MAX_EXP, n]
	if (n === 0n) return [Infinity, n]

	const B = typeof n == 'bigint'
	const n1 = /**@type {T extends bigint ? 1n : 1}*/(B ? 1n : 1)
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
*/
export const ctz = n => ctztrim(n)[0]
/**
strip all binary trailing zeros.
intented as a high-speed alternative to `n >>= ctz(n)`
@template {numeric} T
@param {T} n
*/
export const trim = n => ctztrim(n)[1]

/**
for educational purposes see: en.wikipedia.org/wiki/Hamming_weight#Efficient_implementation

without optimization, it would be slow
@template {numeric} T
@param {T} x
*/
export const popCount = x => {
	/**
	@template {numeric} T
	@param {T} x
	*/
	const popcnt = x => {
		const B = /**@type {T extends bigint ? true : false}*/(typeof x == 'bigint')
		const n1 = /**@type {T extends bigint ? 1n : 1}*/(B ? 1n : 1)
		let c = /**@type {T extends bigint ? 0n : 0}*/(B ? 0n : 0)
		while (x) {
			//@ts-ignore
			c += x & n1
			x = /**@type {T}*/(B ? /**@type {bigint}*/(x) >> 1n : x >>> 1)
		}
		return c
	}
	if (typeof x == 'bigint') return x < 0n ? Infinity : popcnt(x)
	if (isInfNAN(x)) return NaN

	x = abs(trunc(x))
	//mantissa popcnt, because exponent doesn't matter
	return Number(popcnt(castFloat2IntN(/**@type {number}*/(x)) & MANTISSA_MASK) + 1n)
}

/**
carryless multiplication
@param {bigint} a
@param {bigint} b
*/
export const clmul = (a, b) => {
	if (a < 0n || b < 0n)
		throw new RangeErr('negative CLMul is undefined')

	let prod = 0n
	while (b) {
		prod ^= (b & 1n) && a
		b >>= 1n
		a <<= 1n
	}
	return prod
}