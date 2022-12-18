import '../typedefs'

import { MANTISSA_SIZE } from './const'
import { isInt, isInfNAN } from './value check'
import { autoN } from './sanitize'
import { abs } from './std'
import { trunc } from '../lib/rounding'
import { F64_to_I64 as castFloat2IntN } from './bit cast'
import { M as nthMersenne } from '../lib/Mersenne'

const IntN = BigInt

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
@return {[T extends bigint ? numeric : number, T]} 2-tuple format [CTZ, trimmed `n`]
*/
export const ctztrim = n => {
	if (n === 0)
		//@ts-ignore
		return [MAX_EXP, n]
	if (n === 0n)
		//@ts-ignore
		return [Infinity, n]

	const isIntN = typeof n == 'bigint'
	const n1 = /**@type {T extends bigint ? 1n : 1}*/(isIntN ? 1n : 1)
	let c = autoN(0, n)

	if (isInt(n))
		while (!(n & n1)) {
			c++
			//@ts-ignore
			n = isIntN ? n >> 1n : n / 2
		}
	else {
		if (isInfNAN(n))
			//@ts-ignore
			return [NaN, n]
		//@ts-ignore
		n %= 1
		do {
			c--
			//@ts-ignore
			n *= 2
		} while (n < 1)
	}
	//@ts-ignore
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